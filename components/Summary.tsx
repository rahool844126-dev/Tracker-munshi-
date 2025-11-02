import React, { useMemo, useState } from 'react';
import { Entry } from '../types';
import { getStrings } from '../constants';
import DonutChart from './DonutChart';
import TextSummary from './TextSummary';
import { FlipIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

interface SummaryProps {
  entries: Entry[];
  strings: Strings;
}

const Summary: React.FC<SummaryProps> = ({ entries, strings }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const summaryData = useMemo(() => {
        const totals: { [key: string]: number } = {};
        for (const entry of entries) {
            for (const category in entry.counts) {
                totals[category] = (totals[category] || 0) + (Number(entry.counts[category]) || 0);
            }
        }
        return totals;
    }, [entries]);
    
    return (
        <div 
            className={`flip-card ${isFlipped ? 'flipped' : ''}`} 
            onClick={() => setIsFlipped(!isFlipped)} 
            style={{ minHeight: 240 }}
        >
            <div className="absolute top-2 right-2 z-10 text-[var(--tertiary-text)] opacity-50 hover:opacity-100 transition-opacity">
                <FlipIcon />
            </div>
            <div className="flip-card-inner">
                <div className="flip-card-front">
                    <div className="bg-[var(--surface)] p-4 rounded-2xl flex flex-col items-center flex-1">
                        <h3 className="text-sm font-bold text-[var(--secondary-text)] mb-3 self-start">{strings.sessionSummary}</h3>
                        <DonutChart summaryData={summaryData} strings={strings} />
                    </div>
                </div>
                <div className="flip-card-back">
                    <div className="bg-[var(--surface)] p-4 rounded-2xl flex flex-col items-center flex-1">
                        <h3 className="text-sm font-bold text-[var(--secondary-text)] mb-3 self-start">{strings.categoryBreakdown}</h3>
                        <TextSummary summaryData={summaryData} strings={strings} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Summary;