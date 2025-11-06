import admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;

  if (!projectId) {
    throw new Error("VITE_FIREBASE_PROJECT_ID environment variable is required");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail: `firebase-adminsdk@${projectId}.iam.gserviceaccount.com`,
      privateKey: apiKey?.replace(/\\n/g, '\n'),
    } as admin.ServiceAccount),
    projectId,
  });
}

export const auth = admin.auth();
