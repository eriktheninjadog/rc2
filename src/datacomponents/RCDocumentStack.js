

import RCDocument from "./RCDocument";
import RCDocumentReader from "./RCDocumentReader";
import ls from 'local-storage'
import RCPage from "./RCPage";

import { EventType, publishCWSStackChanged } from "../components/eventsystem/Event";
import { registerEventListener } from "../components/eventsystem/EventMarket";

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
                        var cwstext = page.cwstext;
                        var title = page.title;
                        newDoc.addPage(new RCPage(content,cwsid,cwstext,title));
                    }
                );
                this.push(newDoc);
            });
        }
        publishCWSStackChanged();
        console.log(this);
    }

    saveToLocaLStorage() {
        ls.set('stack',this.stack);
    }

    constructor() {
        this.loadFromLocalStorage();
        registerEventListener(
            EventType.CWSArrived+"listener",
            ev => {
                return ev.type == EventType.CWSArrived;
            },
            ev => {
                let cws = ev.data;
                this.addSingleCwsAsDocument(cws);
            }
        );
    }

    addArrayOfCwsAsDocument(arr) {
        let doc = new RCDocument();
        arr.forEach(val=>{            
            let p = new RCPage(val[2],val[0],val[3],val[1]);
            doc.addPage(p);
        });
        this.push(doc);
        this.saveToLocaLStorage();
        publishCWSStackChanged();
    }

    getExamples(wrd) {
        let p = [];
        this.stack.forEach(doc => {
            console.log(' in getExamples in stack ' + doc.document);
            doc.document.getExamples(wrd,p);
        });    
        return p;
    }

    getCompleteText() {
        let p = '';
        this.stack.forEach(doc => {
            for (var i =0;i< doc.nrOfPages();i++) {
                var p = doc.document.getPage(i);
                p = p + p.content;
            }
        });
        return p;
    }

    addSingleCwsAsDocument(val) {
        let doc = new RCDocument();
        let p = new RCPage(val[2],val[0],val[3],val[6]);
        doc.addPage(p);
        this.push(doc);
        this.saveToLocaLStorage();
    }

    depth() {
        return this.stack.length;
    }

    push(document) {
        this.stack.push( new RCDocumentReader(document));
        this.saveToLocaLStorage();
        publishCWSStackChanged();
    }

    pop() {
        if (this.stack.length == 0)
            throw "No more documents to pop!!!"
        this.saveToLocaLStorage();
        publishCWSStackChanged();

        return this.stack.pop();
    }

    visibleDocument() {
        if (this.stack.length == 0)
            throw "This document stack is empty!"
        this.saveToLocaLStorage();            
        return this.stack[this.stack.length-1];
    }
    
    clear() {
        this.stack=[];
    }
}

export default RCDocumentStack;