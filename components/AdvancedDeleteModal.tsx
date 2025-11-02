import React, { useState, useMemo } from 'react';
import { DailyRecord, SessionToDelete } from '../types';
import { getStrings } from '../constants';

type Strings = ReturnType<typeof getStrings>;

interface AdvancedDeleteModalProps {
  records: DailyRecord[];
  onClose: () => void;
  onConfirmDelete: (sessionsToDelete: SessionToDelete[]) => void;
  strings: Strings;
}

const AdvancedDeleteModal: React.FC<AdvancedDeleteModalProps> = ({ records, onClose, onConfirmDelete, strings }) => {
  const today = new Date().toISOString().split('T')[0];
  const oldestRecordDate = useMemo(() => {
    if (records.length === 0) return today;
    return records[records.length - 1].date;
  }, [records]);

  const [startDate, setStartDate] = useState(oldestRecordDate);
  const [endDate, setEndDate] = useState(today);
  const [selectedSessions, setSelectedSessions] = useState<{ [id: string]: SessionToDelete }>({});
  const [confirmText, setConfirmText] = useState('');

  const sessionsInRange = useMemo(() => {
    const sessions: (SessionToDelete & { date: string; name: string })[] = [];
    records.forEach(record => {
      if (record.date >= startDate && record.date <= endDate) {
        record.sessions.forEach(session => {
          if (!session.deletedAt) { // Only show non-archived sessions
            sessions.push({
              recordId: record.id,
              sessionId: session.id,
              date: record.date,
              name: session.clothType
            });
          }
        });
      }
    });
    return sessions.sort((a, b) => b.date.localeCompare(a.date) || b.name.localeCompare(a.name));
  }, [records, startDate, endDate]);

  const handleToggleSession = (session: SessionToDelete) => {
    const newSelected = { ...selectedSessions };
    if (newSelected[session.sessionId]) {
      delete newSelected[session.sessionId];
    } else {
      newSelected[session.sessionId] = session;
    }
    setSelectedSessions(newSelected);
  };

  const handleSelectAll = () => {
    const allSelected: { [id: string]: SessionToDelete } = {};
    sessionsInRange.forEach(s => {
      allSelected[s.sessionId] = { recordId: s.recordId, sessionId: s.sessionId };
    });
    setSelectedSessions(allSelected);
  };
  
  const handleDeselectAll = () => {
    setSelectedSessions({});
  };

  const selectedCount = Object.keys(selectedSessions).length;

  const handleDelete = () => {
    if (confirmText !== 'ARCHIVE' || selectedCount === 0) return;
    onConfirmDelete(Object.values(selectedSessions));
    onClose();
  };
  
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="modal-content-pane p-6 rounded-2xl max-w-md w-full flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-2">{strings.archiveTitle}</h3>
        <p className="text-sm text-[var(--secondary-text)] mb-4">{strings.archiveDescription}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="text-sm font-semibold mb-1 block">{strings.from}</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md" />
          </div>
          <div>
            <label htmlFor="endDate" className="text-sm font-semibold mb-1 block">{strings.to}</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md" />
          </div>
        </div>

        <div className="border-t border-b border-[var(--border)] -mx-6 px-6 py-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">{strings.sessionsInDateRange} ({sessionsInRange.length})</h4>
            <div className="flex gap-2">
                <button onClick={handleSelectAll} className="text-xs font-semibold text-[var(--accent)]" disabled={sessionsInRange.length === 0}>{strings.selectAll}</button>
                <button onClick={handleDeselectAll} className="text-xs font-semibold text-[var(--accent)]" disabled={selectedCount === 0}>{strings.deselectAll}</button>
            </div>
          </div>
          {sessionsInRange.length > 0 ? (
            <div className="space-y-2">
              {sessionsInRange.map(session => (
                <label key={session.sessionId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg)] cursor-pointer">
                  <input type="checkbox"
                    checked={!!selectedSessions[session.sessionId]}
                    onChange={() => handleToggleSession(session)}
                    className="h-5 w-5 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{session.name}</p>
                    <p className="text-xs text-[var(--secondary-text)]">{formatDate(session.date)}</p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-[var(--secondary-text)] py-8">{strings.noSessionsFound}</p>
          )}
        </div>
        
        {selectedCount > 0 && (
          <div className="pt-4 flex-shrink-0">
            <p className="text-sm text-[var(--secondary-text)] mb-2 whitespace-pre-wrap">{strings.archiveConfirmation.replace('{count}', String(selectedCount))}</p>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              className="w-full p-2 bg-[var(--bg)] border border-[var(--border)] rounded-md mb-4"
              placeholder="ARCHIVE" autoCapitalize="off" autoCorrect="off"
            />
          </div>
        )}

        <div className="flex gap-2 pt-4 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2 bg-[var(--border)] rounded-md font-semibold">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-2 bg-red-500 text-white rounded-md font-semibold disabled:opacity-50"
            disabled={confirmText !== 'ARCHIVE' || selectedCount === 0}
          >
            {strings.archiveSelected} ({selectedCount})
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdvancedDeleteModal;