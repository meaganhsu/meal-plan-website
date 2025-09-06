import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import '../styles/Authentication.css';

const PASSWORD = import.meta.env.VITE_APP_PASSWORD;

export default function Authentication() {
    const [input, setInput] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState('');

    // check if user is already authenticated
    useEffect(() => {
        const isAuth = localStorage.getItem('authenticated');
        if (isAuth === 'true') {
            setAuthenticated(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input === PASSWORD) {
            setAuthenticated(true);
            setError('');
            // store authentication state in localStorage
            localStorage.setItem('authenticated', 'true');
        } else {
            setError('Incorrect password');
        }
    };

    if (!authenticated) {
        return (
            <div className="auth-container">
                <h2 className="auth-title">Login</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        className="auth-input"
                    />
                    <button type="submit" className="auth-button">Login</button>
                    {error && <span className="auth-error">{error}</span>}
                </form>
            </div>
        );
    }

    return <Outlet />;
}