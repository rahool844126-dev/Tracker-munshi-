import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User } from '../types';
import { getStrings } from '../constants';
import { ImageIcon, PdfIcon } from './Icons';
import ExportReport from './ExportReport';

// Make html2canvas and jsPDF available to TypeScript
declare const html2canvas: any;
declare const jspdf: any;

type Strings = ReturnType<typeof getStrings>;

interface ExportDataModalProps {
  users: User[];
  onClose: () => void;
  strings: Strings;
}

type ExportFormat = 'csv' | 'pdf';

interface CsvRow {
    userName: string;
    date: string;
    clothTypeName: string;
    entryTimestamp: string;
    category: string;
    count: number;
    rate?: number;
}

export interface UserReportData {
    userName: string;
    data: CsvRow[];
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ users, onClose, strings }) => {
    const today = new Date().toISOString().split('T')[0];
    const oldestRecordDate = useMemo(() => {
        let oldest = today;
        users.forEach(user => {
            if (user.dailyRecords.length > 0) {
                const userOldest = user.dailyRecords[user.dailyRecords.length - 1].date;
                if (userOldest < oldest) {
                    oldest = userOldest;
                }
            }
        });
        return oldest;
    }, [users, today]);

    const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
    const [startDate, setStartDate] = useState(oldestRecordDate);
    const [endDate, setEndDate] = useState(today);
    const [sessionNameFilter, setSessionNameFilter] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<{ [id: string]: boolean }>(() => {
        const initialSelection: { [id: string]: boolean } = {};
        users.forEach(u => initialSelection[u.id] = true); // Select all by default
        return initialSelection;
    });
    const [isExporting, setIsExporting] = useState(false);
    
    // State to manage rendering the hidden report component
    const [reportDataForRender, setReportDataForRender] = useState<UserReportData[] | null>(null);
    const reportContainerRef = useRef<HTMLDivElement>(null);


    const handleToggleUser = (userId: string) => {
        setSelectedUserIds(prev => ({...prev, [userId]: !prev[userId]}));
    };

    const handleSelectAllUsers = () => {
        const allSelected: { [id: string]: boolean } = {};
        users.forEach(u => allSelected[u.id] = true);
        setSelectedUserIds(allSelected);
    };

    const handleDeselectAllUsers = () => {
        setSelectedUserIds({});
    };

    const handleExport = async () => {
        setIsExporting(true);

        const activeUserIds = Object.keys(selectedUserIds).filter(id => selectedUserIds[id]);
        const usersToExport = users.filter(u => activeUserIds.includes(u.id));
        
        const filteredDataByUser = new Map<string, CsvRow[]>();

        usersToExport.forEach(user => {
            const userData: CsvRow[] = [];
            user.dailyRecords.forEach(record => {
                if (record.date >= startDate && record.date <= endDate) {
                    record.sessions.forEach(session => {
                        const sessionNameLower = session.clothType.toLowerCase();
                        const filterLower = sessionNameFilter.trim().toLowerCase();
                        if (!filterLower || sessionNameLower.includes(filterLower)) {
                            session.entries.forEach(entry => {
                                Object.entries(entry.counts).forEach(([category, count]) => {
                                    userData.push({
                                        userName: user.name,
                                        date: record.date,
                                        clothTypeName: session.clothType,
                                        entryTimestamp: entry.timestamp,
                                        category: category,
                                        count: Number(count),
                                        rate: session.rate,
                                    });
                                });
                            });
                        }
                    });
                }
            });
            if(userData.length > 0) {
              filteredDataByUser.set(user.name, userData);
            }
        });
        
        const dataForReport: UserReportData[] = Array.from(filteredDataByUser.entries()).map(([userName, data]) => ({
            userName, data,
        }));

        if (dataForReport.length === 0) {
            alert('No data to export for the selected filters.');
            setIsExporting(false);
            return;
        }

        const selectedUsersForFilter = users.filter(u => activeUserIds.includes(u.id));
        const userFilterNames = (selectedUsersForFilter.length === users.length && users.length > 1)
            ? ['All Users']
            : selectedUsersForFilter.map(u => u.name);
        const filters = { users: userFilterNames, startDate, endDate, clothTypeName: sessionNameFilter.trim() };

        // Wait for render
        const waitForRender = () => new Promise(resolve => setTimeout(resolve, 100));

        if (exportFormat === 'csv') { // This is now the Image Export
            setReportDataForRender(dataForReport);
            await waitForRender();

            const reportElement = reportContainerRef.current?.querySelector<HTMLElement>('#export-report-content');
            if (!reportElement) {
                alert('Failed to find report content to export.');
                setIsExporting(false);
                setReportDataForRender(null);
                return;
            }
            
            try {
                const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: '#f4f7fa' });
                
                const link = document.createElement('a');
                const formattedDate = new Date().toISOString().split('T')[0];
                link.download = `garment-tracker-report-${formattedDate}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Error generating image:', error);
                alert('Sorry, there was an error generating the report card image.');
            }
        } else if (exportFormat === 'pdf') {
            try {
                const { jsPDF } = jspdf;
                const doc = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = doc.internal.pageSize.getHeight();

                const dataByUser = dataForReport.sort((a, b) => a.userName.localeCompare(b.userName));

                for (let i = 0; i < dataByUser.length; i++) {
                    const userReport = dataByUser[i];
                    setReportDataForRender([userReport]); // Render one user at a time
                    await waitForRender();
                    
                    const reportElement = reportContainerRef.current?.querySelector<HTMLElement>('#export-report-content');
                    if (!reportElement) continue;

                    const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, backgroundColor: '#f4f7fa' });
                    const imgData = canvas.toDataURL('image/png');
                    const aspectRatio = canvas.width / canvas.height;
                    
                    let finalImgWidth = pdfWidth - 40;
                    let finalImgHeight = finalImgWidth / aspectRatio;
                    if (finalImgHeight > pdfHeight - 40) {
                        finalImgHeight = pdfHeight - 40;
                        finalImgWidth = finalImgHeight * aspectRatio;
                    }

                    if (i > 0) doc.addPage();
                    doc.addImage(imgData, 'PNG', (pdfWidth - finalImgWidth) / 2, 20, finalImgWidth, finalImgHeight);
                }
                
                const formattedDate = new Date().toISOString().split('T')[0];
                doc.save(`garment-tracker-report-${formattedDate}.pdf`);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Sorry, there was an error generating the PDF report.');
            }
        }
        
        setIsExporting(false);
        setReportDataForRender(null); // Clean up the hidden component
        onClose();
    };

    const selectedUserCount = Object.values(selectedUserIds).filter(Boolean).length;
    
    // The component to be rendered off-screen for capturing
    const HiddenReport = () => (
        <div ref={reportContainerRef} style={{ position: 'absolute', left: '-9999px', top: '0px', zIndex: -1, fontFamily: `'Inter', sans-serif` }}>
            {reportDataForRender && (
                 <ExportReport dataByUser={reportDataForRender} filters={{ users: [], startDate: '', endDate: '', clothTypeName: ''}} isPdfPage={exportFormat === 'pdf'} strings={strings} />
            )}
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
                <div className="modal-content-pane p-6 rounded-2xl max-w-md w-full flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-2">{strings.exportDataTitle}</h3>
                    <p className="text-sm text-[var(--secondary-text)] mb-4">{strings.exportDataDescription}</p>

                    <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-4 py-4 border-t border-b border-[var(--border)]">
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-sm">{strings.exportFormat}</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setExportFormat('pdf')} 
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${exportFormat === 'pdf' ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)] hover:border-[var(--secondary-text)]'}`}
                                >
                                    <PdfIcon className="w-8 h-8 mb-2 text-[var(--accent)]" />
                                    <span className="text-sm font-semibold">{strings.exportFormatPdf}</span>
                                </button>
                                <button 
                                    onClick={() => setExportFormat('csv')} 
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${exportFormat === 'csv' ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)] hover:border-[var(--secondary-text)]'}`}
                                >
                                    <ImageIcon className="w-8 h-8 mb-2 text-[var(--accent)]" />
                                    <span className="text-sm font-semibold">{strings.exportFormatCsv}</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-sm">{strings.users} ({users.length})</h4>
                                <div className="flex gap-2">
                                    <button onClick={handleSelectAllUsers} className="text-xs font-semibold text-[var(--accent)]">{strings.selectAll}</button>
                                    <button onClick={handleDeselectAllUsers} className="text-xs font-semibold text-[var(--accent)]">{strings.deselectAll}</button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                {users.map(user => (
                                    <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg)] cursor-pointer">
                                        <input type="checkbox"
                                            checked={!!selectedUserIds[user.id]}
                                            onChange={() => handleToggleUser(user.id)}
                                            className="h-5 w-5 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                                        />
                                        <p className="font-medium">{user.name}</p>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="exportStartDate" className="text-sm font-semibold mb-1 block">{strings.from}</label>
                                <input type="date" id="exportStartDate" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="exportEndDate" className="text-sm font-semibold mb-1 block">{strings.to}</label>
                                <input type="date" id="exportEndDate" value={endDate} onChange={e => setEndDate(e.target.value)}
                                className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="sessionNameFilter" className="text-sm font-semibold mb-1 block">{strings.sessionNameFilter}</label>
                            <input type="text" id="sessionNameFilter" value={sessionNameFilter} onChange={e => setSessionNameFilter(e.target.value)}
                                placeholder={strings.sessionNameFilterPlaceholder}
                                className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md" />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 flex-shrink-0">
                        <button onClick={onClose} className="flex-1 py-3 bg-[var(--bg)] rounded-lg font-semibold transition-colors hover:opacity-80">Cancel</button>
                        <button onClick={handleExport} className="flex-1 py-3 bg-[var(--accent)] text-white rounded-lg font-semibold disabled:opacity-50 transition-colors hover:bg-[var(--accent-dark)]"
                            disabled={isExporting || selectedUserCount === 0}
                        >
                            {isExporting ? strings.exporting : `${strings.exportData}`}
                        </button>
                    </div>
                </div>
            </div>
            <HiddenReport />
        </>
    );
};

export default ExportDataModal;
