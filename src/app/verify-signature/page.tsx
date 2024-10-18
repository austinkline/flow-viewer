'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';

const VerifySignature: React.FC = () => {
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState('');
    const [privateKey, setPrivateKey] = useState('');
    const [recoveredAddress, setRecoveredAddress] = useState('');
    const [generatedSignature, setGeneratedSignature] = useState('');
    const [isSignatureValid, setIsSignatureValid] = useState<boolean | null>(null);

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handleSignatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSignature(event.target.value);
    };

    const handlePrivateKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrivateKey(event.target.value);
    };

    const processMessage = async () => {
        try {
            // Sign the message with the provided private key
            const wallet = new ethers.Wallet(privateKey);
            const generatedSig = await wallet.signMessage(message);
            setGeneratedSignature(generatedSig);

            // Verify the provided signature
            const recoveredAddr = ethers.verifyMessage(message, signature);
            setRecoveredAddress(recoveredAddr);

            // Compare the generated signature with the provided signature
            setIsSignatureValid(generatedSig === signature);
        } catch (error) {
            setRecoveredAddress('');
            setGeneratedSignature('');
            setIsSignatureValid(null);
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
                <label htmlFor="privateKey" className="block mb-2">Private Key:</label>
                <input
                    type="text"
                    id="privateKey"
                    value={privateKey}
                    onChange={handlePrivateKeyChange}
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
                <div className="mb-2">
                    <strong>Generated Signature:</strong> {generatedSignature || 'N/A'}
                </div>
                <div className="mb-2">
                    <strong>Signature Matches:</strong> {isSignatureValid === null ? 'N/A' : isSignatureValid ? 'Yes' : 'No'}
                </div>
            </div>
        </div>
    );
};

export default VerifySignature;
