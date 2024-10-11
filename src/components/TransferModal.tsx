import React, { useState, useEffect, useCallback } from 'react';
import { Balance } from '../types/flow';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: Balance;
  onTransfer: (receiverAddress: string, amount: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, balance, onTransfer }) => {
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [receiverError, setReceiverError] = useState('');
  const [amountError, setAmountError] = useState('');

  const validateReceiver = (address: string) => {
    if (!address.startsWith('0x')) {
      setReceiverError('Must be a valid address');
      return false;
    }
    setReceiverError('');
    return true;
  };

  const validateAmount = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setAmountError('Amount must be a number');
      return false;
    }
    if (numValue <= 0) {
      setAmountError('Amount must be greater than 0');
      return false;
    }
    if (numValue > balance.vaultBalance) {
      setAmountError('Amount cannot exceed your balance');
      return false;
    }
    setAmountError('');
    return true;
  };

  const handleTransfer = () => {
    if (validateReceiver(receiverAddress) && validateAmount(amount)) {
      onTransfer(receiverAddress, amount);
      onClose();
    }
  };

  const handleReceiverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReceiverAddress(value);
    validateReceiver(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    validateAmount(value);
  };

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      onClose();
    }
  }, [onClose]);

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleOutsideClick, handleEscapeKey]);

  if (!isOpen) return null;

  const isValid = !receiverError && !amountError && receiverAddress && amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 modal-overlay">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Transfer {balance.display?.name || balance.vaultType}</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Receiver Address"
            value={receiverAddress}
            onChange={handleReceiverChange}
            className={`w-full p-2 border rounded ${receiverError ? 'border-red-500' : ''}`}
          />
          {receiverError && <p className="text-red-500 text-sm mt-1">{receiverError}</p>}
        </div>
        <div className="mb-4">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={handleAmountChange}
            className={`w-full p-2 border rounded ${amountError ? 'border-red-500' : ''}`}
          />
          {amountError && <p className="text-red-500 text-sm mt-1">{amountError}</p>}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isValid}
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
};