import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-analytics.js";
import { getDatabase, ref, runTransaction } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgGFMvDzShUVnSdNcCQPSDjbHNyCIC9eU",
  authDomain: "notify18-db97c.firebaseapp.com",
  projectId: "notify18-db97c",
  storageBucket: "notify18-db97c.firebasestorage.app",
  messagingSenderId: "115092084245",
  appId: "1:115092084245:web:5ad72c23e2667eb974a01c",
  measurementId: "G-S014B3KW6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Attach the tracking function to the global window object
// so it can be called from script.js whenever a user clicks download
window.trackApkDownload = function() {
    try {
        // 1. Log event to Firebase Analytics
        logEvent(analytics, 'file_download', {
            file_name: 'app-release.apk',
            source: 'website_button'
        });
        console.log("Firebase Analytics: file_download event sent.");

        // 2. Increment Firebase Realtime Database counter
        const clickRef = ref(database, 'downloads/total_clicks');
        runTransaction(clickRef, (currentClicks) => {
            // If currentClicks is null, it means no data exists yet, so start at 1
            return (currentClicks || 0) + 1;
        }).then(() => {
            console.log("Firebase Database: Click counter updated successfully.");
        }).catch((error) => {
            console.error("Firebase Database: Failed to update counter.", error);
        });
    } catch (e) {
        console.error("Firebase Tracking Error:", e);
    }
};
