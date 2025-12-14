// app/components/Navigation.tsx
'use client';

import { Code2, Home, BarChart3, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function Navigation() {
    const isPageAvailable = {
        dashboard: true,
        chat: true
    };


  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-blue-600" />
              <span className="text-xl text-gray-800 font-bold">CodeSensei</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <Home className="w-4 h-4" />
                Home
              </Link>
                         {isPageAvailable.dashboard ? (
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <button 
                className="flex items-center gap-2 text-gray-400 cursor-not-allowed"
                title="Coming soon!"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </button>
            )}
            
            {/* Chat link - disabled until page exists */}
            {isPageAvailable.chat ? (
              <Link href="/chat" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <MessageSquare className="w-4 h-4" />
                Code Chat
              </Link>
            ) : (
              <button 
                className="flex items-center gap-2 text-gray-400 cursor-not-allowed"
                title="Coming soon!"
              >
                <MessageSquare className="w-4 h-4" />
                Code Chat
              </button>
            )}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            Your AI Codebase Mentor
          </div>
        </div>
      </div>
    </nav>
  );
}