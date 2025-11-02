import { ClothSession } from './types';

export const calculateSessionEarnings = (session: ClothSession): number => {
    if (!session.rate || session.rate <= 0) return 0;
    const totalPieces = session.entries.reduce((totalSum, entry) => {
        const entryTotal = Object.values(entry.counts).reduce((entrySum, count) => entrySum + count, 0);
        return totalSum + entryTotal;
    }, 0);
    return totalPieces * session.rate;
};

export const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
};
