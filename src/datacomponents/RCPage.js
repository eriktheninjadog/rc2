




class RCPage {

    constructor(content,cwsid,acwstext) {
        if (content == null) {
            throw "Content can't be null";
        }
        this.content = content;
        this.cwsid = cwsid;
        this.cwstext = acwstext;
        console.log('this.cwstext =  ' + this.cwstext);
    }

    getCwsId() {
        return this.cwsid;
    }

    getContent() {
        return this.content;
    }

    getCWSContent() {
        return this.cwstext;
    }

    getCharacterAtPosition(idx) {
        if (idx > (this.content.length-1))
            throw "Position outside end of page";
        
        if (idx < 0)
            throw "Position can't be less than zero"

        return this.content[idx];
    }

    getWordAtPosition(idx) {
        let position = 0;
        let ret = null;
        console.log(this);
        console.log("getWordAtPosition"  + this.cwstext);
        this.cwstext.forEach(element => {
            position = position + element.length;
            if (ret == null && position >= idx ) {
                ret = element;                
            }
        });
        return ret;
    }
  }

  export default RCPage;