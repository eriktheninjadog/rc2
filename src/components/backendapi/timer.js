class Timer {
  /**
   * Creates an instance of Timer.
   * @param {string} apiUrl - The REST API endpoint to call.
   * @param {object} [options] - Optional configurations.
   * @param {number} [options.initialDelay=60] - Initial delay in seconds before the first API call.
   * @param {number} [options.maxAttempts=Infinity] - Maximum number of retry attempts.
   * @param {Function} [options.isRunning=null] - Optional callback to determine if the timer should count.
   */
  constructor(apiUrl, options = {}) {
    // Validate API URL

    if (typeof apiUrl !== 'string' || !apiUrl.trim()) {
      throw new Error('A valid API URL must be provided.');
    }

    this.apiUrl = apiUrl;
    this.time = 0;
    this.paused = true;
    this.intervalId = null;
    this.isApiCallInProgress = false; 

    // Retry logic properties
    this.attemptNumber = 1; // Starts with 1 (initialDelay * 1 seconds)
    this.initialDelay = options.initialDelay || 60; // in seconds
    this.maxAttempts = options.maxAttempts || Infinity; // Optional: limit the number of attempts

    // isRunning callback
    this.isRunning = typeof options.isRunning === 'function' ? options.isRunning : null;
  }

  /**
   * Starts the timer.
   */
  start() {
    if (!this.paused) {
      // Timer is already running
      return;
    }
    console.log("starting timer");
    this.paused = false;
    this.intervalId = setInterval(() => {
      if (this.paused || this.isApiCallInProgress) {
        return;
      }
      // Check if isRunning callback is provided and returns true
      if (this.isRunning) {
        try {
          const shouldRun = this.isRunning();
          if (!shouldRun) {
            // Do not increment time if isRunning returns false
            return;
          }
        } catch (error) {
          console.error('Error in isRunning callback:', error);
          // Optionally, pause the timer or decide on fallback behavior
          return;
        }
      }

      // Increment time
      this.time++;

      // Determine the delay for the current attempt
      const currentDelay = this.attemptNumber * this.initialDelay;

      if (this.time >= currentDelay) {
        // Time to attempt API call
        this.isApiCallInProgress = true;

        this.callApi()
          .then((success) => {
            if (success) {
              // Reset on successful API call
              this.isApiCallInProgress = false;
              this.resetTimer();
            } else {
              this.isApiCallInProgress = false;

              // Prepare for next attempt
              this.attemptNumber++;
              // Optionally, you can cap the attemptNumber to prevent infinite retries
              if (this.attemptNumber > this.maxAttempts) {
                this.pause();
                console.error('Max retry attempts reached. Timer stopped.');
              }
            }
          })
          .catch((error) => {
            // Handle unexpected errors
            console.error('An error occurred while calling the API:', error);
            this.isApiCallInProgress = false;

            this.attemptNumber++;
            if (this.attemptNumber > this.maxAttempts) {
              this.pause();
              console.error('Max retry attempts reached due to errors. Timer stopped.');
            }
          }).finally(() => {
            this.isApiCallInProgress = false;
          });
      }
    }, 1000); // Tick every second
  }

  /**
   * Pauses the timer.
   */
  pause() {
    this.paused = true;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Resets the timer and stops it.
   */
  reset() {
    this.pause();
    this.time = 0;
    this.attemptNumber = 1;
  }

  /**
   * Resets the timer after a successful API call.
   */
  resetTimer() {
    this.reset();
  }

  /**
   * Calls the REST API with POST method.
   * @returns {Promise<boolean>} - Resolves to true if the call was successful, false otherwise.
   */
  async callApi() {
    // Construct the request body
    const requestBody = {
      english: 'tralalala',
      chinesetokens: 'tralalala',
      mp3name: 'mp3',
      type: 1,
      result: 0,
      milliseconds: this.time * 1000, // Convert seconds to milliseconds
      whenutcmilliseconds: Date.now() // Current UTC time in milliseconds
    };

    console.log('Making API call...' + JSON.stringify(requestBody));
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });


      if (response.ok) {
        console.log(`API call successful at ${this.formatTime(this.time)}.`);
        return true;
      } else {
        console.warn(`API call failed with status: ${response.status}.`);
        return false;
      }
    } catch (error) {
      console.error('API call encountered an error:', error);
      return false;
    }
  }

  /**
   * Formats the time in mm:ss for logging purposes.
   * @param {number} seconds - The time in seconds.
   * @returns {string} - Formatted time string.
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}

export { Timer };
