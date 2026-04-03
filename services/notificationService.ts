/**
 * Browser Notification Service
 * Sends native OS notifications when the timer finishes, including in the background.
 */

const canUseNotifications = () => typeof window !== 'undefined' && 'Notification' in window;

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!canUseNotifications()) {
        console.warn('Notifications not supported in this browser.');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission === 'denied') {
        return false;
    }

    const result = await Notification.requestPermission();
    return result === 'granted';
};

export const sendTimerNotification = (
    title: string,
    body: string,
    type: 'success' | 'alert' | 'info' = 'info'
) => {
    if (!canUseNotifications() || Notification.permission !== 'granted') return;

    try {
        const notification = new Notification(title, {
            body,
            icon: '/icons/manifest-icon-512.png',
            badge: '/icons/manifest-icon-192.png',
            tag: 'yomate-timer',
            silent: false,
            // @ts-ignore - Some browsers support image in options
            image: type === 'success' ? '/icons/manifest-icon-512.png' : undefined,
        });

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

export const sendScheduleReminder = (blockName: string, minutes: number) => {
    const minuteLabel = minutes === 1 ? 'minute' : 'minutes';
    sendTimerNotification(
        'Yomate | Block Reminder',
        `${blockName} starts in ${minutes} ${minuteLabel}.`,
        'info'
    );
};

export const sendRitualReminder = (ritualName: string) => {
    sendTimerNotification(
        'Yomate | Ritual Reminder',
        `You have not completed "${ritualName}" today.`,
        'alert'
    );
};
