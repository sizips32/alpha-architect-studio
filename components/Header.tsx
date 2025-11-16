
import React from 'react';

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3v18h18" />
    <path d="M7 16V8" />
    <path d="M12 16V4" />
    <path d="M17 16v-2" />
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/50 border-b border-gray-800 sticky top-0 z-10 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-8 w-8 text-cyan-400" />
            <h1 className="text-xl font-bold text-gray-100">Alpha Architect</h1>
          </div>
          <div className="text-sm font-medium text-gray-400">
            Quantitative Strategy Studio
          </div>
        </div>
      </div>
    </header>
  );
};
