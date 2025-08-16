"use server";

import admin from 'firebase-admin';

// Ensure this file is only run on the server
if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK can only be used on the server.');
}

if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }
    const serviceAccount = JSON.parse(serviceAccountString);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
    throw new Error('Could not initialize Firebase Admin. Please check your FIREBASE_SERVICE_ACCOUNT environment variable.');
  }
}

const adminDb = admin.firestore();
const adminStorage = admin.storage().bucket();

export { adminDb, adminStorage };
