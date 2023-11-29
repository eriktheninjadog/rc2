
import { publishEvent } from "./EventMarket";

const EventType = {
    ReaderClickTerm:'readerclickterm',
    CWSArrived:'cwsarrived',
    CWSStackChanged:'CWSStackChanged'
}

const createEvent = (type,data) => {
    let obj = {}
    obj.type = type;
    obj.data = data;
    return obj;
} 

const createReaderClickedTerm = term => {
    return createEvent(EventType.ReaderClickTerm,term);
}

const createCWSArrived = cws => {
    return createEvent(EventType.CWSArrived,cws);
}

const createCWSStackChanged = () => {
    return createEvent(EventType.CWSStackChanged);
}

const publishReaderClickedTerm = term => {
    let ev = createReaderClickedTerm(term);
    publishEvent(ev);
}

const publishCWSArrived = cws => {
    let ev = createCWSArrived(cws);
    publishEvent(ev);
}

const publishCWSStackChanged = () => {
    let ev = createCWSStackChanged();
    publishEvent(ev);
}


export {publishCWSStackChanged,publishCWSArrived,publishReaderClickedTerm,EventType}