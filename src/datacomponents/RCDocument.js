

class RCDocument {

    constructor() {
        this.pages = []
    }

    getNumberOfPages() {
        return this.pages.length;
    }

    getPage(idx) {
        if (idx >= this.pages.length) 
            throw "Page requested is outside scope"
        if (idx < 0)
            throw "Page cannot be less than zero"
        return this.pages[idx]
    }

    addPage(page) {
        return this.pages.push(page);
    }

}