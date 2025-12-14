// app/components/ResultsDisplay.tsx
import { BarChart3, Code2, Star, GitFork, AlertCircle, RefreshCw } from 'lucide-react';
import LanguageChart from './LanguageChart';
import { styleText } from 'util';

interface ResultsDisplayProps {
  data: any;
  onNewAnalysis: () => void;
}

export default function ResultsDisplay({ data, onNewAnalysis }: ResultsDisplayProps) {
  const { repo_info, tech_analysis, learning_metrics, ai_summary } = data;

  return (
    <div className="space-y-6">
      {/* Header with repo info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{repo_info.full_name}</h1>
            <p className="text-gray-600 mt-1">{repo_info.description || 'No description available'}</p>
            <div className="flex items-center gap-4 mt-4">
              <span className="flex items-center gap-1 text-sm text-gray-700">
                <Star className="w-4 h-4 text-yellow-500" />
                {repo_info.stars.toLocaleString()} stars
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-700">
                <GitFork className="w-4 h-4 text-gray-500" />
                {repo_info.forks.toLocaleString()} forks
              </span>
              <a 
                href={repo_info.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View on GitHub →
              </a>
            </div>
          </div>
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-white border text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Analyze Another
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tech Stack */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tech Stack Card */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-black">Tech Stack Analysis</h2>
            </div>
            
            <div className="mb-6">
<h3 className="font-medium text-gray-700 mb-3">Language Distribution</h3>
<LanguageChart languages={tech_analysis.languages} />              <div className="space-y-3">
                {Object.entries(tech_analysis.languages || {}).map(([lang, percentage]) => (
                  <div key={lang} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-800">{lang}</span>
                      <span className="text-gray-600">{String(percentage)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: percentage as string }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Primary Language</p>
                <p className="text-lg font-semibold mt-1">{tech_analysis.primary_language}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-lg font-semibold mt-1"  style={{color :"AccentColorText"}}>{tech_analysis.file_count}</p>
              </div>
            </div>
          </div>

          {/* File Structure Preview */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">File Structure Preview</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                {tech_analysis.sample_structure?.slice(0, 15).join('\n')}
              </pre>
              {tech_analysis.sample_structure?.length > 15 && (
                <p className="text-sm text-gray-500 mt-2">
                  ... and {tech_analysis.file_count - 15} more files
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metrics & AI Summary */}
        <div className="space-y-6">
          {/* Complexity Score Card */}
          <div className="border rounded-xl p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl text-gray-800 font-semibold">Learning Metrics</h2>
            </div>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-100">
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    {learning_metrics.complexity_score}/10
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Complexity Score</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {learning_metrics.complexity_score < 4 ? 'Beginner Friendly' : 
                 learning_metrics.complexity_score < 7 ? 'Intermediate Level' : 'Advanced Project'}
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Recommended Starting Point</p>
              <p className="text-lg font-semibold text-blue-900 mt-1">
                {learning_metrics.recommended_start}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Start here to understand the project structure
              </p>
            </div>
          </div>

          {/* AI Summary Card */}
          <div className="border rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">AI Analysis Summary</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">{ai_summary}</p>
            </div>
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500">
                This analysis helps identify key areas for focused learning
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Generate Learning Path
            </button>
            <button className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50 font-medium">
              Chat with Codebase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}