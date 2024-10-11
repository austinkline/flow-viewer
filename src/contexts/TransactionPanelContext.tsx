'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TransactionPanelContextType {
    transactionId: string | null;
    setTransactionId: (id: string | null) => void;
}

const TransactionPanelContext = createContext<TransactionPanelContextType | undefined>(undefined);

export const TransactionPanelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transactionId, setTransactionId] = useState<string | null>(null);

    return (
        <TransactionPanelContext.Provider value={{ transactionId, setTransactionId }}>
            {children}
        </TransactionPanelContext.Provider>
    );
};

export const useTransactionPanel = () => {
    const context = useContext(TransactionPanelContext);
    if (context === undefined) {
        throw new Error('useTransactionPanel must be used within a TransactionPanelProvider');
    }
    return context;
};