importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyATuF4teM8VSRCT0-wKb1XT3TJSLSTT0oQ",
  authDomain: "rt30x6.firebaseapp.com",
  projectId: "rt30x6",
  storageBucket: "rt30x6.firebasestorage.app",
  messagingSenderId: "902307168178",
  appId: "1:902307168178:web:f5c99f126d452c3c02aeab",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
  });
});
