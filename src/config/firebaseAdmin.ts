import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "placeholder-project";
  
  try {
    initializeApp({
      credential: applicationDefault(),
      projectId: projectId
    });
    console.error(`[FirebaseAdmin] Initialized for project: ${projectId}`);
  } catch (err) {
    console.error("[FirebaseAdmin] Failed applicationDefault initialization, trying standard:", err);
    try {
      initializeApp({
        projectId: projectId
      });
    } catch (fallbackErr) {
      console.error("[FirebaseAdmin] Complete initialization failure:", fallbackErr);
    }
  }
}

export const db = getFirestore();
export { FieldValue };
