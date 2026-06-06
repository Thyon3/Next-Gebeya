import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = Cookies.get('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            setUser(user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/api/auth/login', { email, password });
        setUser(data);
        Cookies.set('userInfo', JSON.stringify(data), { expires: 30 });
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const logout = () => {
        setUser(null);
        Cookies.remove('userInfo');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateProfile = (updatedUser) => {
        const newUser = { ...user, ...updatedUser };
        setUser(newUser);
        Cookies.set('userInfo', JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
