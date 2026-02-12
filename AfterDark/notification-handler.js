// Notification Handler - Request permission and handle push notifications
export async function requestNotificationPermission(messaging) {
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('Notification permission granted');
            
            // Get FCM token
            const token = await messaging.getToken({
                vapidKey: 'YOUR_VAPID_KEY_HERE' // You'll need to generate this in Firebase Console
            });
            
            if (token) {
                console.log('FCM Token:', token);
                return token;
            }
        } else {
            console.log('Notification permission denied');
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
    }
    return null;
}

export function showBrowserNotification(title, options) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/Dark Silence Player Gizmo.png',
            badge: '/Dark Silence Player Gizmo.png',
            vibrate: [200, 100, 200],
            ...options
        });
    }
}
