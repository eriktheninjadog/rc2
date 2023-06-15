

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
            let idxOfFound = p.content.indexOf(wrd); 

            if (idxOfFound!=-1) {
                let start = idxOfFound - 50;
                // move start to first '。'                
                if (start < 0) 
                    start = 0;
                let fakestart = start;
                while (fakestart < idxOfFound) {
                    fakestart++;
                    if ( p.content[fakestart] == '。')
                        start = fakestart;
                    if ( p.content[fakestart] == '\n')
                        start = fakestart;
                    }
                
                let end = idxOfFound + 50;
                let fakeend = end;
                if (end > (p.content.length - 1))
                    end = p.content.length - 1;

                while (fakeend > idxOfFound) {
                    fakeend--;
                    if ( p.content[fakeend] == '。')
                        end = end;
                    if ( p.content[fakeend] == '\n')
                        end = end;
                    }
                let ex = p.content.substring(start,end);
                if (collected.indexOf(ex) == -1)
                    collected.push(p.content.substring(start,end));
            }
        });
    }

}

export default RCDocument;