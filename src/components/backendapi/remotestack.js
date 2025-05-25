//remotestack.js


/**
 * Adds an interest to the stack
 * @param {string} processor - The processor identifier
 * @param {string} workstring - The work string to be added to the stack
 * @returns {Promise<Response>} - The response from the server
 */
export async function addInterestToStack(processor, workstring) {
    try {
        const response = await fetch('https://chinese.eriktamm.com/api/add_interest_to_stack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ processor, workstring }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error('Error adding interest to stack:', error);
        throw error;
    }
}



/**
 * Gets an interest from the stack for a specific processor
 * @param {string} processor - The processor identifier
 * @returns {Promise<string|null>} - The work string from the stack or null if stack is empty
 */
export async function getInterestFromStack(processor) {
    try {
        const response = await fetch('https://chinese.eriktamm.com/api/get_interest_from_stack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ processor }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.result; // Will be null if stack was empty
    } catch (error) {
        console.error('Error getting interest from stack:', error);
        throw error;
    }
}


/**
 * Gets an interest from the stack for a specific processor
 * @param {string} processor - The processor identifier
 * @returns {Promise<string|null>} - The work string from the stack or null if stack is empty
 */
export async function peekInterestFromStack(processor) {
    try {
        const response = await fetch('https://chinese.eriktamm.com/api/peek_interest_from_stack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ processor }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.result; // Will be null if stack was empty
    } catch (error) {
        console.error('Error getting interest from stack:', error);
        throw error;
    }
}
