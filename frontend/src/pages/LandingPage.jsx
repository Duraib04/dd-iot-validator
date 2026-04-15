import React from 'react';

export function LandingPage() {
  return (
    <div className="min-h-screen gradient-primary text-white">
      {/* Header */}
      <header className="bg-blue-800 py-6 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">DD IoT Solutions</h1>
            <p className="text-blue-200">Candidate Validation System</p>
          </div>
          <div className="text-5xl">🚀</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Welcome to the Candidate Validation System</h2>
          <p className="text-xl text-blue-100 mb-8">
            Showcase your IoT expertise and technical skills through our AI-powered evaluation platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-blue-700 rounded-lg p-6">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-2">Resume Upload</h3>
              <p className="text-blue-100">Submit your resume and we'll extract your skills and background</p>
            </div>

            <div className="bg-blue-700 rounded-lg p-6">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">AI Interview</h3>
              <p className="text-blue-100">Answer 5-10 technical and behavioral questions</p>
            </div>

            <div className="bg-blue-700 rounded-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Score & Feedback</h3>
              <p className="text-blue-100">Get comprehensive evaluation and hiring decision</p>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/login'}
            className="mt-12 px-12 py-4 bg-yellow-400 text-blue-900 font-bold text-lg rounded-lg hover:bg-yellow-300 transition"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-blue-700 py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-400 text-blue-900 font-bold text-xl">
                  1
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Upload Your Resume</h4>
                <p className="text-blue-100">
                  Submit a PDF resume. Our AI will analyze your skills, experience, and IoT relevance.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-400 text-blue-900 font-bold text-xl">
                  2
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Take the Interview</h4>
                <p className="text-blue-100">
                  Answer dynamically generated questions. Difficulty adjusts based on your responses.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-400 text-blue-900 font-bold text-xl">
                  3
                </div>
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Get Your Results</h4>
                <p className="text-blue-100">
                  Receive detailed scoring across 4 metrics and a final hiring decision with recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 py-6 text-center text-blue-200">
        <p>&copy; 2026 DD IoT Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
