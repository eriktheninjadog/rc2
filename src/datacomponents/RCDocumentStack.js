

import RCDocument from "./RCDocument";
import RCDocumentReader from "./RCDocumentReader";
import ls from 'local-storage'
import RCPage from "./RCPage";

class RCDocumentStack {

    loadFromLocalStorage() {

        this.stack = []
        var objects = ls.get('stack')
        console.log(objects)
        if (objects != null) {
            objects.forEach(value=> {
            
                let pageNr = value.pageNr;
                let document = value.document;
                console.log( document)
                let newDoc = new RCDocument();
                document.pages.forEach(
                    page => {
                        var content = page.content;
                        var cwsid = page.cwsid;
                        newDoc.addPage(new RCPage(content,cwsid));
                    }
                );
                this.push(newDoc);
            });
        }
        console.log(this);
    }

    saveToLocaLStorage() {
        ls.set('stack',this.stack);
    }

    constructor() {
        this.loadFromLocalStorage();
    }

    depth() {
        return this.stack.length;
    }

    push(document) {
        this.stack.push( new RCDocumentReader(document));
        this.saveToLocaLStorage();
    }

    pop() {
        if (this.stack.length == 0)
            throw "No more documents to pop!!!"
        this.saveToLocaLStorage();            
        return this.stack.pop();
    }

    visibleDocument() {
        if (this.stack.length == 0)
            throw "This document stack is empty!"
        this.saveToLocaLStorage();            
        return this.stack[this.stack.length-1];
    }
}

export default RCDocumentStack;