
/**
 * Browser Notification Service
 * Sends native OS notifications when the timer finishes (even if tab is in background).
 */

let permissionGranted = false;

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported in this browser.');
        return false;
    }

    if (Notification.permission === 'granted') {
        permissionGranted = true;
        return true;
    }

    if (Notification.permission === 'denied') {
        return false;
    }

    const result = await Notification.requestPermission();
    permissionGranted = result === 'granted';
    return permissionGranted;
};

export const sendTimerNotification = (title: string, body: string, type: 'success' | 'alert' | 'info' = 'info') => {
    if (!permissionGranted || Notification.permission !== 'granted') return;

    const icons = {
        success: '🎯',
        alert: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        success: '#10b981', // emerald
        alert: '#f43f5e',   // rose
        info: '#6366f1'    // indigo
    };

    try {
        const notification = new Notification(title, {
            body,
            icon: '/yomate_icon_512_1770839402974.png',
            badge: '/icon.svg',
            tag: 'yomate-timer',
            silent: false,
            // vibrate: [200, 100, 200], // Not supported by all browsers via new Notification()
            // @ts-ignore - Some browsers support image in options
            image: type === 'success' ? '/yomate.png' : undefined,
        });

        // Haptic fallback if supported and if this code runs in an environment where hapticService works
        // (Though notifications are usually for when the app is backgrounded)

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    } catch (e) {
        console.warn('Failed to send notification:', e);
    }
};

export const sendSleepReminder = () => {
    sendTimerNotification(
        'Yomate | Sleep Protocol',
        'Time to prepare for sleep. Your target is 00:30.',
        'info'
    );
};
