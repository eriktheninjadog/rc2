

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

    getExamples(wrd,collected) {
        this.pages.forEach( p => {
            if (p.content.indexOf(wrd)!=-1) {
                let start = p.content.indexOf(wrd) - 50;
                if (start < 0) 
                    start = 0;
                let end = p.content.indexOf(wrd) + 50;
                if (end > (p.content.length - 1))
                    end = p.content.length - 1;
                collected.push(p.content.substring(start,end));
            }
        });
    }

}

export default RCDocument;