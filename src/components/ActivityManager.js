



class ActivityTimeManager {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.lastActivity = null;
        this.lastTime = null;
    }


    async addTimeToActivity(activityName, millisecondsToAdd) {
        const url = `${this.baseUrl}/add_time`;
        if (this.lastTime == null) {
            this.lastActivity = activityName;
            this.lastTime = Date.now();
        } else {
            if (this.lastActivity !== activityName) {
                millisecondsToAdd = Date.now() - this.lastTime();
                this.lastActivity = activityName;
                this.lastTime = Date.now();
            } else {
                this.lastActivity = activityName;
                this.lastTime = null;
            }
        }
        if (millisecondsToAdd > 30000) {
            millisecondsToAdd = 30000;
        }
        // 583307
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                activity_name: activityName,
                milliseconds_to_add: millisecondsToAdd
            })
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(errorMessage.error || 'Failed to add time');
        }

        const result = await response.json();
        return result;
    }

    async getAccumulatedTime(activityName) {
        const url = `${this.baseUrl}/get_time?activity_name=${encodeURIComponent(activityName)}`;
        const response = await fetch(url, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            throw new Error(errorMessage.error || 'Failed to get time');
        }

        const result = await response.json();
        console.log(JSON.stringify(result));
        return result;
    }
}

export {ActivityTimeManager }