

import {ActivityTimeManager} from './ActivityManager';



function getActivityTimer() {
    if (window.activityTimer == undefined) {
        window.activityTimer = new ActivityTimer();
    }
    return window.activityTimer;
}

class ActivityTimer {

    /**
     * @param {ActivityTimeManager} activityManager - Instance of ActivityTimeManager for API calls
     * @param {string} activityName - Name of the tracked activity
     */
    
    constructor() {
        this.activityManager = new ActivityTimeManager('https://chinese.eriktamm.com/api');
        this.activityName = null;
        this.timerInterval = null;
        this.heartbeatTimeout = null;
        this.lastHeartbeat = null;
        this.isPaused = true;
        this.HEARTBEAT_THRESHOLD = 3 * 60 * 1000; // 3 minutes in milliseconds
        console.log(`ActivityTimer created `);
    }

    changeActivityName(newActivityName) {
        this.activityName = newActivityName;
        this.pause();
        this.lastHeartbeat = null;
        ActivityTimer.instance = this;
        console.log(`Activity name changed to: ${newActivityName}`);
    }

    start(newActivityName) {
        if (!this.isPaused) {
            console.log(`Calling activity but activity already started: ${newActivityName}`);
            return;
        }
        this.activityName = newActivityName;
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
                    console.log(`1 minute added to activity: ${this.activityName}`);
                } catch (error) {
                    console.error('Automatic time addition failed:', error);
                }
            }
        }, 60000); // Every minute

        console.log(`ActivityTimer started for activity: ${this.activityName}`);
    }

    pause() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.isPaused = true;
        console.log(`ActivityTimer paused for activity: ${this.activityName}`);
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

        console.log(`Heartbeat recorded for activity: ${this.activityName}`);
    }

    isRunning() {
        return !this.isPaused;
    }

    getStatus() {
        const status = {
            activity: this.activityName,
            isPaused: this.isPaused,
            lastHeartbeat: new Date(this.lastHeartbeat),
            elapsedSinceHeartbeat: Date.now() - this.lastHeartbeat
        };
        console.log(`Status retrieved:`, status);
        return status;
    }
    
    changeActivityName(newActivityName) {
        this.activityName = newActivityName;
        this.pause();
        this.lastHeartbeat = null;
        ActivityTimer.instance = this; }

}

export {getActivityTimer}