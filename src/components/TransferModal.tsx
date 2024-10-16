import React, { useState, useEffect, useCallback } from 'react';
import { Balance } from '../types/flow';
import { FaTrash, FaPlus, FaFileUpload } from 'react-icons/fa';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: Balance;
  onTransfer: (receiverAddresses: string[], amounts: string[]) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, balance, onTransfer }) => {
  const [transfers, setTransfers] = useState([{ receiverAddress: '', amount: '' }]);

  const close = () => {
    setTransfers([{ receiverAddress: '', amount: '' }]);
    onClose();
  }

  const validateReceiver = (address: string) => {
    if (!address) {
      return;
    }

    if (!address.startsWith('0x')) {
      return 'Must be a valid address';
    }
    return '';
  };

  const validateAmount = (value: string) => {
    if (!value) {
      return '';
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Amount must be a number';
    }
    if (numValue <= 0) {
      return 'Amount must be greater than 0';
    }
    if (numValue > balance.vaultBalance) {
      return 'Amount cannot exceed your balance';
    }
    return '';
  };

  const addTransferRow = () => {
    setTransfers([...transfers, { receiverAddress: '', amount: '' }]);
  };

  const removeTransferRow = (index: number) => {
    setTransfers(transfers.filter((_, i) => i !== index));
  };

  const handleTransfer = () => {
    const isValid = transfers.every(
      (transfer) => !validateReceiver(transfer.receiverAddress) && !validateAmount(transfer.amount)
    );
    if (isValid) {
      onTransfer(
        transfers.map((t) => t.receiverAddress),
        transfers.map((t) => t.amount)
      );
      close();
    }
  };

  const handleInputChange = (index: number, field: 'receiverAddress' | 'amount', value: string) => {
    const newTransfers = [...transfers];
    newTransfers[index][field] = value;
    setTransfers(newTransfers);
  };

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      close();
    }
  }, [onClose]);

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    }
  }, [onClose]);

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const newTransfers = lines.map(line => {
          const [receiverAddress, amount] = line.split(',');
          return { receiverAddress: receiverAddress.trim(), amount: amount.trim() };
        }).filter(transfer => transfer.receiverAddress && transfer.amount);
        setTransfers(newTransfers);
      };
      reader.readAsText(file);
    }
  };

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

  const isValid = transfers.every(
    (transfer) => !validateReceiver(transfer.receiverAddress) && !validateAmount(transfer.amount)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 modal-overlay">
      <div className="bg-white rounded-lg p-6 w-[32rem] max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold mb-4">Transfer {balance.display?.name || balance.vaultType}</h2>

        <div className="overflow-y-auto flex-grow mb-4">
          {transfers.map((transfer, index) => (
            <div key={index} className="mb-4 flex items-start space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Receiver Address"
                  value={transfer.receiverAddress}
                  onChange={(e) => handleInputChange(index, 'receiverAddress', e.target.value)}
                  className={`w-full p-2 border rounded ${validateReceiver(transfer.receiverAddress) ? 'border-red-500' : ''}`}
                />
                {validateReceiver(transfer.receiverAddress) && (
                  <p className="text-red-500 text-sm mt-1">{validateReceiver(transfer.receiverAddress)}</p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Amount"
                  value={transfer.amount}
                  onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                  className={`w-full p-2 border rounded ${validateAmount(transfer.amount) ? 'border-red-500' : ''}`}
                />
                {validateAmount(transfer.amount) && (
                  <p className="text-red-500 text-sm mt-1">{validateAmount(transfer.amount)}</p>
                )}
              </div>
              {transfers.length > 1 && (
                <button
                  onClick={() => removeTransferRow(index)}
                  className="text-red-500 hover:text-red-700 p-2 mt-1"
                  aria-label="Delete transfer"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={addTransferRow}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Add Row
          </button>

          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
          <label
            htmlFor="csv-upload"
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer flex items-center"
          >
            <FaFileUpload className="mr-2" /> Upload CSV
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={close}
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
