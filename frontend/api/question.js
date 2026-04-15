// Vercel API Route: Get Next Interview Question
// POST /api/question

import { supabase } from './config.js';
import { v4 as uuidv4 } from 'uuid';
import questions from '../src/data/questions.json' assert { type: 'json' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID required' });
    }

    // Get existing questions answered by this candidate
    const { data: existingAnswers } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('candidate_id', candidateId);

    const questionNumber = (existingAnswers?.length || 0) + 1;

    if (questionNumber > 10) {
      return res.status(400).json({ error: 'Interview complete (10 questions max)' });
    }

    // Get question from static list (rotate through questions)
    const questionIndex = (questionNumber - 1) % questions.length;
    const questionData = questions[questionIndex];

    // Just log that candidate saw this question (don't store the question itself)
    // Questions are static in repo, answers will be stored in interview_answers
    
    // Optional: Store metadata about which question # this was
    await supabase
      .from('interview_answers')
      .insert([
        {
          id: uuidv4(),
          candidate_id: candidateId,
          question_id: questionData.id,
          answer_text: null, // Will be filled in by /api/answer
          question_number: questionNumber,
          asked_at: new Date().toISOString(),
        },
      ]);

    return res.status(200).json({
      success: true,
      data: {
        questionNumber,
        question: questionData.question,
        type: questionData.type,
        difficulty: questionData.difficulty,
        questionId: questionData.id,
      },
    });
  } catch (error) {
    console.error('Question error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get question' });
  }
}
