'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { FaSearch } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const { user, logIn, logOut } = useUser();
  const [address, setAddress] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address) {
      router.push(`/account/${address}`);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 fixed top-0 left-0 right-0">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Flow
        </Link>
        <form onSubmit={handleSubmit} className="flex-grow max-w-md mx-4">
          <div className="flex items-center">
            <input
              className="appearance-none bg-white border border-gray-300 rounded-l-lg w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500 shadow-sm h-10"
              type="text"
              placeholder="0x1234"
              aria-label="Flow address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-r-lg shadow-sm flex items-center justify-center h-10 w-12"
              type="submit"
              aria-label="Search"
            >
              <FaSearch className="text-xl" />
            </button>
          </div>
        </form>
        <div className="flex items-center">
          {user.loggedIn && (
            <span className="text-white mr-2">
              {user.addr}
            </span>
          )}
          <button
            onClick={user.loggedIn ? logOut : logIn}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            {user.loggedIn ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
