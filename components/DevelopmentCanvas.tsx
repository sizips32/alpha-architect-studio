import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-cyan-400">
        {children}
    </div>
);

const IdeaCard: React.FC<{ title: string; text: string; icon: React.ReactNode }> = ({ title, text, icon }) => (
    <div className="flex items-start space-x-4">
        <IconWrapper>{icon}</IconWrapper>
        <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-400">{text}</p>
        </div>
    </div>
);

export const DevelopmentCanvas: React.FC = () => {
    return (
        <div className="p-6 md:p-8 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-white">The Quant's Mindset: A Guide to Alpha Development</h2>
                <p className="mt-2 text-md text-gray-400">
                    This studio helps you generate and refine alpha ideas. Success requires not just good formulas, but the right mindset.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <IdeaCard 
                    title="Maintain Curiosity" 
                    text="Constantly experiment with new ideas. Find inspiration in news, research papers, and market anomalies to transform concepts into testable alphas."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
                />
                <IdeaCard 
                    title="Cut Your Losses" 
                    text="Acknowledge that no rule works perfectly forever. Have the discipline to abandon a strategy when its performance deviates from expectations. This is crucial for long-term success."
                    icon={<svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>}
                />
                <IdeaCard 
                    title="Focus on High-Value Work" 
                    text="Automate mundane tasks like data cleaning and simulation runs. Dedicate your time to what truly matters: creative idea generation, rigorous quality testing, and innovative research."
                    icon={<svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>}
                />
                <IdeaCard 
                    title="Explore Diverse Fields" 
                    text="Don't limit yourself to familiar fields. Use the Triple-Axis Plan (TAP) in the configuration panel to explore new datasets, regions, and performance goals. True innovation lies at the intersection of different domains."
                    icon={<svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>}
                />
            </div>
        </div>
    );
};