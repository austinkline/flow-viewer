'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccountSummary } from '@/services/flow';
import { AccountSummary } from '@/types/flow';
import { FungibleTokenCard } from '@/components/FungibleTokenCard';
import { useUser } from '@/contexts/UserContext';

export default function AccountPage() {
  const { address } = useParams();
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    async function fetchAccountSummary() {
      if (!address) return;

      try {
        setLoading(true);
        const summary = await getAccountSummary(address as string);
        setAccountSummary(summary);
      } catch (err) {
        console.error('Error fetching account summary:', err);
        setError('Failed to fetch account summary');
      } finally {
        setLoading(false);
      }
    }

    fetchAccountSummary();
  }, [address]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading account summary...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!accountSummary) {
    return <div className="flex justify-center items-center min-h-screen">No account summary available.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Account Details</h1>
      <p className="text-xl mb-4">Address: {address}</p>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="mb-2">Flow Balance: {accountSummary.flowBalance} FLOW</p>
        <p>Flow Available Balance: {accountSummary.flowAvailableBalance} FLOW</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Token Balances</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accountSummary.balances.map((balance, index) => (
          <FungibleTokenCard 
            key={index} 
            balance={balance} 
            currentUserAddress={user.addr}
            viewedAddress={address as string}
          />
        ))}
      </div>
    </div>
  );
}