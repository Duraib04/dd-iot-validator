import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCandidateStore from '../hooks/useStore';

function getDecisionColor(decision) {
  switch (decision) {
    case 'SELECTED':
      return 'green';
    case 'NEEDS_TRAINING':
      return 'yellow';
    case 'REJECTED':
      return 'red';
    default:
      return 'blue';
  }
}

function getDecisionEmoji(decision) {
  switch (decision) {
    case 'SELECTED':
      return '🎉';
    case 'NEEDS_TRAINING':
      return '📚';
    case 'REJECTED':
      return '📋';
    default:
      return '📊';
  }
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { fullName, scores, finalReport, reset } = useCandidateStore();

  if (!scores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const decisionColor = getDecisionColor(scores.decision);
  const decisionEmoji = getDecisionEmoji(scores.decision);
  const progressColor = {
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
    blue: 'bg-blue-600',
  }[decisionColor];

  const Decision = () => {
    switch (scores.decision) {
      case 'SELECTED':
        return {
          title: 'Congratulations! You\'re Selected! 🎉',
          subtitle: 'You have been selected for the position',
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          badgeColor: 'bg-green-100 text-green-800',
        };
      case 'NEEDS_TRAINING':
        return {
          title: 'Great Potential! 📚',
          subtitle: 'You have been selected for our training program',
          bgColor: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200',
          badgeColor: 'bg-yellow-100 text-yellow-800',
        };
      case 'REJECTED':
        return {
          title: 'Thank You for Your Application 📋',
          subtitle: 'Unfortunately, you were not selected at this time',
          bgColor: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
      default:
        return {};
    }
  };

  const decision = Decision();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${decision.bgColor} py-12 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Decision Card */}
        <div className={`card border-2 ${decision.borderColor} text-center mb-8`}>
          <div className="text-6xl mb-4">{decisionEmoji}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{decision.title}</h1>
          <p className="text-xl text-gray-600">{decision.subtitle}</p>
        </div>

        {/* Main Score */}
        <div className="card mb-8 text-center">
          <p className="text-gray-600 mb-2">Total Score</p>
          <div className="text-7xl font-bold text-gray-900 mb-2">
            {scores.totalScore}
            <span className="text-3xl text-gray-500">/40</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className={`${progressColor} h-3 rounded-full transition-all`}
              style={{ width: `${(scores.totalScore / 40) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Scoring Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Hardware Knowledge</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">{scores.hardware}/10</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(scores.hardware / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💻 Programming</h3>
            <div className="text-4xl font-bold text-purple-600 mb-2">{scores.programming}/10</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${(scores.programming / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🧠 Problem-Solving</h3>
            <div className="text-4xl font-bold text-orange-600 mb-2">{scores.problemSolving}/10</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${(scores.problemSolving / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🗣️ Communication</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">{scores.communication}/10</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(scores.communication / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Detailed Report */}
        {finalReport && (
          <>
            {/* Feedback */}
            <div className="card mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Detailed Feedback</h2>

              {finalReport.strengths && (
                <div className="mb-6">
                  <h3 className="font-bold text-green-700 mb-2">✓ Strengths</h3>
                  <p className="text-gray-600">{finalReport.strengths}</p>
                </div>
              )}

              {finalReport.weaknesses && (
                <div className="mb-6">
                  <h3 className="font-bold text-orange-700 mb-2">→ Areas for Improvement</h3>
                  <p className="text-gray-600">{finalReport.weaknesses}</p>
                </div>
              )}

              {finalReport.summary && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-2">📊 Summary</h3>
                  <p className="text-gray-700">{finalReport.summary.reason}</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {finalReport.recommendations && finalReport.recommendations.length > 0 && (
              <div className="card mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Next Steps</h2>
                <ul className="space-y-2">
                  {finalReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 text-blue-600">→</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="btn-secondary"
          >
            📥 Download Report
          </button>
          <button
            onClick={() => {
              reset();
              navigate('/');
            }}
            className="btn-primary"
          >
            Start Over
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Thank you for applying to DD IoT Solutions!</p>
          <p className="mt-2">For questions, contact: careers@ddiot.com</p>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
