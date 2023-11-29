


  class LimitedQueue {

    constructor(maxLength) {
        if (window.LimitedQueueinstance) {
          return window.LimitedQueueinstance;
        }
        this.maxLength = maxLength;
        this.loadFromLocalStorage("reminderqueue")
        window.LimitedQueueinstance = this;
      }
  
    enqueue(item) {
      while (this.queue.length > this.maxLength) {
        this.queue.shift(); // Remove the oldest item if the queue is full
      }

      if (this.queue.length === this.maxLength) {
        this.queue.shift(); // Remove the oldest item if the queue is full
      }

      this.queue.push(item);
      this.saveToLocalStorage("reminderqueue")      
    }
  
    dequeue() {
      return this.queue.shift();
    }
  
    isEmpty() {
      return this.queue.length === 0;
    }
  
    isFull() {
      return this.queue.length === this.maxLength;
    }
  
    getSize() {
      return this.queue.length;
    }
  
    peek() {
      return this.queue[0];
    }
  
    clear() {
      this.queue = [];
    }

    getAll() {
        return this.queue;
    }
  
    saveToLocalStorage(key) {
      const serializedQueue = JSON.stringify(this.queue);
      localStorage.setItem(key, serializedQueue);
    }
  
    loadFromLocalStorage(key) {
      const serializedQueue = localStorage.getItem(key);
      this.queue = JSON.parse(serializedQueue) || [];
    }
  }

const getReminderItems = () => {
    let tmp = new LimitedQueue(50);
    return tmp.getAll();
}

const addReminderItem = (item) => {
    let tmp = new LimitedQueue(50);
    tmp.enqueue(item);
}

export {getReminderItems,addReminderItem};