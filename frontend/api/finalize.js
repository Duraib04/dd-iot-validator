// Vercel API Route: Finalize & Calculate Final Scores
// POST /api/finalize

import { supabase } from './config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: 'Candidate ID required' });
    }

    // Get all scores for candidate
    const { data: scores } = await supabase
      .from('candidate_scores')
      .select('*')
      .eq('candidate_id', candidateId);

    // Get candidate & resume analysis
    const { data: candidate } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    const { data: resumeAnalysis } = await supabase
      .from('resume_analysis')
      .select('*')
      .eq('candidate_id', candidateId)
      .single();

    if (!candidate || !resumeAnalysis) {
      return res.status(404).json({ error: 'Candidate data not found' });
    }

    // Calculate metrics
    const metrics = {};
    if (scores) {
      scores.forEach((s) => {
        if (!metrics[s.metric]) metrics[s.metric] = [];
        metrics[s.metric].push(s.score);
      });
    }

    // Average scores (0-100 scale)
    const hardware = metrics.hardware
      ? Math.round((metrics.hardware.reduce((a, b) => a + b, 0) / metrics.hardware.length) * 10)
      : resumeAnalysis?.hardware_score || 0;

    const programming = metrics.programming
      ? Math.round((metrics.programming.reduce((a, b) => a + b, 0) / metrics.programming.length) * 10)
      : resumeAnalysis?.programming_score || 0;

    const communication = metrics.communication
      ? Math.round((metrics.communication.reduce((a, b) => a + b, 0) / metrics.communication.length) * 10)
      : 0;

    const problemSolving = metrics.problem_solving
      ? Math.round((metrics.problem_solving.reduce((a, b) => a + b, 0) / metrics.problem_solving.length) * 10)
      : 0;

    // Final Score: (Hardware + Programming + Communication + ProblemSolving) / 4
    const finalScore = Math.round((hardware + programming + communication + problemSolving) / 4);

    // Decision Logic
    let decision = 'REJECTED';
    let reason = 'Did not meet minimum requirements';

    if (finalScore >= 30) {
      decision = 'SELECTED';
      reason = 'Excellent overall performance';
    } else if (finalScore >= 20) {
      decision = 'TRAINING';
      reason = 'Shows potential - recommend training program';
    }

    // Store final scores
    await supabase.from('candidate_scores').insert([
      {
        candidate_id: candidateId,
        metric: 'final_score',
        score: finalScore,
        source: 'calculation',
      },
    ]);

    // Update candidate status
    await supabase
      .from('candidates')
      .update({
        status: decision,
        final_score: finalScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', candidateId);

    // Prepare detailed report
    const report = {
      candidateId,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      score: {
        hardware,
        programming,
        communication,
        problemSolving,
        final: finalScore,
      },
      decision,
      reason,
      resumeAnalysis: {
        summary: resumeAnalysis?.summary,
        skills: resumeAnalysis?.extracted_skills,
        experience: resumeAnalysis?.years_of_experience,
      },
      interviewQuestionCount: scores?.length || 0,
      generatedAt: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      data: report,
      shouldSendEmail: finalScore > 30, // Only send email if selected
    });
  } catch (error) {
    console.error('Finalize error:', error);
    return res.status(500).json({ error: error.message || 'Failed to finalize evaluation' });
  }
}
