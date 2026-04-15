import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import candidateAPI from '../services/api';
import useCandidateStore from '../hooks/useStore';

export function InterviewPage() {
  const navigate = useNavigate();
  const store = useCandidateStore();
  const { candidateId, currentQuestion, currentQuestionNum, answers, error, setCurrentQuestion, addAnswer, setLoading, setError, setRole } = store;

  const [answer, setAnswer] = useState('');
  const [loading, setLoadingState] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const maxQuestions = 10;

  useEffect(() => {
    if (!candidateId) {
      navigate('/');
      return;
    }

    if (!currentQuestion) {
      loadQuestion();
    }
  }, [candidateId]);

  const loadQuestion = async () => {
    setLoadingState(true);
    try {
      const question = await candidateAPI.getNextQuestion(candidateId);
      setCurrentQuestion(question, question.questionNumber);
      setAnswer('');
      setSubmitted(false);
      setEvaluation(null);
    } catch (error) {
      if (error.response?.status === 400) {
        // Interview complete
        finalizeInterview();
      } else {
        setError(error.response?.data?.message || 'Failed to load question');
      }
    } finally {
      setLoadingState(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    setEvaluationLoading(true);
    try {
      const result = await candidateAPI.submitAnswer(candidateId, currentQuestion.questionId, answer);
      setEvaluation(result);
      setSubmitted(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setEvaluationLoading(false);
    }
  };

  const handleNext = () => {
    addAnswer({ ...evaluation, questionNumber: currentQuestionNum });

    if (currentQuestionNum >= maxQuestions) {
      finalizeInterview();
    } else {
      loadQuestion();
    }
  };

  const finalizeInterview = async () => {
    setLoading(true);
    try {
      const result = await candidateAPI.finalizeInterview(candidateId);
      store.setScores(result.scores, result.report);
      setRole('results');
      navigate('/results');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to finalize interview');
    } finally {
      setLoading(false);
    }
  };

  if (!currentQuestion && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Interview - Question {currentQuestionNum} of {maxQuestions}
            </h1>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold">
              {Math.round((currentQuestionNum / maxQuestions) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentQuestionNum / maxQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="card mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <span className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                Q
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {currentQuestion?.type === 'technical' ? '🔧 Technical Question' : '💬 Behavioral Question'}
              </p>
              <p className="text-xl font-semibold text-gray-900">{currentQuestion?.question}</p>
              {currentQuestion?.difficulty && (
                <p className="text-xs text-gray-500 mt-2">
                  Difficulty: {'⭐'.repeat(Math.round(currentQuestion.difficulty / 2))}
                </p>
              )}
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="6"
              />
              <button
                type="submit"
                disabled={evaluationLoading || !answer.trim()}
                className="btn-primary w-full"
              >
                {evaluationLoading ? 'Evaluating...' : 'Submit Answer'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Evaluation Result */}
              <div className={`p-4 rounded-lg ${evaluation.score >= 7 ? 'bg-green-50 border border-green-200' : evaluation.score >= 4 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-900">Evaluation Result</h4>
                  <span className={`text-2xl font-bold ${evaluation.score >= 7 ? 'text-green-600' : evaluation.score >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {evaluation.score}/10
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">Feedback:</p>
                    <p className="text-gray-600">{evaluation.feedback}</p>
                  </div>

                  {evaluation.strengths && (
                    <div>
                      <p className="font-semibold text-green-700">✓ Strengths:</p>
                      <p className="text-gray-600">{evaluation.strengths}</p>
                    </div>
                  )}

                  {evaluation.improvements && (
                    <div>
                      <p className="font-semibold text-orange-700">→ Areas to Improve:</p>
                      <p className="text-gray-600">{evaluation.improvements}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Communication</p>
                  <p className="text-lg font-bold text-gray-900">{evaluation.communication}/10</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Technical Accuracy</p>
                  <p className="text-lg font-bold text-gray-900">{evaluation.technicalAccuracy}/10</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Problem Solving</p>
                  <p className="text-lg font-bold text-gray-900">{evaluation.problemSolving}/10</p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="btn-primary w-full"
              >
                {currentQuestionNum >= maxQuestions ? 'See Results' : 'Next Question'}
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Interview Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Be specific and provide concrete examples</li>
            <li>✓ Explain your thought process clearly</li>
            <li>✓ Show your problem-solving approach</li>
            <li>✓ Don't worry about perfect answers - thoughtful responses are valued</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;
