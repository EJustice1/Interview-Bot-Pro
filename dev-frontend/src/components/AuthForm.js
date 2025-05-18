// src/components/AuthForm.js
import React, { useState } from 'react';

function AuthForm({ onSignUp, onSignIn, loading }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = (e) => {
        e.preventDefault();
        onSignUp(email, password);
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        onSignIn(email, password);
    };

    return (
        <div id="authForm">
            <h3>Sign Up / Sign In</h3>
            <form>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    disabled={loading}
                /><br />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    disabled={loading}
                /><br />
                <button onClick={handleSignUp} disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                <button onClick={handleSignIn} disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}

export default AuthForm;