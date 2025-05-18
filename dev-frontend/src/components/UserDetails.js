// src/components/UserDetails.js
import React from 'react';
import { decodeJwt } from '../firebaseConfig'; // Import the decoder

function UserDetails({ user, idToken, onSignOut, onVerifyToken, onTestRoot, loading }) {
    const decodedClientToken = idToken ? decodeJwt(idToken) : null;

    return (
        <div id="userDetails">
            <h3>User Details</h3>
            <div id="userInfo">
                <p>Email: {user.email}</p>
                <p>UID: {user.uid}</p>
            </div>
            <button onClick={onSignOut} disabled={loading}>
                {loading ? 'Signing Out...' : 'Sign Out'}
            </button>
            <hr />
            <h4>ID Token:</h4>
            <div id="tokenInfo" style={{ wordBreak: 'break-all', maxHeight: '100px', overflowY: 'auto' }}>
                {idToken || 'No token available.'}
            </div>
            {decodedClientToken && (
                <div>
                    <h4>Decoded ID Token (Client-Side):</h4>
                    <pre style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap', maxHeight: '150px', overflowY: 'auto', backgroundColor: '#f0f0f0', padding: '10px' }}>
                        {JSON.stringify(decodedClientToken, null, 2)}
                    </pre>
                    <p>Client-Side Token Audience: {decodedClientToken.aud}</p>
                </div>
            )}
            <button onClick={onVerifyToken} disabled={loading || !idToken}>
                Test Token with Backend
            </button>
            <button onClick={onTestRoot} disabled={loading}>
                Test Root Endpoint
            </button>
        </div>
    );
}

export default UserDetails;