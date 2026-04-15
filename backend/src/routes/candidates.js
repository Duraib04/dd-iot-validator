import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  asyncHandler,
  validateRequest,
} from '../middleware/index.js';
import {
  ValidationError,
  validators,
  response,
} from '../utils/errors.js';
import {
  extractPdfText,
  validatePdfFile,
  cleanText,
  extractEmail,
} from '../utils/pdf.js';
import db from '../services/database.js';
import resumeService from '../services/resumeParser.js';
import chatbotService from '../services/chatbot.js';
import scoringService from '../services/scoring.js';

const router = express.Router();

// Multer configuration for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new ValidationError('Only PDF files are allowed'));
    } else {
      cb(null, true);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * POST /api/candidates/upload
 * Upload resume and create candidate profile
 */
router.post(
  '/upload',
  upload.single('resume'),
  asyncHandler(async (req, res) => {
    // Validate inputs
    if (!req.file) {
      throw new ValidationError('No resume file provided');
    }

    const { email, fullName } = req.body;

    if (!validators.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!validators.isNonEmptyString(fullName)) {
      throw new ValidationError('Full name is required');
    }

    // Validate PDF
    const validation = validatePdfFile(req.file);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(', '));
    }

    // Extract text from PDF
    const resumeText = await extractPdfText(req.file.buffer);
    const cleanedText = cleanText(resumeText);

    // Create candidate record
    let candidate = await db.createCandidate(email, fullName);

    // Update candidate with resume
    candidate = await db.updateCandidate(candidate.id, {
      resume_text: cleanedText,
      resume_url: `resume_${candidate.id}.pdf`,
    });

    // Extract resume information using AI
    const analysis = await resumeService.extractResumeInfo(cleanedText);

    // Store resume analysis
    await db.upsertResumeAnalysis(candidate.id, analysis);

    // Store skills
    if (analysis.skills && analysis.skills.length > 0) {
      await db.insertSkills(candidate.id, analysis.skills);
    }

    // Calculate resume scores
    const resumeScores = resumeService.scoreResume(analysis);

    res.status(201).json(
      response.success(
        {
          candidateId: candidate.id,
          email: candidate.email,
          fullName: candidate.full_name,
          analysis: {
            yearsOfExperience: analysis.yearsOfExperience,
            educationLevel: analysis.educationLevel,
            technologies: analysis.technologies,
            iotRelevanceScore: analysis.iotRelevanceScore,
            strengths: analysis.strengths,
          },
          resumeScores,
        },
        'Resume processed successfully',
        201
      )
    );
  })
);

/**
 * GET /api/candidates/:candidateId
 * Get candidate profile
 */
router.get(
  '/:candidateId',
  asyncHandler(async (req, res) => {
    const { candidateId } = req.params;

    if (!validators.isValidUUID(candidateId)) {
      throw new ValidationError('Invalid candidate ID');
    }

    const candidate = await db.getCandidateById(candidateId);
    if (!candidate) {
      throw new ValidationError('Candidate not found');
    }

    const analysis = await db.getResumeAnalysisByCandidateId(candidateId);
    const skills = await db.getSkillsByCandidateId(candidateId);

    res.json(
      response.success({
        candidate,
        analysis,
        skills,
      })
    );
  })
);

/**
 * POST /api/candidates/:candidateId/next-question
 * Get next interview question
 */
router.post(
  '/:candidateId/next-question',
  asyncHandler(async (req, res) => {
    const { candidateId } = req.params;

    if (!validators.isValidUUID(candidateId)) {
      throw new ValidationError('Invalid candidate ID');
    }

    const candidate = await db.getCandidateById(candidateId);
    if (!candidate) {
      throw new ValidationError('Candidate not found');
    }

    // Get existing questions and answers
    const questions = await db.getQuestionsByCandidateId(candidateId);
    const answers = await db.getAnswersByCandidateId(candidateId);

    // Check if interview is complete (max 10 questions)
    const questionNumber = questions.length + 1;
    if (questionNumber > 10) {
      return res.status(400).json(
        response.error('Interview complete (10 questions maximum)', 400)
      );
    }

    // Get resume analysis for context
    const analysis = await db.getResumeAnalysisByCandidateId(candidateId);

    // Get previous evaluations for adaptive difficulty
    const previousEvaluations = answers.map(a => ({
      score: a.score || 5,
      communication: a.feedback?.includes('communication') ? 7 : 5,
    }));

    // Generate question
    const questionData = await chatbotService.generateQuestion(
      analysis,
      questionNumber,
      previousEvaluations
    );

    // Save question
    const savedQuestion = await db.insertQuestion(
      candidateId,
      questionNumber,
      questionData.question,
      questionData.type,
      questionData.difficulty
    );

    res.json(
      response.success({
        questionId: savedQuestion.id,
        questionNumber,
        question: questionData.question,
        type: questionData.type,
        difficulty: questionData.difficulty,
      })
    );
  })
);

