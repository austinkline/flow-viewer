'use client';

import React from 'react';
import { UserProvider } from '@/contexts/UserContext';

const UserWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <UserProvider>{children}</UserProvider>;
};

export default UserWrapper;