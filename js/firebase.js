// js/firebase.js
(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBAmXuMCo4gvQ75gZ93T3O4Vd-mo-AENDc",
    authDomain: "captionlagbe-28ea7.firebaseapp.com",
    projectId: "captionlagbe-28ea7",
    storageBucket: "captionlagbe-28ea7.firebasestorage.app",
    messagingSenderId: "843743080993",
    appId: "1:843743080993:web:988b77042cbc186be0a960",
    measurementId: "G-JQNE09CYQ5"
  };

  if (!window.firebase) {
    console.error("Firebase SDK not loaded");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase initialized (NEW API KEY)");
  }
})();

