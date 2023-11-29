

const load_timed_events = () => {
    let str = localStorage.getItem('timed_events');
    if ( str == null ) {
        window.timed_events = [];
        return;
    }
    window.timed_events = JSON.parse(str);
}

const save_timed_events = () => {
    let str = JSON.stringify( window.timed_events );
    localStorage.setItem('timed_events',str);
}

const add_timed_event = (timecount,func) =>  {
    let now = Date.now()
    let then = now + (timecount*1000)
    let obj = {}
    obj.when = then;
    obj.func = func;
    obj.prio = 2;
    obj.timecount = timecount
    load_timed_events();
    window.timed_events.push(obj);
    save_timed_events();
}

const time_loop = () => {
    return;
    console.log('tick')
    load_timed_events();
    let now = Date.now();
    for(let i=0;i < window.timed_events.length;i++ ) {
        try {
        if (now > window.timed_events[i].when) {
            console.log('an event triggered')
            eval(window.timed_events[i].func);
            window.timed_events[i].prio =window.timed_events[i].prio * 2;
            window.timed_events[i].when = now + ( window.timed_events[i].prio*window.timed_events[i].timecount*1000 )
            save_timed_events();
            return;            
        }
    }
    catch (e) {
        console.log('Exception in time loop ' + e)
    }
    }
}

export  {time_loop,add_timed_event}

