
/**
 * Haptic Feedback Service for Web
 * Provides different vibration patterns to simulate native haptics.
 */

class HapticService {
    private isEnabled(): boolean {
        return typeof window !== 'undefined' && !!window.navigator.vibrate;
    }

    // Light tap for minor interactions (selection, toggle)
    light() {
        if (this.isEnabled()) window.navigator.vibrate(10);
    }

    // Medium tap for important actions (button click, modal open)
    medium() {
        if (this.isEnabled()) window.navigator.vibrate(20);
    }

    // Modern impact - sharp but noticeable
    impact() {
        if (this.isEnabled()) window.navigator.vibrate([15, 10, 15]);
    }

    // Heavy pulse
    heavy() {
        if (this.isEnabled()) window.navigator.vibrate(40);
    }

    // Success pattern (double tap)
    success() {
        if (this.isEnabled()) window.navigator.vibrate([20, 30, 20]);
    }

    // Error pattern (long/heavy pulse)
    error() {
        if (this.isEnabled()) window.navigator.vibrate([50, 50, 50]);
    }

    // Notification pattern
    notification() {
        if (this.isEnabled()) window.navigator.vibrate([30, 100, 30]);
    }
}

export const haptic = new HapticService();
