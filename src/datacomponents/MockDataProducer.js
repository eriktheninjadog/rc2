
import RCDocumentStack from "./RCDocumentStack";
import RCDocument from "./RCDocument";
import RCPage from "./RCPage";

function createMockString(len) {

    let r = '';
    while (r.length < len) {
        r = r + Math.random().toString(36);
    }
    return r;
}

function createMockDocument() {
    var doc = new RCDocument();
    const min = 3;
    const max = 11;
    const randomNumber = Math.floor(Math.random() * (max - min + 1) + min);
    for (let i=0;i<randomNumber;i++) {
        var b = createMockString(Math.floor(20*(Math.random() * (max - min + 1) + min)));
        doc.addPage(new RCPage(b,-1));        
    }
    return doc;
}

export {createMockDocument};