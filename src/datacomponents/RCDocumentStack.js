


class RCDocumentStack {

    constructor() {
        this.stack = [];
    }

    depth() {
        return this.stack.length;
    }

    push(document) {
        this.stack.push( new RCDocumentReader(document));
    }

    pop() {
        if (this.stack.length == 0)
            throw "No more documents to pop!!!"
        return this.stack.pop();
    }

    visibleDocument() {
        if (this.stack.length == 0)
            throw "This document stack is empty!"
        return this.stack[this.stack.length-1];
    }
}