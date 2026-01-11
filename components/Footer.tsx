import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>
          &copy; {new Date().getFullYear()} 알파 아키텍트. 시뮬레이션 및 교육 목적으로만 사용하세요.
        </p>
      </div>
    </footer>
  );
};
