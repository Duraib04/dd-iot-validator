import axios from 'axios';

// Use relative path for Vercel serverless functions
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const candidateAPI = {
  // Upload resume (expects base64-encoded PDF)
  uploadResume: async (email, fullName, resumeBase64) => {
    const response = await apiClient.post('/upload', {
      email,
      fullName,
      resumeBase64,
    });
    return response.data.data;
  },

  // Get next interview question
  getNextQuestion: async (candidateId) => {
    const response = await apiClient.post('/question', {
      candidateId,
    });
    return response.data.data;
  },

  // Submit answer and get score
  submitAnswer: async (candidateId, questionId, answerText) => {
    const response = await apiClient.post('/answer', {
      candidateId,
      questionId,
      answerText,
    });
    return response.data.data;
  },

  // Finalize interview and get results
  finalizeInterview: async (candidateId) => {
    const response = await apiClient.post('/finalize', {
      candidateId,
    });
    return response.data;
  },

  // Send email notification (called automatically after finalize)
  sendEmailNotification: async (candidateId, candidateData) => {
    const response = await apiClient.post('/send-email', {
      candidateId,
      candidateData,
    });
    return response.data;
  },
};

export default candidateAPI;
