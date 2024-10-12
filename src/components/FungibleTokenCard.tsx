'use client';

import React, { useState } from 'react';
import { Balance } from '../types/flow';
import Image from 'next/image';
import { getImageUrl } from '@/services/image';
import { TransferModal } from './TransferModal';
import { sendTokens } from '@/services/flow';
import { useTransactionPanel } from '@/contexts/TransactionPanelContext';

interface FungibleTokenCardProps {
    balance: Balance;
    currentUserAddress: string | null;
    viewedAddress: string;
}

export const FungibleTokenCard: React.FC<FungibleTokenCardProps> = ({
    balance,
    currentUserAddress,
    viewedAddress
}) => {
    const logo = balance.display?.logos?.length ? balance.display.logos[0] : null;
    const [imageError, setImageError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { setTransactionId } = useTransactionPanel();

    const isClickable = currentUserAddress && currentUserAddress === viewedAddress;

    const handleTransfer = async (receiverAddress: string, amount: string) => {
        const txnId = await sendTokens(receiverAddress, parseFloat(amount), balance)
        setTransactionId(txnId)
    };

    const handleClick = () => {
        if (isClickable) {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div
                className={`bg-gray-50 shadow-md rounded-lg p-4 mb-4 relative ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}`}
                onClick={handleClick}
            >
                {logo && !imageError && (
                    <div className="absolute top-2 right-2 w-12 h-12">
                        <Image
                            src={getImageUrl(logo.url)}
                            alt={"token logo"}
                            width={48}
                            height={48}
                            className="rounded-full"
                            onError={() => setImageError(true)}
                        />
                    </div>
                )}
                <h3 className="text-lg font-semibold mb-2 pr-14">
                    {balance.display?.name || balance.vaultType}
                </h3>
                {balance.display?.symbol && (
                    <p className="text-gray-600 mb-2">
                        Symbol: {balance.display.symbol}
                    </p>
                )}
                <p className="text-gray-600 mb-2">
                    Balance: {balance.vaultBalance.toLocaleString()} {balance.display?.symbol}
                </p>
                {balance.display?.externalUrl && (
                    <a
                        href={balance.display.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        More Info
                    </a>
                )}
            </div>
            {isClickable && (
                <TransferModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    balance={balance}
                    onTransfer={handleTransfer}
                />
            )}
        </>
    );
};