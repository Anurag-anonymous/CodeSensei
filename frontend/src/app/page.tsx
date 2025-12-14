import RepoInput from './components/RepoInput';  // Changed from @/components/RepoInput
import FeatureCard from './components/FeatureCard'; 
import { 
  Code2, 
  MessageSquare, 
  Map, 
  GitPullRequest, 
  Brain, 
  BookOpen 
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: "Repo Analyzer",
      description: "Upload GitHub URL → AI analyzes structure, tech stack, complexity",
      icon: Code2,
      status: "active" as const
    },
    {
      title: "Interactive Code Explorer",
      description: "Chat with the codebase, ask questions about specific files or functions",
      icon: MessageSquare,
      status: "active" as const
    },
    {
      title: "Auto-generated Learning Path",
      description: "Personalized roadmap based on repo complexity and your experience level",
      icon: Map,
      status: "active" as const
    },
    {
      title: "Smart PR Reviews",
      description: "CodeRabbit integration with educational explanations",
      icon: GitPullRequest,
      status: "coming-soon" as const
    },
    {
      title: "Code Pattern Extractor",
      description: "Identifies common patterns, anti-patterns, and best practices",
      icon: Brain,
      status: "beta" as const
    },
    {
      title: "Practice Challenges",
      description: "Generates coding exercises from real code patterns",
      icon: BookOpen,
      status: "coming-soon" as const
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}

      <section className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            AI-Powered Code Learning
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CodeSensei
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your AI mentor for mastering any codebase. Understand complex repositories in minutes, not days.
          </p>
        </header>
        
        {/* Main Input Section */}
        <div className="mb-16">
          <RepoInput />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need to Learn Faster</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From repository analysis to personalized learning paths, CodeSensei provides comprehensive tools for understanding any codebase.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              status={feature.status}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Master Any Codebase?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who use CodeSensei to accelerate their learning and contribute to projects faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Start Learning Free
            </button>
            <button className="px-8 py-3 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50 font-medium">
              View Demo
            </button>
          </div>
        </div>
      </section>
    </main>
    
  );
}
