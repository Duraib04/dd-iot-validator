/**
 * Scoring Algorithm for Candidate Evaluation
 * 
 * Metrics:
 * - Hardware Knowledge (0-10): IoT knowledge, embedded systems
 * - Programming (0-10): Coding skills, problem-solving
 * - Problem-solving (0-10): Technical depth, debugging ability
 * - Communication (0-10): Clarity, explanation ability
 * 
 * Total Score: Sum of all four scores (max 40)
 * Decision:
 * - Score > 30: SELECTED
 * - 20-30: NEEDS_TRAINING
 * - < 20: REJECTED
 */

export const scoringService = {
  /**
   * Score based on resume analysis
   */
  scoreResumeAnalysis(analysis) {
    let hardware = 0;
    let programming = 0;

    // Hardware score based on IoT relevance
    hardware = Math.min(10, Math.round(analysis.iotRelevanceScore * 10));

    // Programming score based on experience and skills
    const expBonus = Math.min(analysis.yearsOfExperience * 0.5, 3);
    const techCount = (analysis.technologies || []).length;
    const techScore = Math.min(techCount * 0.5, 4);
    programming = Math.min(10, Math.round(expBonus + techScore + 2)); // +2 base

    return {
      hardware: Math.max(0, hardware),
      programming: Math.max(0, programming),
    };
  },

  /**
   * Score from interview data
   */
  scoreInterviewAnswers(allEvaluations) {
    if (!allEvaluations || allEvaluations.length === 0) {
      return {
        problemSolving: 0,
        communication: 0,
      };
    }

    // Problem-solving: average of technical scores
    const technicalScores = allEvaluations.map(e => e.score || 0);
    const avgTechnical = technicalScores.length > 0
      ? technicalScores.reduce((a, b) => a + b) / technicalScores.length
      : 0;

    // Communication: average of communication scores
    const communicationScores = allEvaluations.map(e => e.communication || 5);
    const avgCommunication = communicationScores.length > 0
      ? communicationScores.reduce((a, b) => a + b) / communicationScores.length
      : 0;

    return {
      problemSolving: Math.min(10, Math.round(avgTechnical)),
      communication: Math.min(10, Math.round(avgCommunication)),
    };
  },

  /**
   * Calculate final score and decision
   */
  calculateFinalScore(resumeScores, interviewScores) {
    const scores = {
      hardware: resumeScores.hardware || 0,
      programming: resumeScores.programming || 0,
      problemSolving: interviewScores.problemSolving || 0,
      communication: interviewScores.communication || 0,
    };

    const totalScore = scores.hardware + scores.programming + scores.problemSolving + scores.communication;

    let decision = 'REJECTED';
    let reason = '';

    if (totalScore > 30) {
      decision = 'SELECTED';
      reason = `Excellent fit for IP IoT role. Strong scores across all metrics: Hardware(${scores.hardware}), Programming(${scores.programming}), Problem-solving(${scores.problemSolving}), Communication(${scores.communication}).`;
    } else if (totalScore >= 20) {
      decision = 'NEEDS_TRAINING';
      reason = `Shows potential but needs skill development. Focus areas: ${this.identifyWeaknesses(scores)}.`;
    } else {
      decision = 'REJECTED';
      reason = `Score below threshold (${totalScore}/40). Does not meet minimum requirements for the role.`;
    }

    return {
      ...scores,
      totalScore,
      decision,
      reason,
    };
  },

  /**
   * Identify weak areas
   */
  identifyWeaknesses(scores) {
    const weaknesses = [];

    if (scores.hardware < 5) weaknesses.push('IoT/Hardware knowledge');
    if (scores.programming < 5) weaknesses.push('Programming skills');
    if (scores.problemSolving < 5) weaknesses.push('Problem-solving ability');
    if (scores.communication < 5) weaknesses.push('Communication skills');

    return weaknesses.length > 0 ? weaknesses.join(', ') : 'General skill level';
  },

  /**
   * Generate detailed scoring report
   */
  generateReport(scores, resumeAnalysis, allInterviewAnswers) {
    const report = {
      summary: {
        totalScore: scores.totalScore,
        decision: scores.decision,
        reason: scores.reason,
      },
      breakdown: {
        hardware: {
          score: scores.hardware,
          source: 'Resume Analysis',
          details: `IoT Relevance: ${(resumeAnalysis.iotRelevanceScore * 100).toFixed(1)}%`,
        },
        programming: {
          score: scores.programming,
          source: 'Resume + Experience',
          details: `${resumeAnalysis.yearsOfExperience} years exp, ${resumeAnalysis.technologies?.length || 0} technologies`,
        },
        problemSolving: {
          score: scores.problemSolving,
          source: 'Technical Interview',
          details: `${allInterviewAnswers.length} questions answered`,
        },
        communication: {
          score: scores.communication,
          source: 'Interview Evaluation',
          details: 'Assessed during all interview questions',
        },
      },
      strengths: resumeAnalysis.strengths || 'Not analyzed',
      weaknesses: resumeAnalysis.weaknesses || 'Not analyzed',
      recommendations: this.generateRecommendations(scores),
    };

    return report;
  },

  /**
   * Generate recommendations for hiring managers
   */
  generateRecommendations(scores) {
    const recommendations = [];

    switch (scores.decision) {
      case 'SELECTED':
        recommendations.push('Ready for immediate onboarding');
        recommendations.push('Consider for senior projects given strong performance');
        if (scores.hardware > 8) recommendations.push('Potential candidate for hardware team lead role');
        break;

      case 'NEEDS_TRAINING':
        recommendations.push('Onboard with structured training program');
        if (scores.hardware < 5) recommendations.push('IoT fundamentals training recommended');
        if (scores.programming < 5) recommendations.push('Advanced programming bootcamp suggested');
        if (scores.communication < 5) recommendations.push('Communication and documentation workshop');
        recommendations.push('Schedule 30-day follow-up assessment');
        break;

      case 'REJECTED':
        recommendations.push('Continue recruiting');
        if (scores.totalScore >= 15) recommendations.push('Consider for junior/intern positions with mentorship');
        recommendations.push('Feedback: Focus areas not aligned with current role requirements');
        break;
    }

    return recommendations;
  },

  /**
   * Normalize scores for consistency
   */
  normalizeScores(rawScores) {
    const normalized = {};
    Object.keys(rawScores).forEach(key => {
      if (typeof rawScores[key] === 'number') {
        normalized[key] = Math.max(0, Math.min(10, rawScores[key]));
      }
    });
    return normalized;
  },

  /**
   * Export scoring metadata for analytics
   */
  getScoreMetadata() {
    return {
      version: '1.0',
      maxScore: 40,
      categories: {
        hardware: { max: 10, weight: 0.25, source: 'Resume + IoT Relevance' },
        programming: { max: 10, weight: 0.25, source: 'Resume + Experience' },
        problemSolving: { max: 10, weight: 0.25, source: 'Technical Interview' },
        communication: { max: 10, weight: 0.25, source: 'Interview Evaluation' },
      },
      thresholds: {
        selected: 30,
        trainingMin: 20,
        rejectedMax: 19,
      },
      interviewQuestions: { min: 5, max: 10 },
    };
  },
};

export default scoringService;
