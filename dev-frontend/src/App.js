// src/App.js
import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig'; // Import auth from your config
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    getIdToken
} from "firebase/auth";

import AuthForm from './components/AuthForm';
import UserDetails from './components/UserDetails';
import './App.css'; // Import styles

// Backend URL (same as before)
const API_GATEWAY_BASE_URL = "https://user-auth-gateway-59jf8ly3.uc.gateway.dev";

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [idToken, setIdToken] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // For disabling buttons during async ops
    const [backendResponse, setBackendResponse] = useState(null); // To show backend response

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                try {
                    const token = await getIdToken(user, true); // Force refresh
                    setIdToken(token);
                    console.log("CLIENT-SIDE ID Token refreshed:", token);
                } catch (err) {
                    console.error("Error getting ID token:", err);
                    setError("Error getting ID token: " + err.message);
                    setIdToken(null);
                }
            } else {
                setCurrentUser(null);
                setIdToken(null);
            }
            setError(''); // Clear previous errors on auth state change
            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup subscription on unmount
    }, []);

    const handleSignUp = async (email, password) => {
        setLoading(true);
        setError('');
        setBackendResponse(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle setting the user and token
        } catch (err) {
            console.error("Error signing up:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSignIn = async (email, password) => {
        setLoading(true);
        setError('');
        setBackendResponse(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle setting the user and token
        } catch (err) {
            console.error("Error signing in:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        setError('');
        setBackendResponse(null);
        try {
            await signOut(auth);
            // onAuthStateChanged will handle clearing user and token
        } catch (err) {
            console.error("Error signing out:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    const verifyTokenOnBackend = async () => {
        if (!idToken) {
            alert("No ID token available. Please sign in.");
            return;
        }
        setLoading(true);
        setError('');
        setBackendResponse(null);
        const backendUrl = `${API_GATEWAY_BASE_URL}/auth/verifyToken`;

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json(); // Try to parse as JSON first
            if (!response.ok) {
                throw new Error(data.message || `Backend error: ${response.status} ${JSON.stringify(data)}`);
            }
            console.log("Backend response:", data);
            setBackendResponse({ success: true, data });
            alert("Backend verification successful! Response: " + JSON.stringify(data));
        } catch (err) {
            console.error("Error verifying token with backend:", err);
            setError("Backend error: " + err.message);
            setBackendResponse({ success: false, message: err.message });
            alert("Error verifying token with backend. See console and error message on page.");
        } finally {
            setLoading(false);
        }
    };

    const testRootEndpoint = async () => {
        setLoading(true);
        setError('');
        setBackendResponse(null);
        const rootUrl = `${API_GATEWAY_BASE_URL}/`;

        try {
            const response = await fetch(rootUrl, { method: 'GET' });
            const textData = await response.text();
            if (!response.ok) {
                throw new Error(`Root endpoint error: ${response.status} ${textData}`);
            }
            console.log("Root endpoint response:", textData);
            setBackendResponse({ success: true, data: textData });
            alert("Root endpoint successful! Response: " + textData);
        } catch (err) {
            console.error("Error testing root endpoint:", err);
            setError("Root endpoint error: " + err.message);
            setBackendResponse({ success: false, message: err.message });
            alert("Error testing root endpoint. See console and error message on page.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="container">
            <h2>Firebase Auth Test (React)</h2>

            {error && <div className="errorInfo">{error}</div>}
            {backendResponse && (
                 <div className={backendResponse.success ? "userInfo" : "errorInfo"} style={{marginTop: '10px'}}>
                     <h4>Backend Response:</h4>
                     <pre>{typeof backendResponse.data === 'object' ? JSON.stringify(backendResponse.data, null, 2) : backendResponse.data || backendResponse.message}</pre>
                 </div>
             )}


            {!currentUser ? (
                <AuthForm onSignUp={handleSignUp} onSignIn={handleSignIn} loading={loading} />
            ) : (
                <UserDetails
                    user={currentUser}
                    idToken={idToken}
                    onSignOut={handleSignOut}
                    onVerifyToken={verifyTokenOnBackend}
                    onTestRoot={testRootEndpoint}
                    loading={loading}
                />
            )}
        </div>
    );
}

export default App;