import { create } from 'zustand';

export const useCandidateStore = create((set, get) => ({
  // State
  candidateId: localStorage.getItem('candidateId') || null,
  email: localStorage.getItem('candidateEmail') || null,
  fullName: localStorage.getItem('candidateName') || null,
  role: 'intake', // intake, interview, results
  resumeAnalysis: null,
  resumeScores: null,
  currentQuestion: null,
  currentQuestionNum: 0,
  totalQuestions: 0,
  answers: [],
  scores: null,
  finalReport: null,
  loading: false,
  error: null,

  // Actions
  setCandidateId: (id, email, fullName) => {
    localStorage.setItem('candidateId', id);
    localStorage.setItem('candidateEmail', email);
    localStorage.setItem('candidateName', fullName);
    set({ candidateId: id, email, fullName });
  },

  setResumeData: (analysis, scores) => {
    set({ resumeAnalysis: analysis, resumeScores: scores });
  },

  setCurrentQuestion: (question, questionNum) => {
    set({ currentQuestion: question, currentQuestionNum: questionNum });
  },

  addAnswer: (answer) => {
    set((state) => ({
      answers: [...state.answers, answer],
      totalQuestions: Math.max(state.totalQuestions, state.currentQuestionNum),
    }));
  },

  setScores: (scores, report) => {
    set({ scores, finalReport: report });
  },

  setRole: (role) => {
    set({ role });
  },

  setLoading: (loading) => {
    set({ loading });
  },

  setError: (error) => {
    set({ error });
  },

  reset: () => {
    localStorage.removeItem('candidateId');
    localStorage.removeItem('candidateEmail');
    localStorage.removeItem('candidateName');
    set({
      candidateId: null,
      email: null,
      fullName: null,
      role: 'intake',
      resumeAnalysis: null,
      resumeScores: null,
      currentQuestion: null,
      currentQuestionNum: 0,
      totalQuestions: 0,
      answers: [],
      scores: null,
      finalReport: null,
      error: null,
    });
  },

  getProgress: () => {
    if (get().totalQuestions === 0) return 0;
    return Math.round((get().answers.length / Math.min(get().totalQuestions, 10)) * 100);
  },
}));

export default useCandidateStore;
