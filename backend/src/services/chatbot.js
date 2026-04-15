import OpenAI from 'openai';
import config from '../config/index.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const QUESTION_GENERATOR_PROMPT = `You are a technical interviewer for DD IoT Solutions, hiring for IoT engineer roles.

Generate a technical or behavioral question. Return ONLY valid JSON (no markdown):
{
  "question": "<the interview question>",
  "type": "<technical|behavioral>",
  "expectedKeywords": ["<keyword1>", "<keyword2>"],
  "scoringRubric": "<how to evaluate the answer: 0-3 points poor, 4-6 medium, 7-10 excellent>"
}

Context:
- Candidate's resume analysis: ${CANDIDATE_CONTEXT}
- Question number: ${QUESTION_NUMBER}
- Previous answers quality: ${PREVIOUS_QUALITY}
- Adjust difficulty: ${DIFFICULTY_ADJUSTMENT}

Focus on: IoT, embedded systems, real-time systems, problem-solving, and communication.`;

const ANSWER_EVALUATION_PROMPT = `You are evaluating an interview answer for an IoT engineer position.

Candidate's Answer: "${CANDIDATE_ANSWER}"

Interview Question: "${INTERVIEW_QUESTION}"

Expected Keywords: ${EXPECTED_KEYWORDS}

Scoring Rubric: ${SCORING_RUBRIC}

