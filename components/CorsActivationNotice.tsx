import React from 'react';

interface CorsActivationNoticeProps {
  activationUrl: string;
  onDismiss: () => void;
}

const ExternalLinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);

export const CorsActivationNotice: React.FC<CorsActivationNoticeProps> = ({ activationUrl, onDismiss }) => {
  return (
    <div className="relative p-6 bg-yellow-900/50 text-yellow-200 border border-yellow-700 rounded-lg" role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-bold text-yellow-100">Action Required: Activate Data Proxy</h3>
          <div className="mt-2 text-sm text-yellow-200 space-y-2">
            <p>To fetch live financial data, this app uses a public proxy service that requires one-time activation per browser session.</p>
            <p>Please click the button below to open the activation page in a new tab. On that page, click the button to request temporary access, then return to this tab and run the backtest again.</p>
          </div>
          <div className="mt-4">
            <a
              href={activationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-gray-950 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-950 transition"
            >
              <ExternalLinkIcon className="w-4 h-4" />
              Activate Proxy Service
            </a>
          </div>
        </div>
      </div>
      <button 
        onClick={onDismiss} 
        className="absolute top-0 right-0 p-3"
        aria-label="Dismiss"
      >
        <svg className="fill-current h-6 w-6 text-yellow-400 hover:text-yellow-200" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </button>
    </div>
  );
};
