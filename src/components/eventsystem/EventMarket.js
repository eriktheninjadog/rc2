

const getEventListeners = () => {
    if (window.langEventListeners === undefined )
        window.langEventListeners = []
    return window.langEventListeners;
}

const loopOverEventListeners = func => {
    let el = getEventListeners();
    for (var i=0;i<el.length;i++) {
        func(el[i]);
    }
} 

const createEventListener = (id,eventmatcher,handleevent) => {
    let e = {};
    e.id = id;
    e.eventmatcher = eventmatcher;
    e.handleevent = handleevent;
    return e;
}

const getIdxOfListenerId = id => {
    let el = getEventListeners();
    for (var i=0;i<el.length;i++) {
        if (el[i].id == id) {
            return i;
        }
    }
    return -1;
}

const removeEventListener = id => {
    let idx = getIdxOfListenerId(id);
    if (idx != -1) {
        getEventListeners().splice(idx,1);
    }
}

const registerEventListener = (id,eventmatcher,eventHandler) => {
    removeEventListener(id);
    getEventListeners().push(createEventListener (id,eventmatcher,eventHandler ) );
}

const publishEvent = aevent => {
    loopOverEventListeners( 
        ev => {
            if (ev.eventmatcher(aevent)) {
                ev.handleevent(aevent);
            }
        }
    );
}

export {registerEventListener,publishEvent}