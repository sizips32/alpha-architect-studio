import React, { useState } from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z" />
    <path d="M5 21L6.5 18" />
    <path d="M17.5 18L19 21" />
  </svg>
);

const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

/**
 * Props for the ExpressionEditor component
 */
interface ExpressionEditorProps {
  /** Current alpha expression value */
  expression: string;
  /** Callback to update the expression */
  setExpression: (value: string) => void;
  /** Callback to generate expression from AI idea */
  onGenerate: (idea: string) => void;
  /** Whether AI generation is in progress */
  isAiLoading: boolean;
}

/**
 * Expression editor component for creating and editing alpha expressions
 * Provides a textarea for manual input and an AI-powered generation feature
 *
 * @param expression - Current alpha expression
 * @param setExpression - Function to update the expression
 * @param onGenerate - Function to generate expression from natural language idea
 * @param isAiLoading - Loading state for AI generation
 */
export const ExpressionEditor: React.FC<ExpressionEditorProps> = ({
  expression,
  setExpression,
  onGenerate,
  isAiLoading,
}) => {
  const [aiIdea, setAiIdea] = useState('');

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-100">알파 수식</h2>
        <p className="text-sm text-gray-400">수학 및 논리 연산자를 사용하여 알파를 정의하세요.</p>
        <textarea
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="예: rank(close / delay(close, 1))"
          className="w-full h-24 mt-2 p-3 font-mono text-sm bg-gray-950 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-y"
        />
      </div>
      <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
        <label
          htmlFor="ai-idea"
          className="flex items-center space-x-2 text-sm font-medium text-gray-300"
        >
          <SparklesIcon className="w-4 h-4 text-purple-400" />
          <span>AI로 생성하기</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="ai-idea"
            type="text"
            value={aiIdea}
            onChange={(e) => setAiIdea(e.target.value)}
            placeholder="트레이딩 아이디어를 설명하세요..."
            className="flex-grow bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          />
          <button
            onClick={() => onGenerate(aiIdea)}
            disabled={isAiLoading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-800 disabled:text-gray-400 disabled:cursor-not-allowed transition"
          >
            {isAiLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : '생성'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpressionEditor;
