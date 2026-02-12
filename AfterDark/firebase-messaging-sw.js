// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDkJpFBCdosJ2DMlK9wTGlZZfdxG92r540",
    authDomain: "darksilenceevents.firebaseapp.com",
    projectId: "darksilenceevents",
    storageBucket: "darksilenceevents.firebasestorage.app",
    messagingSenderId: "40378664809",
    appId: "1:40378664809:web:e406804434ab4adf9e1ff8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);
    
    const notificationTitle = payload.notification.title || 'Dark Silence Events';
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon || '/Dark Silence Player Gizmo.png',
        badge: '/Dark Silence Player Gizmo.png',
        tag: 'dark-silence-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
