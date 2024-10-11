'use client';

import React, { useEffect, useState } from 'react';
import { useTransactionPanel } from '../contexts/TransactionPanelContext';
import { waitForSeal } from '@/services/flow';

const TransactionPanel: React.FC = () => {
    const { transactionId, setTransactionId } = useTransactionPanel();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const clearState = () => {
        setPending(false)
        setErrorMessage(null)
        setSuccess(null)
        setTransactionId(null)
    }

    const handleTransactionId = async () => {
        if (!transactionId) {
            clearState()
            return
        }

        setPending(true)
        const res = await waitForSeal(transactionId)
        if (res.errorMessage) {
            setErrorMessage(res.errorMessage)
        } else {
            setSuccess("Transfer successful")
        }
        setPending(false)

        setTimeout(() => {
            clearState()
        }, 3000)
    }

    useEffect(() => {
        handleTransactionId()
    }, [transactionId])

    if (!transactionId) {
        return null;
    }

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4 transform transition-transform duration-300 ease-in-out">
            <h2 className="text-xl font-bold mb-4">Pending Transaction</h2>
            <p>Transaction ID: {transactionId}</p>

            {pending && (
                <div className="mt-4">
                    <p className="text-blue-500">Pending...</p>
                </div>
            )}

            {errorMessage && (
                <div className="mt-4">
                    <p className="text-red-500">{errorMessage}</p>
                </div>
            )}

            {!errorMessage && success && (
                <div className="mt-4">
                    <p className="text-green-500">{success}</p>
                </div>
            )}
        </div>
    );
};

export default TransactionPanel;