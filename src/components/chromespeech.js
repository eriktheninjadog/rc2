

const playEnglishTranslationChrome = (speechSynthesis,text,onStart,onEnd) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = function(event) {
      onEnd();
    };
    utterance.onerror = function(event) {
      console.error('An error occurred:', event.error);
    };
    onStart();
    speechSynthesis.speak(utterance);
  }


  export {playEnglishTranslationChrome}