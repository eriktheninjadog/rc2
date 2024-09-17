



const playEnglishTranslationAndroid = (text,onStart,onEnd) => {

    window.ttsCompleted = function() {
        onEnd();
    }
    console.log('about to tts');
    window.location.href = 'tts://' + text;
    onStart();   
  }

  export {playEnglishTranslationAndroid}