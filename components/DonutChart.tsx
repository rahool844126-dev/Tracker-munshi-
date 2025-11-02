import React, { useMemo, useState, useEffect, useRef } from 'react';
import { getStrings, getDefaultCategories, getCategoryStyles } from '../constants';
import AnimatedValue from './AnimatedValue';

type Strings = ReturnType<typeof getStrings>;

interface DonutChartProps {
  summaryData: { [key:string]: number };
  size?: number;
  useLightTheme?: boolean;
  strings: Strings;
}

// Easing function for a more natural animation
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
};
  
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    // Prevent rendering a full circle, which SVG paths struggle with
    if (endAngle - startAngle >= 359.99) {
        endAngle = startAngle + 359.99;
    }
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const d = ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
    return d;
};

const getColor = (category: string, useLightTheme: boolean, strings: Strings) => {
    const style = getCategoryStyles(strings)[category];
    if (!style) return useLightTheme ? 'var(--tertiary-text-light)' : 'var(--tertiary-text)';
    if (useLightTheme) {
        return style.color.slice(0, -1) + '-light)';
    }
    return style.color;
}


const DonutChart: React.FC<DonutChartProps> = ({ summaryData, size = 210, useLightTheme = false, strings }) => {
    const [progress, setProgress] = useState(0);
    const summaryDataRef = useRef(JSON.stringify(summaryData));

    useEffect(() => {
        const newSummaryData = JSON.stringify(summaryData);
        // Only re-trigger animation if data has actually changed
        if (summaryDataRef.current === newSummaryData && progress === 1) {
            return;
        }
        summaryDataRef.current = newSummaryData;

        setProgress(0);
        let startTime: number | null = null;
        const animationDuration = 600;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const t = Math.min(elapsed / animationDuration, 1);
            const easedT = easeOutCubic(t);
            
            setProgress(easedT);

            if (elapsed < animationDuration) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [summaryData]);


    const grandTotal = useMemo(() => {
        return Object.values(summaryData).reduce((sum: number, current: unknown) => sum + (Number(current) || 0), 0);
    }, [summaryData]);

    const sortedCategories = useMemo(() => {
        const categoriesWithValues = Object.keys(summaryData)
            .filter(cat => (summaryData[cat] as number) > 0);
        
        const defaultCategories = getDefaultCategories(strings);
        const hasOil = categoriesWithValues.includes(strings.oilCategory);
        const hasAdas = categoriesWithValues.includes(strings.adasCategory);
        
        // Default sorting function
        const defaultSort = (arr: string[]) => arr.sort((a, b) => {
            const aIsDefault = defaultCategories.includes(a);
            const bIsDefault = defaultCategories.includes(b);
            if (aIsDefault && !bIsDefault) return -1;
            if (!aIsDefault && bIsDefault) return 1;
            if (aIsDefault && bIsDefault) return defaultCategories.indexOf(a) - defaultCategories.indexOf(b);
            return a.localeCompare(b);
        });

        // Special logic to separate Oil and ADAS if they are both present
        if (hasOil && hasAdas && categoriesWithValues.length > 2) {
            const otherItems = categoriesWithValues.filter(
                cat => cat !== strings.oilCategory && cat !== strings.adasCategory
            );
            defaultSort(otherItems); // Sort the other items to find a predictable buffer

            const oil = strings.oilCategory;
            const adas = strings.adasCategory;

            // New arrangement: [Oil, first_other, ADAS, ...rest_others]
            // This physically places a buffer between Oil and ADAS in the drawing order,
            // forcing them to be visually separated on the chart.
            const finalOrder = [
                oil,
                ...otherItems.slice(0, 1), // The first "other" item as a buffer
                adas,
                ...otherItems.slice(1) // The rest of the "other" items
            ];
            return finalOrder;
        }
        
        // If separation is not needed or not possible, return the default sorted list.
        return defaultSort(categoriesWithValues);
    }, [summaryData, strings]);
    
    const center = size / 2;
    const radius = size * 0.24;
    const strokeWidth = size * 0.072;
    const labelRadius = size * 0.4; // Tweak for better label spacing

    const chartData = useMemo(() => {
        if (grandTotal === 0) return [];
        let startAngle = 0;
        return sortedCategories.map(cat => {
            const percent = (summaryData[cat] as number) / grandTotal;
            const sweep = percent * 360;
            const animatedSweep = sweep * progress;

            const midAngle = startAngle + sweep / 2;
            
            const arcPath = describeArc(center, center, radius, startAngle, startAngle + animatedSweep);
            const pinStart = polarToCartesian(center, center, radius + strokeWidth / 2 + 2, midAngle);
            
            let textAnchor = 'middle';
            if (midAngle > 10 && midAngle < 170) textAnchor = 'start';
            else if (midAngle > 190 && midAngle < 350) textAnchor = 'end';

            let pinPath, labelPos;

            if (textAnchor === 'middle') { // Top or bottom, use straight line
                const pinEnd = polarToCartesian(center, center, labelRadius - 5, midAngle);
                pinPath = `M ${pinStart.x} ${pinStart.y} L ${pinEnd.x} ${pinEnd.y}`;
                labelPos = polarToCartesian(center, center, labelRadius, midAngle);
            } else { // Sides, use elbow line
                const elbowRadius = radius + strokeWidth * 1.2;
                const elbowPoint = polarToCartesian(center, center, elbowRadius, midAngle);

                const horizontalLineLength = size * 0.08; // Tweak for smaller size
                const labelX = textAnchor === 'start' 
                    ? elbowPoint.x + horizontalLineLength 
                    : elbowPoint.x - horizontalLineLength;
                
                pinPath = `M ${pinStart.x} ${pinStart.y} L ${elbowPoint.x} ${elbowPoint.y} L ${labelX} ${elbowPoint.y}`;
                labelPos = { x: labelX, y: elbowPoint.y };
            }

            const color = getColor(cat, useLightTheme, strings);
            const value = summaryData[cat] as number;
            startAngle += sweep;
            
            return { category: cat, arcPath, color, pinPath, labelPos, textAnchor, value };
        });
    }, [grandTotal, summaryData, sortedCategories, center, radius, strokeWidth, labelRadius, useLightTheme, progress, strings]);

    const hasSingleCategory = chartData.length === 1 && grandTotal > 0;
    const labelOpacity = Math.max(0, (progress - 0.5) * 2); // Start fading in at 50% progress

    return (
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="auto" className="max-w-xs">
            <circle cx={center} cy={center} r={radius} fill="none" stroke={useLightTheme ? 'var(--border-light)' : 'var(--border)'} strokeWidth={strokeWidth} opacity={0.5} />
            
            <g>
                {chartData.map(segment => (
                    <path key={segment.category} d={segment.arcPath} stroke={segment.color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
                ))}
            </g>

            {!hasSingleCategory && (
                <g style={{ opacity: labelOpacity }}>
                    {chartData.map(data => (
                        <g key={data.category + '-label'}>
                            <path d={data.pinPath} stroke={data.color} strokeWidth="1.5" fill="none" />
                            <text 
                                x={data.labelPos.x} y={data.labelPos.y} textAnchor={data.textAnchor}
                                dy="-0.2em" className="summary-label-name" style={{ fill: data.color }}
                            >
                                {data.category === strings.reworkCategory ? 'RW' : data.category}
                            </text>
                            <text 
                                x={data.labelPos.x} y={data.labelPos.y} textAnchor={data.textAnchor}
                                dy="1em" className="summary-label-value"
                            >
                                <AnimatedValue value={data.value} />
                            </text>
                        </g>
                    ))}
                </g>
            )}
            
            <text x={center} y={center} textAnchor="middle" dy="-0.2em" className="donut-chart-total-value">
                <AnimatedValue value={grandTotal} />
            </text>
            <text x={center} y={center} textAnchor="middle" dy="1.2em" className="donut-chart-total-label" style={{ fill: hasSingleCategory ? chartData[0].color : undefined }}>
                {hasSingleCategory ? chartData[0].category : strings.grandTotal}
            </text>
        </svg>
    );
};

export default DonutChart;