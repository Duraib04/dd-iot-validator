import { createClient } from '@supabase/supabase-js';
import config from '../config/index.js';

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

export const db = {
  // Candidates
  async createCandidate(email, fullName) {
    const { data, error } = await supabase
      .from('candidates')
      .insert([{ email, full_name: fullName }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCandidateById(id) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCandidate(id, updates) {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Skills
  async insertSkills(candidateId, skills) {
    const skillsData = skills.map(s => ({
      candidate_id: candidateId,
      skill_name: s.name,
      proficiency_level: s.level || 'intermediate',
      confidence_score: s.confidence || 0.8,
    }));

    const { data, error } = await supabase
      .from('candidate_skills')
      .insert(skillsData)
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getSkillsByCandidateId(candidateId) {
    const { data, error } = await supabase
      .from('candidate_skills')
      .select('*')
      .eq('candidate_id', candidateId);
    
    if (error) throw error;
    return data;
  },

  // Interview Questions
  async insertQuestion(candidateId, questionNumber, question, type, difficulty) {
    const { data, error } = await supabase
      .from('interview_questions')
      .insert([{
        candidate_id: candidateId,
        question_number: questionNumber,
        question_text: question,
        question_type: type,
        difficulty_level: difficulty,
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getQuestionsByCandidateId(candidateId) {
    const { data, error } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('question_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Interview Answers
  async insertAnswer(candidateId, questionId, answerText, score, feedback) {
    const { data, error } = await supabase
      .from('interview_answers')
      .insert([{
        candidate_id: candidateId,
        question_id: questionId,
        answer_text: answerText,
        score,
        feedback,
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAnswersByCandidateId(candidateId) {
    const { data, error } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('candidate_id', candidateId);
    
    if (error) throw error;
    return data;
  },

  // Scores
  async upsertScore(candidateId, scores) {
    const { data, error } = await supabase
      .from('candidate_scores')
      .upsert({
        candidate_id: candidateId,
        hardware_score: scores.hardware,
        programming_score: scores.programming,
        problem_solving_score: scores.problemSolving,
        communication_score: scores.communication,
        final_decision: scores.decision,
        decision_reason: scores.reason,
      }, { onConflict: 'candidate_id' })
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getScoreByCandidateId(candidateId) {
    const { data, error } = await supabase
      .from('candidate_scores')
      .select('*')
      .eq('candidate_id', candidateId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  },

  // Resume Analysis
  async upsertResumeAnalysis(candidateId, analysis) {
    const { data, error } = await supabase
      .from('resume_analysis')
      .upsert({
        candidate_id: candidateId,
        years_of_experience: analysis.yearsOfExperience,
        education_level: analysis.educationLevel,
        technologies: analysis.technologies,
        projects: analysis.projects,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        iot_relevance_score: analysis.iotRelevanceScore,
        analysis_status: 'completed',
      }, { onConflict: 'candidate_id' })
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async getResumeAnalysisByCandidateId(candidateId) {
    const { data, error } = await supabase
      .from('resume_analysis')
      .select('*')
      .eq('candidate_id', candidateId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  // Get Summary View
  async getCandidateSummary(candidateId) {
    const { data, error } = await supabase
      .from('candidate_summary')
      .select('*')
      .eq('id', candidateId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
};

export default db;
