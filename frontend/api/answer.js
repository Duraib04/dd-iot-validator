// Vercel API Route: Submit Answer & Get Score
// POST /api/answer

import { openai, supabase } from './config.js';
import { v4 as uuidv4 } from 'uuid';
import questions from '../src/data/questions.json' assert { type: 'json' };

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

    // Get question from static list
    const question = questions.find(q => q.id === questionId);
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
Question (${question.type}): ${question.question}
Expected keywords: ${question.expectedKeywords.join(', ')}
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
      // Fallback: Simple scoring based on keywords and answer length
      const keywordMatches = question.expectedKeywords.filter(kw => 
        answerText.toLowerCase().includes(kw.toLowerCase())
      ).length;
      const baseScore = Math.min(10, Math.floor((keywordMatches / question.expectedKeywords.length) * 10));
      const lengthBonus = Math.min(3, Math.floor(answerText.split(' ').length / 20));
      
      evaluation = {
        score: Math.min(10, baseScore + lengthBonus),
        technicalAccuracy: baseScore,
        communication: Math.min(10, 5 + Math.floor(answerText.length / 100)),
        problemSolving: baseScore,
        feedback: 'Offline evaluation - limited feedback available',
      };
    }

    // Store answer (update the placeholder row created in /api/question)
    const answerId = uuidv4();
    await supabase
      .from('interview_answers')
      .update({
        answer_text: answerText,
        score: evaluation.score || 5,
        technical_accuracy: evaluation.technicalAccuracy || 5,
        communication_score: evaluation.communication || 5,
        problem_solving_score: evaluation.problemSolving || 5,
        feedback: evaluation.feedback || '',
      })
      .eq('candidate_id', candidateId)
      .eq('question_id', questionId)
      .eq('answer_text', null); // Update the one we created with null answer_text

    // Store metrics
    await supabase.from('candidate_scores').insert([
      {
        candidate_id: candidateId,
        metric: 'communication',
        score: evaluation.communication || 5,
        source: 'interview_answer',
        reference_id: questionId,
      },
      {
        candidate_id: candidateId,
        metric: 'problem_solving',
        score: evaluation.problemSolving || 5,
        source: 'interview_answer',
        reference_id: questionId,
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
