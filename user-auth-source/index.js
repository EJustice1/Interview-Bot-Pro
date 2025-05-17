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

  if (req.method !== 'POST' && req.path !== '/verifyToken') {
    // For now, let's just have a simple public endpoint
    if (req.path === '/') {
       return res.status(200).send('User Auth Service (Node.js with Firebase Admin SDK initialized). Use POST /verifyToken to test token verification.');
    }
    return res.status(405).send('Method Not Allowed or Invalid Path');
  }

  // Example: A protected endpoint that verifies a Firebase ID token
  if (req.path === '/verifyToken') {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      console.log('No Bearer token found in Authorization header.');
      return res.status(401).send('Unauthorized: No token provided.');
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;
      console.log('ID Token correctly decoded:', decodedToken);
      // You can now trust this UID and use it to fetch user data or perform actions
      // For example, fetch user record:
      // const userRecord = await admin.auth().getUser(uid);
      return res.status(200).send({ message: `Authorized. UID: ${uid}`, decodedToken });
    } catch (error) {
      console.error('Error verifying ID token:', error);
      return res.status(403).send('Unauthorized: Invalid token.');
    }
  }

  // Fallback for other POST requests or paths not handled
  return res.status(404).send('Not Found');
};