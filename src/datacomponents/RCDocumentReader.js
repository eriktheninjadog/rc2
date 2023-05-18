

class RCDocumentReader {

    constructor(doc) {
        this.document = doc;
        this.pageNr = 0;
    }

    visiblePageNr() {
        return this.pageNr;
    }

    getPage() {
        return this.document.getPage(this.pageNr);
    }

    nrOfPages() {
        return this.document.getNumberOfPages();
    }

    setPage(idx) {
        this.pageNr = idx;
    }
    
    forward() {
        this.pageNr++;
        if (this.pageNr >= this.nrOfPages())
            this.pageNr = this.nrOfPages()-1;
        return this.getPage();
    }

    backward() {
        this.pageNr--;
        if (this.pageNr < 0)
            this.pageNr = 0;
        return this.getPage();
    }
}

export default RCDocumentReader;