Evaluate and return ONLY valid JSON (no markdown):
{
  "score": <0-10 integer>,
  "feedback": "<specific feedback on the answer>",
  "keywordsCovered": ["<keyword1>", "<keyword2>"],
  "communicationScore": <0-10>,
  "technicalDepth": <0-10>,
  "strengths": "<what was good>",
  "improvements": "<areas to improve>"
}`;

export const chatbotService = {
  /**
   * Generate next interview question based on candidate context
   */
  async generateQuestion(candidateContext, questionNumber, previousAnswers = []) {
    try {
      // Calculate previous performance for adaptive difficulty
      let previousQuality = 'none';
      let difficultyAdjustment = 'moderate';

      if (previousAnswers.length > 0) {
        const avgScore = previousAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / previousAnswers.length;
        previousQuality = `average quality: ${avgScore}/10`;

        // Adapt difficulty
        if (avgScore >= 8) difficultyAdjustment = 'increase (candidate is strong)';
        else if (avgScore <= 4) difficultyAdjustment = 'decrease (candidate is struggling)';
      }

      const prompt = QUESTION_GENERATOR_PROMPT
        .replace('${CANDIDATE_CONTEXT}', JSON.stringify(candidateContext))
        .replace('${QUESTION_NUMBER}', questionNumber)
        .replace('${PREVIOUS_QUALITY}', previousQuality)
        .replace('${DIFFICULTY_ADJUSTMENT}', difficultyAdjustment);

      const message = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = message.choices[0].message.content.trim();
      
      // Extract JSON from response (handle markdown code blocks)
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      const questionData = JSON.parse(jsonContent);

      return {
        question: questionData.question,
        type: questionData.type,
        expectedKeywords: questionData.expectedKeywords,
        scoringRubric: questionData.scoringRubric,
        difficulty: this.calculateDifficulty(questionNumber, previousQuality),
      };
    } catch (error) {
      console.error('Question generation error:', error);
      // Fallback to predefined questions
      return this.getFallbackQuestion(questionNumber);
    }
  },

  /**
   * Evaluate candidate's answer
   */
  async evaluateAnswer(question, candidateAnswer, expectedKeywords, scoringRubric) {
    try {
      const prompt = ANSWER_EVALUATION_PROMPT
        .replace('${CANDIDATE_ANSWER}', candidateAnswer)
        .replace('${INTERVIEW_QUESTION}', question)
        .replace('${EXPECTED_KEYWORDS}', JSON.stringify(expectedKeywords))
        .replace('${SCORING_RUBRIC}', scoringRubric);

      const message = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = message.choices[0].message.content.trim();
      
      // Extract JSON from response
      let jsonContent = content;
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      const evaluation = JSON.parse(jsonContent);

      return {
        score: Math.min(Math.max(evaluation.score, 0), 10),
        feedback: evaluation.feedback,
        communication: evaluation.communicationScore,
        technical: evaluation.technicalDepth,
        keywordsCovered: evaluation.keywordsCovered,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      };
    } catch (error) {
      console.error('Answer evaluation error:', error);
      return {
        score: 5,
        feedback: 'Could not evaluate answer automatically. Please review manually.',
        communication: 5,
        technical: 5,
        keywordsCovered: [],
        strengths: 'Attempted to answer the question.',
        improvements: 'Could not provide automated feedback.',
      };
    }
  },

  /**
   * Calculate difficulty level (1-10)
   */
  calculateDifficulty(questionNumber, previousQuality) {
    let difficulty = 5; // Start at medium

    if (questionNumber <= 2) {
      difficulty = 3; // Start easy to build confidence
    } else if (questionNumber >= 8) {
      difficulty = 7; // Increase difficulty for later questions
    }

    // Adjust based on previous performance
    if (previousQuality.includes('8') || previousQuality.includes('9')) {
      difficulty = Math.min(difficulty + 2, 10);
    } else if (previousQuality.includes('3') || previousQuality.includes('2')) {
      difficulty = Math.max(difficulty - 2, 1);
    }

    return difficulty;
  },

  /**
   * Fallback questions if AI fails
   */
  getFallbackQuestion(questionNumber) {
    const fallbackQuestions = [
      {
        question: 'What experience do you have with IoT systems or embedded devices?',
        type: 'technical',
        expectedKeywords: ['IoT', 'embedded', 'devices', 'protocols', 'microcontroller'],
        scoringRubric: 'Good: Mentions specific IoT projects, Excellent: Details technical implementation',
        difficulty: 3,
      },
      {
        question: 'Describe a programming project where you solved a complex problem.',
        type: 'technical',
        expectedKeywords: ['debug', 'optimize', 'algorithm', 'performance', 'solution'],
        scoringRubric: 'Good: Clear problem and solution, Excellent: Mentions approach and lessons learned',
        difficulty: 4,
      },
      {
        question: 'How do you approach learning a new technology or framework?',
        type: 'behavioral',
        expectedKeywords: ['documentation', 'practice', 'resources', 'community', 'projects'],
        scoringRubric: 'Good: Methodical approach, Excellent: Shows continuous learning mindset',
        difficulty: 4,
      },
      {
        question: 'Tell us about a time you had to debug a difficult hardware/software integration issue.',
        type: 'technical',
        expectedKeywords: ['debugging', 'root cause', 'testing', 'collaboration', 'solution'],
        scoringRubric: 'Good: Clear debugging process, Excellent: System thinking and prevention',
        difficulty: 6,
      },
      {
        question: 'How do you communicate technical concepts to non-technical stakeholders?',
        type: 'behavioral',
        expectedKeywords: ['simplify', 'analogies', 'visual', 'clear', 'examples'],
        scoringRubric: 'Good: Practical explanation, Excellent: Adapts to audience',
        difficulty: 5,
      },
    ];

    return fallbackQuestions[(questionNumber - 1) % fallbackQuestions.length];
  },

  /**
   * Calculate communication score from all answers
   */
  calculateCommunicationScore(allEvaluations) {
    if (allEvaluations.length === 0) return 0;

    const avgCommunication = allEvaluations.reduce((sum, e) => sum + (e.communication || 5), 0) / allEvaluations.length;
    return Math.round(avgCommunication);
  },

  /**
   * Calculate problem-solving score from technical answers
   */
  calculateProblemSolvingScore(allEvaluations) {
    const technicalAnswers = allEvaluations.filter(e => e.technical);

    if (technicalAnswers.length === 0) return 0;

    const avgTechnical = technicalAnswers.reduce((sum, e) => sum + (e.technical || 5), 0) / technicalAnswers.length;
    return Math.round(avgTechnical);
  },
};

export default chatbotService;
