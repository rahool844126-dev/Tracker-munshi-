import React, { useMemo } from 'react';
import { getStrings, getCategoryStyles, getDefaultCategories } from '../constants';
import AnimatedValue from './AnimatedValue';
import { CategoryIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

interface TextSummaryProps {
  summaryData: { [key: string]: number };
  useLightTheme?: boolean;
  disableAnimation?: boolean;
  strings: Strings;
}

// These hex codes are from index.html's --*-light variables. Hardcoding them here
// makes the export component more robust and prevents issues where CSS variables
// might not be available or correct in the html2canvas rendering context.
const getCategoryLightColor = (category: string, strings: Strings): string => {
    const lightColors: { [key: string]: string } = {
        [strings.okCategory]: '#4f46e5',
        [strings.reworkCategory]: '#ca8a04',
        [strings.adasCategory]: '#0d9488',
        [strings.oilCategory]: '#dc2626',
        [strings.yarnCategory]: '#c026d3',
        [strings.secondOkCategory]: '#64748b',
    };
    return lightColors[category] || '#a0aec0'; // Fallback to tertiary text color
};


const TextSummary: React.FC<TextSummaryProps> = ({ summaryData, useLightTheme = false, disableAnimation = false, strings }) => {
    const sortedCategories = useMemo(() => {
        const categoriesWithValues = Object.keys(summaryData)
            .filter(cat => (summaryData[cat] as number) > 0);
            
        const defaultCategories = getDefaultCategories(strings);
        return categoriesWithValues.sort((a, b) => {
            const aIsDefault = defaultCategories.includes(a);
            const bIsDefault = defaultCategories.includes(b);
            if (aIsDefault && !bIsDefault) return -1;
            if (!aIsDefault && bIsDefault) return 1;
            if (aIsDefault && bIsDefault) return defaultCategories.indexOf(a) - defaultCategories.indexOf(b);
            // Fallback sort by value, descending
            return (summaryData[b] as number) - (summaryData[a] as number);
        });
    }, [summaryData, strings]);
    
    const grandTotal = useMemo(() => Object.values(summaryData).reduce((s: number, c: unknown) => s + (Number(c) || 0), 0), [summaryData]);

    if (grandTotal === 0) {
        return (
            <div className="flex-1 flex w-full items-center justify-center text-center text-sm text-[var(--secondary-text)]">
                <p>No data to display.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex-1 flex items-center justify-center">
            <div className="text-summary-list">
                {sortedCategories.map((cat, index) => {
                  const value = summaryData[cat];
                  const color = useLightTheme
                    ? getCategoryLightColor(cat, strings)
                    : (getCategoryStyles(strings)[cat]?.color || 'var(--tertiary-text)');
                  
                  const animationStyle = disableAnimation
                    ? { opacity: 1, transform: 'translateY(0px)' }
                    : { animationDelay: `${index * 80}ms` };

                  return (
                    <div 
                        key={cat} 
                        className="text-summary-item"
                        style={{ 
                          ...animationStyle,
                          backgroundColor: useLightTheme ? '#ffffff' : 'var(--bg)',
                        }}
                    >
                        <div className="text-summary-icon-container" style={{ '--color': color } as React.CSSProperties}>
                            <CategoryIcon category={cat} className="text-summary-icon" strings={strings} />
                        </div>
                        <span className="text-summary-label" style={{ '--color': color } as React.CSSProperties}>
                            {cat}
                        </span>
                        <div 
                            className="text-summary-value" 
                            style={{ color: useLightTheme ? '#1a202c' : 'var(--primary-text)'}}
                        >
                            <AnimatedValue value={value} />
                        </div>
                    </div>
                  );
                })}
            </div>
        </div>
    );
};

export default TextSummary;