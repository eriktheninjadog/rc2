import React, { useState } from 'react';


class StudyGoalsClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async setStudyGoal(activity, hours) {
        const response = await fetch(`${this.baseURL}/studygoals/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ activity, hours }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        return response.json();
    }

    async getStudyGoal(activity) {
        const response = await fetch(`${this.baseURL}/studygoals/get?activity=${encodeURIComponent(activity)}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        return response.json();
    }
}
    



const StudyGoals = () => {
    const [activity, setActivity] = useState('');
    const [hours, setHours] = useState('');

    const handleActivityChange = (e) => {
        setActivity(  e.target.value);
    };

    const handleHoursChange = (e) => {
        setHours(parseInt(e.target.value));
    };

const handleGet = () => {
    const client = new StudyGoalsClient('https://chinese.eriktamm.com/api');

    client.getStudyGoal(activity)
        .then(data => {
            setHours(data.hours);
        })
        .catch(error => {
            console.error('Error fetching study goal:', error);
        });

};

const handlePut = () => {
    const client = new StudyGoalsClient('https://chinese.eriktamm.com/api');
    client.setStudyGoal(activity, parseInt(hours))
        .then(() => {
            console.log('Study goal updated successfully');
        })
        .catch(error => {
            console.error('Error updating study goal:', error);
        });
    console.log('PUT request');
};

return (
    <div>
        <h2>Study Goals</h2>
        <div>
            <label>
                Activity:
                <input type="text" value={activity} onChange={handleActivityChange} size={32}/>
            </label>
            <label>
                Hours:
                <input type="text" value={hours} onChange={handleHoursChange} size={3}/>
            </label>
            <button onClick={handleGet}>Get</button>
            <button onClick={handlePut}>Put</button>
        </div>
    </div>
);
}



export default StudyGoals;