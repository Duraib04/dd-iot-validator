// Vercel API Route: Get Next Interview Question
// POST /api/question

import { openai, supabase } from './config.js';
import { v4 as uuidv4 } from 'uuid';

const QUESTION_GENERATOR_PROMPT = `You are a technical interviewer for DD IoT Solutions. Generate a technical or behavioral question. Return ONLY valid JSON:
{
  "question": "<the question>",
  "type": "<technical|behavioral>",
  "expectedKeywords": ["<keyword1>", "<keyword2>"],
  "scoringRubric": "<how to evaluate>"
}`;

const FALLBACK_QUESTIONS = [
  {
    question: 'What experience do you have with IoT systems or embedded devices?',
    type: 'technical',
    expectedKeywords: ['IoT', 'embedded', 'devices'],
    scoringRubric: 'Good: Mentions projects, Excellent: Technical details',
  },
  {
    question: 'Describe a programming project where you solved a complex problem.',
    type: 'technical',
    expectedKeywords: ['debug', 'optimize', 'algorithm'],
    scoringRubric: 'Good: Clear solution, Excellent: Lessons learned',
  },
  {
    question: 'How do you approach learning a new technology?',
    type: 'behavioral',
    expectedKeywords: ['documentation', 'practice', 'community'],
    scoringRubric: 'Good: Methodical, Excellent: Shows curiosity',
  },
  {
    question: 'Tell us about a time you debugged a difficult hardware/software issue.',
    type: 'technical',
    expectedKeywords: ['debugging', 'root cause', 'testing'],
    scoringRubric: 'Good: Process, Excellent: Prevention',
  },
  {
    question: 'How do you communicate technical concepts to non-technical people?',
    type: 'behavioral',
    expectedKeywords: ['simplify', 'analogies', 'visual'],
    scoringRubric: 'Good: Clear, Excellent: Adapts to audience',
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID required' });
    }

    // Get existing questions
    const { data: existingQuestions } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('candidate_id', candidateId);

    const questionNumber = (existingQuestions?.length || 0) + 1;

    if (questionNumber > 10) {
      return res.status(400).json({ error: 'Interview complete (10 questions max)' });
    }

    // Use fallback question for simplicity
    const questionData = FALLBACK_QUESTIONS[(questionNumber - 1) % FALLBACK_QUESTIONS.length];

    // Save question
    const questionId = uuidv4();
    await supabase.from('interview_questions').insert([
      {
        id: questionId,
        candidate_id: candidateId,
        question_number: questionNumber,
        question_text: questionData.question,
        question_type: questionData.type,
        difficulty_level: Math.min(3 + Math.floor(questionNumber / 3), 10),
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        questionId,
        questionNumber,
        question: questionData.question,
        type: questionData.type,
        difficulty: Math.min(3 + Math.floor(questionNumber / 3), 10),
      },
    });
  } catch (error) {
    console.error('Question error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate question' });
  }
}
