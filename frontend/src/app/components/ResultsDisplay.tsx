// app/components/ResultsDisplay.tsx
import { 
  BarChart3, Code2, Star, GitFork, AlertCircle, RefreshCw, 
  Brain, TrendingUp, Zap, FileText, Cpu, ChevronRight , MessageCircle, Users
} from 'lucide-react';

// Add these interfaces at the top of ResultsDisplay.tsx

interface Contributor {
  username: string;
  avatar_url: string;
  contributions: number;
  profile_url: string;
}

interface Issue {
  number: number;
  title: string;
  url: string;
  comments: number;
  created_at: string;
  state: string;
}

interface CommunityData {
  top_contributors: Contributor[];
  active_issues: Issue[];
  contributor_count?: number;
  issue_engagement?: number;
}

interface AnalysisData {
  repo_info: {
    full_name: string;
    description: string;
    stars: number;
    forks: number;
    url: string;
    open_issues?: number;
    watchers?: number;
  };
  tech_analysis: {
    languages: Record<string, string>;
    primary_language: string;
    file_count: number;
    sample_structure: string[];
    top_languages: string[];
  };
  // Make community_data optional with fallback
  community_data?: CommunityData;
  learning_metrics: {
    complexity_score: number;
    complexity_level: string;
    recommended_start: string;
    community_score?: number;
  };
  ai_analysis: {
    ai_summary: string;
    tech_insights: string[];
    learning_path: string[];
    patterns: string[];
    community_tips?: string[];
  };
  has_ai_analysis: boolean;
}

interface ResultsDisplayProps {
  data: AnalysisData;
  onNewAnalysis: () => void;
}

