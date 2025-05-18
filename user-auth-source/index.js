// dummy_function_code_node/index.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// No need to pass credentials if running in a GCP environment (like Cloud Functions)
// that has a service account with appropriate permissions.
// The SDK will automatically detect the environment and credentials.
// Make sure your Cloud Function's service account has necessary Firebase/Identity Toolkit permissions.
try {
  admin.initializeApp();
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  // If initialization fails, subsequent calls to admin services will fail.
  // You might want to handle this more gracefully in a real app,
  // perhaps by having the function return an error immediately.
}

/**
 * HTTP Cloud Function to demonstrate ID token verification.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.handleAuthRequest = async (req, res) => {
  console.log('Received request:', req.method, req.path);
  
  // Set CORS headers
  // Allow requests from any origin. For production, you might want to restrict this
  // to specific domains, e.g., res.setHeader('Access-Control-Allow-Origin', 'https://yourfrontend.com');
  //TODO: Change this to just be the front end in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '3600'); 

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Inside OPTIONS block. Setting status to 204.');
    res.status(204).send(''); 
    console.log('After res.status(204).send(). Returning from OPTIONS block.');
    return;
  }
  console.log('After OPTIONS block. req.method:', req.method, 'req.path:', req.path);

  if (req.path === '/') {
    console.log('Inside / path block. req.method:', req.method);
    if (req.method === 'GET') {
       console.log('Inside / and GET block. Sending 200 for root.');
       return res.status(200).send('User Auth Service (Node.js with Firebase Admin SDK initialized). Use POST /verifyToken to test token verification.');
    }
    console.log('Inside / path block but not GET. Sending 405.');
    return res.status(405).send('Method Not Allowed or Invalid Path');
  }

  // Protected endpoint that verifies a Firebase ID token
  if (req.path === '/auth/verifyToken') {
    console.log(`HIT /auth/verifyToken. Method is: ${req.method}`); 
    if (req.method === 'POST') {
      console.log('Correctly identified POST for /auth/verifyToken');
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        console.log('No Bearer token found in Authorization header.');
        return res.status(401).send('Unauthorized: No token provided.');
      }

      const idToken = authorizationHeader.split('Bearer ')[1];

      console.log("Received ID Token on Backend for verification:", idToken); // Log the raw token

      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        console.log('ID Token correctly decoded:', decodedToken);
        return res.status(200).send({ message: `Authorized. UID: ${uid}`, decodedToken });
      } catch (error) {
        console.error('Error verifying ID token:', error);
        return res.status(403).send('Unauthorized: Invalid token.');
      }
    } else {
      console.log(`Method for /auth/verifyToken was NOT POST, it was: ${req.method}. Sending 405.`);
      return res.status(405).send(`Method Not Allowed for ${req.path}. Use POST.`);
    }
  }

  // Fallback for other paths not handled
  console.log('Path not matched. Sending 404.');
  return res.status(404).send('Not Found');
};