


function isAndroidWebView() {
    // Detect Android WebView
    var userAgent = window.navigator.userAgent.toLowerCase();
    return userAgent.indexOf("webkit") > -1 && userAgent.indexOf("version/") > -1 && userAgent.indexOf("mobile/") > -1 && userAgent.indexOf("chrome") == -1;
  }
  
  function isChromebrowser() {
    // Detect Chrome browser
    var userAgent = window.navigator.userAgent.toLowerCase();
    return userAgent.indexOf("chrome") > -1 && userAgent.indexOf("opr/") == -1;
  }

  export {isAndroidWebView,isChromebrowser}