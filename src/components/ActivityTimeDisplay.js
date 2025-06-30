import React, { useState, useEffect } from 'react';

import { ActivityTimeManager } from "./ActivityManager";
import { getActivityTimer } from "./ActivityTimer";
         
//ActivityTimeDisplay.js



const ActivityTimeDisplay = ({ activityName }) => {
    const [time, setTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    
    useEffect(() => {
        //getActivityTimer().changeActivityName(activityName);
        getActivityTimer().start(activityName);
        
        // Initialize time from ActivityManager when component mounts
        const initialTime = getActivityTimer().getStatus();
        
        setTime(initialTime);
        
        // Set up interval to update ime
        const intervalId = setInterval(async () => {
            
            try {
                const status = await getActivityTimer().getStatus();
                console.log(`Current status for ${activityName}:`, status);
                if (status && typeof status.actime === 'number') {
                    setTime(status.actime);
                    setTotalTime(status.totalactime || 0);
                }
            } catch (error) {
                console.error(`Error getting status for ${activityName}:`, error);
            }
        }, 30000); // Update every second
        
        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
        
    }, [activityName]);
    
    // Format time (assuming time is in seconds)
    const formatTime = (totalSeconds) => {
        console.log(`Formatting time: ${totalSeconds} ` + JSON.stringify(totalSeconds));
        if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) {
            return '00:00:00';
        }
        totalSeconds = totalSeconds / 1000; // Convert milliseconds to seconds if needed
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className="activity-time-display">
            <h3>{activityName}</h3>
            <p>{formatTime(time)}----{formatTime(totalTime)}</p>
        </div>
    );
};

export {ActivityTimeDisplay};