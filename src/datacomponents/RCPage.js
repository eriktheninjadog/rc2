


class RCPage {

    constructor(content, cwsid) {
        if (content == null) {
            throw "Content can't be null";
        }
        this.content = content;
        this.cwsid = cwsid;
    }

    getContent() {
        return this.content;
    }

    getCharacterAtPosition(idx) {
        if (idx > (this.content.length-1))
            throw "Position outside end of page";
        
        if (idx < 0)
            throw "Position can't be less than zero"

        return this.content[idx];
    }
    
  }