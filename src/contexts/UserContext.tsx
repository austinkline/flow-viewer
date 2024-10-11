import React, { createContext, useState, useContext, useEffect } from 'react';
import * as fcl from "@onflow/fcl";
import { configure } from "@/services/flow";

const network = process.env.NEXT_PUBLIC_NETWORK || "emulator"
configure(network) // TODO: configure this in a settings dropdown on the navbar

interface User {
    loggedIn: boolean;
    addr: string | null;
}

interface UserContextType {
    user: User;
    logIn: () => void;
    logOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>({ loggedIn: false, addr: null });

    useEffect(() => {
        fcl.currentUser.subscribe(setUser);
    }, []);

    const logIn = () => {
        fcl.authenticate();
    };

    const logOut = () => {
        fcl.unauthenticate();
    };

    return (
        <UserContext.Provider value={{ user, logIn, logOut }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};