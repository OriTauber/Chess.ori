// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // Adjust this to match your backend URL
    withCredentials: true // This is important to send cookies with requests
});

export const register = async (username, password) => {
    return api.post('/users', { username, password });
};

export const login = async (username, password) => {
    return api.post('/login', { username, password });
};

export const logout = async () => {
    return api.post('/logout');
};

export const getProtectedData = async () => {
    return api.get('/protected');
};
