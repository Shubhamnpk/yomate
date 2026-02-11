
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

export const sendTimerNotification = (title: string, body: string) => {
    if (!permissionGranted || Notification.permission !== 'granted') return;

    try {
        const notification = new Notification(title, {
            body,
            icon: 'data:image/svg+xml,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#6366f1"/><path d="M25 30 L50 60 L75 30" stroke="white" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="50" y1="60" x2="50" y2="85" stroke="white" stroke-width="10" stroke-linecap="round"/></svg>'
            ),
            badge: '🎯',
            tag: 'yomeet-timer', // Replaces previous notification instead of stacking
            silent: false,
        });

        // Auto-close after 8 seconds
        setTimeout(() => notification.close(), 8000);

        // Focus the tab when clicked
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
        '🌙 Sleep Protocol',
        'Time to prepare for sleep. Your target is 00:30.'
    );
};
