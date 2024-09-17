function playTone(frequency, duration, volume) {
    // Create an audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
    // Create an oscillator
    const oscillator = audioContext.createOscillator();
  
    // Create a gain node (volume control)
    const gainNode = audioContext.createGain();
  
    // Set the frequency of the tone
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
    // Set the volume (0 to 1)
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  
    // Connect the oscillator to the gain node, and the gain node to the output
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  
    // Start the oscillator
    oscillator.start();
  
    // Stop the oscillator after the specified duration
    oscillator.stop(audioContext.currentTime + duration);
  }
  
export{playTone};