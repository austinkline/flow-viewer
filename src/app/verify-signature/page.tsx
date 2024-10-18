'use client';

import React, { useState } from 'react';
import { ethers, Wallet } from 'ethers';

const VerifySignature: React.FC = () => {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [recoveredAddress, setRecoveredAddress] = useState('');

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handleSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSignature(event.target.value);
    };

    const processMessage = async () => {
        try {
            const recoveredAddr = ethers.verifyMessage(message, signature);
            setRecoveredAddress(recoveredAddr);
        } catch (error) {
            setRecoveredAddress('');
            console.error(error); // Log the entire error object
        }
    };

    return (
        <div className="max-w-md mx-auto p-5">
            <div className="mb-5">
                <label htmlFor="message" className="block mb-2">Message:</label>
                <input
                    type="text"
                    id="message"
                    value={message}
                    onChange={handleMessageChange}
                    className="w-full p-2 border border-gray-300 rounded mb-3"
                />
                <label htmlFor="signature" className="block mb-2">Signature:</label>
                <input
                    type="text"
                    id="signature"
                    value={signature}
                    onChange={handleSignatureChange}
                    className="w-full p-2 border border-gray-300 rounded mb-3"
                />
                <button
                    onClick={processMessage}
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200"
                >
                    Verify
                </button>
            </div>
            <div className="mb-5">
                <div className="mb-2">
                    <strong>Recovered Address:</strong> {recoveredAddress || 'N/A'}
                </div>
            </div>
        </div>
    );
};

export default VerifySignature;
