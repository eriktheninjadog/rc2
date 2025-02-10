

import {ActivityTimeManager} from './ActivityManager';

class ActivityTimer {
    /**
     * @param {ActivityTimeManager} activityManager - Instance of ActivityTimeManager for API calls
     * @param {string} activityName - Name of the tracked activity
     */
    constructor(activityManager, activityName) {
        this.activityManager = activityManager;
        this.activityName = activityName;
        this.timerInterval = null;
        this.heartbeatTimeout = null;
        this.lastHeartbeat = null;
        this.isPaused = true;
        this.HEARTBEAT_THRESHOLD = 3 * 60 * 1000; // 3 minutes in milliseconds
    }

    start() {
        if (!this.isPaused) return;
        this.isPaused = false;
        
        // Initial heartbeat to start timer
        this.heartbeat();
        
        // Schedule automatic time accumulation
        this.timerInterval = setInterval(async () => {
            if (!this.isPaused) {
                try {
                    await this.activityManager.addTimeToActivity(
                        this.activityName, 
                        60000 // 1 minute
                    );
                } catch (error) {
                    console.error('Automatic time addition failed:', error);
                }
            }
        }, 60000); // Every minute
    }

    pause() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.isPaused = true;
    }

    heartbeat() {
        if (this.isPaused) return;
        
        this.lastHeartbeat = Date.now();
        
        // Reset any existing timeout
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
        }
        
        // Schedule new heartbeat check
        this.heartbeatTimeout = setTimeout(() => {
            if (Date.now() - this.lastHeartbeat > this.HEARTBEAT_THRESHOLD) {
                this.pause();
                console.log('Paused due to lack of heartbeat');
            }
        }, this.HEARTBEAT_THRESHOLD);
    }

    getStatus() {
        return {
            activity: this.activityName,
            isPaused: this.isPaused,
            lastHeartbeat: new Date(this.lastHeartbeat),
            elapsedSinceHeartbeat: Date.now() - this.lastHeartbeat
        };
    }
}

export {ActivityTimer}