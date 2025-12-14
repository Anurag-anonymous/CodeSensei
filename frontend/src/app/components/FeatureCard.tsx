// components/FeatureCard.tsx
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  status?: 'active' | 'coming-soon' | 'beta';
}

export default function FeatureCard({ 
  title, 
  description, 
  icon: Icon,
  status = 'active'
}: FeatureCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    'coming-soon': 'bg-yellow-100 text-yellow-800',
    beta: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="group relative border rounded-lg p-6 hover:shadow-lg transition-shadow duration-300 bg-white">
      {/* Status badge */}
      {status !== 'active' && (
        <div className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {status === 'coming-soon' ? 'Coming Soon' : 'Beta'}
        </div>
      )}
      
      {/* Icon */}
      {Icon && (
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      )}
      
      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {/* Learn more link */}
      <div className="mt-auto">
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          Learn more
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}