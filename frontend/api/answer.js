// Vercel API Route: Submit Answer & Get Score
// POST /api/answer

import { openai, supabase } from './config.js';
import { v4 as uuidv4 } from 'uuid';

const ANSWER_EVALUATOR_PROMPT = `You are a technical interview evaluator for DD IoT Solutions. 
Evaluate the answer on a scale of 0-10. Return ONLY valid JSON:
{
  "score": <0-10>,
  "technicalAccuracy": <0-10>, 
  "communication": <0-10>,
  "problemSolving": <0-10>,
  "feedback": "<constructive feedback>"
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidateId, questionId, answerText } = req.body;

    if (!candidateId || !questionId || !answerText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get question details
    const { data: question } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Evaluate answer using OpenAI
    let evaluation;
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: ANSWER_EVALUATOR_PROMPT },
          {
            role: 'user',
            content: `
Question (${question.question_type}): ${question.question_text}
Answer: ${answerText}
Evaluate this answer.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const responseText = response.choices[0].message.content.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (openaiError) {
      // Fallback: Simple scoring based on answer length
      evaluation = {
        score: Math.min(10, Math.floor(answerText.split(' ').length / 5)),
        technicalAccuracy: 5,
        communication: 5,
        problemSolving: 5,
        feedback: 'Evaluated offline - provide more context for better scoring',
      };
    }

    // Store answer
    const answerId = uuidv4();
    await supabase.from('interview_answers').insert([
      {
        id: answerId,
        question_id: questionId,
        candidate_id: candidateId,
        answer_text: answerText,
        score: evaluation.score || 5,
        technical_accuracy: evaluation.technicalAccuracy || 5,
        communication_score: evaluation.communication || 5,
        problem_solving_score: evaluation.problemSolving || 5,
        feedback: evaluation.feedback || '',
      },
    ]);

    // Store metrics
    await supabase.from('candidate_scores').insert([
      {
        candidate_id: candidateId,
        metric: 'communication',
        score: evaluation.communication || 5,
        source: 'interview_answer',
        reference_id: answerId,
      },
      {
        candidate_id: candidateId,
        metric: 'problem_solving',
        score: evaluation.problemSolving || 5,
        source: 'interview_answer',
        reference_id: answerId,
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        answerId,
        score: evaluation.score || 5,
        technicalAccuracy: evaluation.technicalAccuracy || 5,
        communication: evaluation.communication || 5,
        problemSolving: evaluation.problemSolving || 5,
        feedback: evaluation.feedback || '',
      },
    });
  } catch (error) {
    console.error('Answer evaluation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate answer' });
  }
}
