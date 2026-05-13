import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('automate_user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            localStorage.removeItem('automate_user');
            return null;
        }
    });

    const login = (email, password) => {
        // Mock Auth Logic
        // Admin login removed as per request


        if (email === 'patel@gmail.com' && password === 'owner123') {
            const shopOwner = {
                id: 'owner_patel',
                email,
                role: 'OWNER',
                name: 'Mr. Patel',
                shopId: 'shop_patel_001'
            };
            setUser(shopOwner);
            localStorage.setItem('automate_user', JSON.stringify(shopOwner));
            return { success: true };
        }

        return { success: false, message: 'Invalid credentials' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('automate_user');
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isOwner: user?.role === 'OWNER'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
