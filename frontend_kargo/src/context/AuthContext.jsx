import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const username = localStorage.getItem('username');

        if (token) {
            setUser({ token, role, username });
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);




    
    const login = (userData) => {
        
        localStorage.setItem('token', userData.access_token);
        localStorage.setItem('role', userData.role);
        localStorage.setItem('username', userData.username);

        setUser({
            token: userData.access_token,
            role: userData.role,
            username: userData.username
        });
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.access_token}`;
    };






    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };





    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
