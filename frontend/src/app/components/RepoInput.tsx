// app/components/RepoInput.tsx
'use client';

import { useState } from 'react';
import { Upload, Github } from 'lucide-react';
import ResultsDisplay from './ResultsDisplay'; // We'll create this next

export default function RepoInput() {
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null); // New state for results

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl) return;

    setIsLoading(true);
    setError('');
    setAnalysisResult(null); // Clear previous results

    try {
      if (!githubUrl.includes('github.com')) {
        throw new Error('Please enter a valid GitHub URL');
      }
// Current setup - should work if NEXT_PUBLIC_API_URL is set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8000';

const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: githubUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze repository');
      }

      const data = await response.json();
      console.log('Analysis result:', data);
      setAnalysisResult(data); // Store results in state
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null); // Reset to show form again
    setGithubUrl(''); // Clear input
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Show form OR results based on state */}
      {!analysisResult ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold mb-2">Start Learning Any Codebase</h2>
            <p className="text-gray-600 text-lg">
              Paste a GitHub repository URL and let CodeSensei analyze it for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Github className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/facebook/react"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !githubUrl}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                {isLoading ? 'Analyzing...' : 'Analyze Repository'}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                <p className="font-medium">Error: {error}</p>
                <p className="text-sm mt-1">Check browser Console (F12) for details</p>
              </div>
            )}
          </form>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-1">Step 1: Paste URL</h4>
              <p className="text-sm text-gray-600">Enter any public GitHub repository URL</p>
            </div>
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-1">Step 2: AI Analysis</h4>
              <p className="text-sm text-gray-600">CodeSensei analyzes structure, tech stack, and complexity</p>
            </div>
            <div className="p-4 border rounded-lg bg-white shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-1">Step 3: Learn & Explore</h4>
              <p className="text-sm text-gray-600">Get personalized learning path and chat with the codebase</p>
            </div>
          </div>
        </>
      ) : (
        // Show results when analysis is complete
        <ResultsDisplay 
          data={analysisResult} 
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </div>
  );
}