/**
 * POST /api/candidates/:candidateId/submit-answer
 * Submit interview answer
 */
router.post(
  '/:candidateId/submit-answer',
  asyncHandler(async (req, res) => {
    const { candidateId } = req.params;
    const { questionId, answer } = req.body;

    // Validate inputs
    if (!validators.isValidUUID(candidateId)) {
      throw new ValidationError('Invalid candidate ID');
    }

    if (!validators.isValidUUID(questionId)) {
      throw new ValidationError('Invalid question ID');
    }

    if (!validators.isNonEmptyString(answer)) {
      throw new ValidationError('Answer cannot be empty');
    }

    // Get question details
    const questions = await db.getQuestionsByCandidateId(candidateId);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
      throw new ValidationError('Question not found');
    }

    // Evaluate answer using AI
    const evaluation = await chatbotService.evaluateAnswer(
      question.question_text,
      answer,
      question.expectedKeywords || [],
      question.scoringRubric || 'Standard rubric: 0-10 score'
    );

    // Save answer
    const savedAnswer = await db.insertAnswer(
      candidateId,
      questionId,
      answer,
      evaluation.score,
      evaluation.feedback
    );

    res.status(201).json(
      response.success({
        answerId: savedAnswer.id,
        score: evaluation.score,
        feedback: evaluation.feedback,
        communication: evaluation.communication,
        technical: evaluation.technical,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      }, 'Answer evaluated successfully', 201)
    );
  })
);

/**
 * POST /api/candidates/:candidateId/finalize
 * Complete interview and calculate final scores
 */
router.post(
  '/:candidateId/finalize',
  asyncHandler(async (req, res) => {
    const { candidateId } = req.params;

    if (!validators.isValidUUID(candidateId)) {
      throw new ValidationError('Invalid candidate ID');
    }

    const candidate = await db.getCandidateById(candidateId);
    if (!candidate) {
      throw new ValidationError('Candidate not found');
    }

    // Get all data
    const analysis = await db.getResumeAnalysisByCandidateId(candidateId);
    const answers = await db.getAnswersByCandidateId(candidateId);

    if (!analysis) {
      throw new ValidationError('Resume analysis not found. Upload resume first.');
    }

    // Calculate scores
    const resumeScores = scoringService.scoreResumeAnalysis(analysis);
    const interviewScores = scoringService.scoreInterviewAnswers(answers);
    const finalScores = scoringService.calculateFinalScore(resumeScores, interviewScores);

    // Save scores
    await db.upsertScore(candidateId, {
      hardware: finalScores.hardware,
      programming: finalScores.programming,
      problemSolving: finalScores.problemSolving,
      communication: finalScores.communication,
      decision: finalScores.decision,
      reason: finalScores.reason,
    });

    // Update candidate status
    await db.updateCandidate(candidateId, { status: 'completed' });

    // Generate report
    const report = scoringService.generateReport(finalScores, analysis, answers);

    res.json(
      response.success({
        scores: finalScores,
        report,
        questionsAnswered: answers.length,
      })
    );
  })
);

/**
 * GET /api/candidates/:candidateId/results
 * Get final evaluation results
 */
router.get(
  '/:candidateId/results',
  asyncHandler(async (req, res) => {
    const { candidateId } = req.params;

    if (!validators.isValidUUID(candidateId)) {
      throw new ValidationError('Invalid candidate ID');
    }

    // Get summary
    const summary = await db.getCandidateSummary(candidateId);

    if (!summary) {
      throw new ValidationError('Results not found or candidate not finalized');
    }

    const scores = await db.getScoreByCandidateId(candidateId);
    const analysis = await db.getResumeAnalysisByCandidateId(candidateId);

    res.json(
      response.success({
        summary,
        scores,
        analysis: {
          yearsOfExperience: analysis?.years_of_experience,
          educationLevel: analysis?.education_level,
          iotRelevanceScore: analysis?.iot_relevance_score,
          strengths: analysis?.strengths,
          weaknesses: analysis?.weaknesses,
        },
      })
    );
  })
);

export default router;
