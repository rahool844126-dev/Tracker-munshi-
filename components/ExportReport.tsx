import React, { useMemo } from 'react';
import { getStrings } from '../constants';
import DonutChart from './DonutChart';
import TextSummary from './TextSummary';
import { formatCurrency } from '../utils';

type Strings = ReturnType<typeof getStrings>;

interface ReportData {
  userName: string;
  date: string;
  clothTypeName: string;
  category: string;
  count: number;
  rate?: number;
}

interface UserReportData {
    userName:string;
    data: ReportData[];
}

interface ExportReportProps {
  dataByUser: UserReportData[];
  filters: {
    users: string[];
    startDate: string;
    endDate: string;
    clothTypeName: string;
  }
  isPdfPage?: boolean;
  strings: Strings;
}

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });

const DailyBreakdown: React.FC<{ date: string; data: ReportData[], strings: Strings }> = ({ date, data, strings }) => {
    const { dailyCategoryTotals, dailyEarnings } = useMemo(() => {
        const totals: { [key: string]: number } = {};
        const sessionPieceMap = new Map<string, { totalPieces: number, rate: number }>();
        
        data.forEach(row => {
            totals[row.category] = (totals[row.category] || 0) + row.count;
            
            const sessionKey = `${row.userName}-${row.date}-${row.clothTypeName}`;
            if (!sessionPieceMap.has(sessionKey)) {
                sessionPieceMap.set(sessionKey, { totalPieces: 0, rate: row.rate || 0 });
            }
            const sessionData = sessionPieceMap.get(sessionKey)!;
            sessionData.totalPieces += row.count;
        });

        let earnings = 0;
        sessionPieceMap.forEach(session => {
            earnings += session.totalPieces * session.rate;
        });

        return { dailyCategoryTotals: totals, dailyEarnings: earnings };
    }, [data]);

    return (
        <div className="pt-4 mt-4 first:mt-0 first:pt-0 first:border-none border-t border-slate-200">
            <h3 className="text-center text-xl font-bold text-slate-700 mb-2">{formatDate(date)}</h3>
            <div className="bg-slate-100 p-4 rounded-xl">
                <div className="flex items-start gap-4">
                    <div className="w-1/2 flex-shrink-0">
                        <DonutChart summaryData={dailyCategoryTotals} useLightTheme={true} strings={strings} />
                    </div>
                    <div className="w-1/2 flex-1">
                        <TextSummary summaryData={dailyCategoryTotals} useLightTheme={true} disableAnimation={true} strings={strings} />
                    </div>
                </div>
                {dailyEarnings > 0 && (
                    <div className="text-center mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-500 font-semibold">Day Total</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(dailyEarnings)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const ExportReport: React.FC<ExportReportProps> = ({ dataByUser, filters, isPdfPage = false, strings }) => {
    const { overallSummary, dataByDate, totalEarnings } = useMemo(() => {
        const allData = dataByUser.flatMap(user => user.data.map(d => ({...d, userName: user.userName })));
        const categoryTotals: { [key: string]: number } = {};
        const groupedByDate = new Map<string, ReportData[]>();
        const sessionPieceMap = new Map<string, { totalPieces: number, rate: number }>();
        
        allData.forEach(row => {
            categoryTotals[row.category] = (categoryTotals[row.category] || 0) + row.count;

            if (!groupedByDate.has(row.date)) {
                groupedByDate.set(row.date, []);
            }
            groupedByDate.get(row.date)!.push(row);

            const sessionKey = `${row.userName}-${row.date}-${row.clothTypeName}`;
            if (!sessionPieceMap.has(sessionKey)) {
                sessionPieceMap.set(sessionKey, { totalPieces: 0, rate: row.rate || 0 });
            }
            const sessionData = sessionPieceMap.get(sessionKey)!;
            sessionData.totalPieces += row.count;
        });

        let calculatedEarnings = 0;
        sessionPieceMap.forEach(session => {
            calculatedEarnings += session.totalPieces * session.rate;
        });

        const sortedDateEntries = Array.from(groupedByDate.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        
        return { 
            overallSummary: { categoryTotals },
            dataByDate: sortedDateEntries,
            totalEarnings: calculatedEarnings
        };
    }, [dataByUser]);
    
    const isSingleUserReport = dataByUser.length === 1;
    const reportTitle = isSingleUserReport ? `${dataByUser[0].userName}'s Report` : strings.title;

    return (
        <div id="export-report-content" className="p-6 text-black" style={{ width: '480px', fontFamily: `'Inter', sans-serif`, backgroundColor: 'var(--surface-light)' }}>
            <header className="text-center mb-5 border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-extrabold text-slate-800">{reportTitle}</h1>
                <p className="text-sm text-slate-500">Work Summary Report</p>
                <p className="text-xs text-slate-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
            </header>
            
            {!isPdfPage && (
                <section className="mb-6">
                    <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Filters Applied</h2>
                    <div className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg space-y-1">
                        <p><strong>{strings.users}:</strong> {filters.users.join(', ')}</p>
                        <p><strong>{strings.dateRange}:</strong> {formatDate(filters.startDate)} to {formatDate(filters.endDate)}</p>
                        {filters.clothTypeName && <p><strong>{strings.clothTypeName}:</strong> contains "{filters.clothTypeName}"</p>}
                    </div>
                </section>
            )}

            <section className="mb-6">
                <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 text-center">Overall Summary</h2>
                <div className="bg-slate-100 p-4 rounded-xl">
                    <div className="flex items-start gap-4">
                        <div className="w-1/2 flex-shrink-0">
                            <DonutChart summaryData={overallSummary.categoryTotals} useLightTheme={true} strings={strings} />
                        </div>
                        <div className="w-1/2 flex-1">
                            <TextSummary summaryData={overallSummary.categoryTotals} useLightTheme={true} disableAnimation={true} strings={strings} />
                        </div>
                    </div>
                    {totalEarnings > 0 && (
                        <div className="text-center mt-4 pt-4 border-t border-slate-200">
                            <p className="text-base text-slate-500 font-semibold">Total Earnings</p>
                            <p className="text-3xl font-extrabold text-green-600">{formatCurrency(totalEarnings)}</p>
                        </div>
                    )}
                </div>
            </section>

            <section>
                <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                    Detailed Breakdown by Date
                </h2>
                <div>
                    {dataByDate.length > 0 ? (
                        dataByDate.map(([date, data]) => (
                            <DailyBreakdown key={date} date={date} data={data} strings={strings} />
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-4">No data found for the selected filters.</p>
                    )}
                </div>
            </section>
            
            <footer className="text-center mt-6 pt-4 border-t border-slate-200 text-xs text-slate-400">
                Generated by Garment Piece Tracker
            </footer>
        </div>
    );
};

export default ExportReport;