import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import candidateAPI from '../services/api';
import useCandidateStore from '../hooks/useStore';

export function ResumeUploadPage() {
  const navigate = useNavigate();
  const { setCandidateId, setResumeData, setRole, setLoading, setError } = useCandidateStore();
  const [formData, setFormData] = useState({ email: '', fullName: '', resume: null });
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, resume: file }));
      setError(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Extract base64 part
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.email || !formData.fullName || !formData.resume) {
        throw new Error('Please fill in all fields');
      }

      setProgress(25);

      // Convert resume to base64
      const resumeBase64 = await fileToBase64(formData.resume);

      setProgress(50);

      // Upload resume
      const result = await candidateAPI.uploadResume(
        formData.email,
        formData.fullName,
        resumeBase64
      );

      setProgress(75);

      // Store data
      setCandidateId(result.candidateId, result.email, result.fullName);
      setResumeData(result.analysis, result.resumeScores);
      setRole('analysis');

      setProgress(100);

      // Redirect to interview
      setTimeout(() => {
        navigate('/interview');
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Resume Upload</h1>
          <p className="text-lg text-gray-600">Step 1 of 3: Tell us about yourself</p>
        </div>

        {/* Form Card */}
        <div className="card space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>

            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="input-field"
                required
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Your Resume (PDF)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-input"
                  required
                />
                <label htmlFor="resume-input" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-gray-600 mb-1">
                    {formData.resume ? formData.resume.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">PDF files only, max 5MB</p>
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {uploading && progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary w-full"
            >
              {uploading ? 'Uploading...' : 'Continue to Interview'}
            </button>
          </form>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Best Results</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Include your IoT and embedded systems experience</li>
              <li>✓ List relevant programming languages and tools</li>
              <li>✓ Mention any hardware projects or certifications</li>
              <li>✓ Ensure your resume is clear and well-formatted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeUploadPage;