export default function ResultsDisplay({ data, onNewAnalysis }: ResultsDisplayProps) {
  const { repo_info, tech_analysis, learning_metrics, ai_analysis, has_ai_analysis } = data;

  

  // Safe community_data access with empty defaults
  const community_data = data.community_data || {
    top_contributors: [],
    active_issues: [],
    contributor_count: 0,
    issue_engagement: 0
  };
  
  // Check if we have community data
  const hasCommunityData = community_data.top_contributors.length > 0 || 
                          community_data.active_issues.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Repo Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {repo_info.full_name}
            </h1>
            <p className="text-gray-600 mb-4">
              {repo_info.description || 'No description available'}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-xs">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-yellow-600">{repo_info.stars?.toLocaleString() || 0}</span>
                <span className="text-gray-500 text-sm">stars</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-xs">
                <GitFork className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">{repo_info.forks?.toLocaleString() || 0}</span>
                <span className="text-gray-500 text-sm">forks</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-xs">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-600">{tech_analysis.file_count || 0}</span>
                <span className="text-gray-500 text-sm">files</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-xs">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-purple-600">{tech_analysis.primary_language || 'Unknown'}</span>
                <span className="text-gray-500 text-sm">main</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={repo_info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              View on GitHub
            </a>
            <button
              onClick={onNewAnalysis}
              className="px-4 py-2 bg-white border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 " />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tech Stack */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language Distribution Card */}
          <div className="border rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Language Distribution</h2>
                  <p className="text-gray-500 text-sm">Breakdown by code percentage</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {Object.keys(tech_analysis.languages || {}).length} languages
              </div>
            </div>
            
            {/* Language Bars */}
            <div className="mb-6 space-y-4">
              {Object.entries(tech_analysis.languages || {})
                .sort(([, a], [, b]) => parseFloat(b as string) - parseFloat(a as string))
                .slice(0, 8)
                .map(([lang, percentage]) => (
                  <div key={lang} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800">{lang}</span>
                      <span className="text-gray-600">{percentage as string}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${parseFloat(percentage as string)}%`,
                          maxWidth: '100%'
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-700 font-medium">Primary Language</p>
                <p className="text-xl font-bold text-blue-900 mt-1">{tech_analysis.primary_language}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 font-medium">Total Files</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{tech_analysis.file_count}</p>
              </div>
            </div>
          </div>

          {/* File Structure Preview */}
          <div className="border rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Project Structure</h2>
                <p className="text-gray-500 text-sm">Key files and organization</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto">
              <div className="font-mono text-sm space-y-1">
                {tech_analysis.sample_structure?.slice(0, 15).map((file: string, index: number) => (
                  <div key={index} className="flex items-center py-1 px-2 hover:bg-white rounded transition-colors">
                    <ChevronRight className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{file}</span>
                  </div>
                ))}
              </div>
              {tech_analysis.sample_structure?.length > 15 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  ... and {tech_analysis.file_count - 15} more files
                </p>
              )}
            </div>
          </div>

                {/* Top Languages Grid */}
      {/* {tech_analysis.top_languages && tech_analysis.top_languages.length > 0 && (
        <div className="border rounded-2xl p-6 w-165 bg-white shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Languages</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 w-160 gap-4">
            {tech_analysis.top_languages.map((lang: string, index: number) => (
              <div key={index} className="p-3 bg-gradient-to-br w-25 from-gray-50 to-white rounded-xl border flex flex-col items-center justify-center">
                <div className="text-2xl mb-2">
                  {getLanguageEmoji(lang)}
                </div>
                <span className="font-semibold text-gray-800">{lang}</span>
                <span className="text-sm text-gray-500 mt-1">
                  {tech_analysis.languages[lang] || '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>
        
      )} */}

      {/* Contributors Section */}
<div className="border rounded-2xl p-6 bg-white shadow-sm">
  <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Contributors</h2>

  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-purple-100 rounded-lg">
      <Users className="w-5 h-5 text-purple-600" />
    </div>
    <div>
      <h2 className="text-xl font-semibold">Top Contributors</h2>
      <p className="text-gray-500 text-sm">
        {community_data.contributor_count?.toLocaleString() || 'N/A'} total contributors
      </p>
    </div>
  </div>
  // In your complexity section, add:
<div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
  <p className="text-sm text-purple-800 font-medium mb-1">Community Engagement</p>
  <p className="text-lg font-semibold text-purple-900">
    {learning_metrics.community_score || 0}/10
  </p>
  <p className="text-sm text-purple-700 mt-1">
    Based on contributors & issue activity
  </p>
</div>
  
  {community_data.top_contributors?.length > 0 ? (
    <div className="space-y-3">
      {community_data.top_contributors.map((contributor, index) => (
        <a
          key={contributor.username}
          href={contributor.profile_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <img
            src={contributor.avatar_url}
            alt={contributor.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-medium">@{contributor.username}</span>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {contributor.contributions.toLocaleString()} commits
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Rank #{index + 1} contributor
            </div>
          </div>
        </a>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center py-4">No contributor data available</p>
  )}
</div>

{/* Active Issues Section */}
<div className="border rounded-2xl p-6 bg-white shadow-sm">
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 bg-red-100 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-600" />
    </div>
    <div>
      <h2 className="text-xl font-semibold">Most Active Issues</h2>
      <p className="text-gray-500 text-sm">
        Issues with most discussion activity
      </p>
    </div>
  </div>
  
  {community_data.active_issues?.length > 0 ? (
    <div className="space-y-3">
      {community_data.active_issues.map((issue) => (
        <a
          key={issue.number}
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 line-clamp-2">
                #{issue.number}: {issue.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {issue.comments} comments
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                issue.state === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {issue.state}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center py-4">No active issues data available</p>
  )}
</div>
        </div>

        {/* Right Column - Metrics & AI */}
        <div className="space-y-6">
          {/* Complexity Score Card */}
          <div className="border rounded-2xl p-6 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Learning Metrics</h2>
                <p className="text-gray-500 text-sm">Complexity and learning level</p>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-blue-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-4xl font-bold text-blue-600">
                      {learning_metrics.complexity_score}/10
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Complexity Score</div>
                  </div>
                </div>
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle 
                    cx="50%" 
                    cy="50%" 
                    r="45%" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="8" 
                  />
                  <circle 
                    cx="50%" 
                    cy="50%" 
                    r="45%" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="8" 
                    strokeDasharray={`${learning_metrics.complexity_score * 10} 100`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="mt-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  learning_metrics.complexity_level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  learning_metrics.complexity_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  learning_metrics.complexity_level === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {learning_metrics.complexity_level || 
                   (learning_metrics.complexity_score < 4 ? 'Beginner' : 
                    learning_metrics.complexity_score < 7 ? 'Intermediate' : 'Advanced')} Level
                </span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">Recommended Starting Point</p>
              <p className="text-lg font-semibold text-blue-900 mt-1">
                {learning_metrics.recommended_start}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Start here to understand the project structure
              </p>
            </div>
          </div>

          {/* AI Analysis Section */}
          {has_ai_analysis && ai_analysis ? (
            <div className="border rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">AI-Powered Analysis</h2>
                  <p className="text-gray-500 text-sm">Intelligent insights from CodeSensei AI</p>
                </div>
              </div>

              {/* AI Summary */}
              {ai_analysis.ai_summary && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                  <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                    {ai_analysis.ai_summary}
                  </p>
                </div>
              )}

              {/* Tech Insights */}
              {ai_analysis.tech_insights && ai_analysis.tech_insights.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Technical Insights</h3>
                  <div className="space-y-2">
                    {ai_analysis.tech_insights.slice(0, 3).map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200">
                        <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Path */}
              {ai_analysis.learning_path && ai_analysis.learning_path.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Learning Path</h3>
                  <div className="space-y-2">
                    {ai_analysis.learning_path.slice(0, 3).map((step: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">
                  AI analysis powered by OpenAI
                </p>
              </div>
            </div>
          ) : (
            /* Fallback if no AI analysis */
            <div className="border rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-800">AI Analysis</h2>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Enable OpenAI API integration for intelligent code analysis.
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Add OPENAI_API_KEY to backend environment variables.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 font-medium transition-all flex items-center justify-center gap-2"
              onClick={() => {
                // Will implement learning path generation
                alert('Learning path generation coming soon!');
              }}
            >
              <TrendingUp className="w-4 h-4" />
              Generate Learning Path
            </button>
            <button 
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              onClick={() => {
                // Will navigate to chat interface
                alert('Chat with Codebase coming soon!');
              }}
            >
              Chat with Codebase
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

// Helper function for language emojis
function getLanguageEmoji(language: string) {
  const emojiMap: Record<string, string> = {
    'JavaScript': '🟨',
    'TypeScript': '🔷',
    'Python': '🐍',
    'Java': '☕',
    'C++': '🔵',
    'Go': '🐹',
    'Rust': '🦀',
    'Ruby': '💎',
    'PHP': '🐘',
    'C#': 'C#',
    'Swift': '🐦',
    'Kotlin': 'K',
    'HTML': '🌐',
    'CSS': '🎨',
    'Shell': '🐚',
    'Dockerfile': '🐳',
    'Markdown': '📝',
  };
  return emojiMap[language] || '📄';
}