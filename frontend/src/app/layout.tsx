// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation'; // or './components/Navigation'

// Use local font fallback to avoid Google Fonts connection issues
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
  preload: false // Disable preloading to avoid connection errors
});

export const metadata: Metadata = {
  title: 'CodeSensei - Your AI Codebase Mentor',
  description: 'AI-powered tool to help you understand and master any codebase quickly',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>

               <Navigation />
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t py-8 text-center text-gray-500 text-sm">
          <div className="container mx-auto px-4">
            <p>CodeSensei © {new Date().getFullYear()} - Your AI mentor for mastering codebases</p>
            <p className="mt-2">Made with ❤️ for developers everywhere</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
