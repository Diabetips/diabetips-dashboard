// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.2/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBBlVe4BM_u8BIFWBMbMdPGQMHEjTweUzo",
  authDomain: "diabetips-42069.firebaseapp.com",
  databaseURL: "https://diabetips-42069.firebaseio.com",
  projectId: "diabetips-42069",
  storageBucket: "diabetips-42069.appspot.com",
  messagingSenderId: "662514934162",
  appId: "1:662514934162:web:536585977496be771fa14b",
  measurementId: "G-X6DVX49JTZ"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = 'BRRRRRRRRRRR';
  const notificationOptions = {
    body: payload.data.notification,
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
