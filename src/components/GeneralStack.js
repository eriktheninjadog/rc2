import { useState, useEffect } from 'react';

/**
 * GeneralStack - A stack implementation that persists data in localStorage
 */
class GeneralStack {
    /**
     * Create a new stack
     * @param {string} [key='general-stack'] - The localStorage key to use for persistence
     */
    constructor(key = 'general-stack') {
        this.key = key;
        // Initialize from localStorage or create empty stack
        const stored = localStorage.getItem(key);
        this.items = stored ? JSON.parse(stored) : [];
    }

    /**
     * Add an item to the top of the stack
     * @param {*} item - The item to push onto the stack
     */
    push(item) {
        this.items.push(item);
        this._save();
        return this.items.length;
    }

    /**
     * Remove and return the top item from the stack
     * @returns {*} The top item from the stack or undefined if empty
     */
    pop() {
        if (this.isEmpty()) return undefined;
        const item = this.items.pop();
        this._save();
        return item;
    }

    /**
     * View the top item without removing it
     * @returns {*} The top item or undefined if empty
     */
    peek() {
         if (this.isEmpty()) {
            return undefined;
         }
         
         // Copy the top element to clipboard
         const topItem = this.items[this.items.length - 1];
         navigator.clipboard.writeText(JSON.stringify(topItem)).catch(err => {
            console.error('Failed to copy to clipboard:', err);
         });

        return this.items[this.items.length - 1];
    }

    /**
     * Get the number of items in the stack
     * @returns {number} The stack size
     */
    size() {
        return this.items.length;
    }

    /**
     * Check if the stack is empty
     * @returns {boolean} True if stack is empty
     */
    isEmpty() {
        return this.items.length === 0;
    }

    /**
     * Clear all items from the stack
     */
    clear() {
        this.items = [];
        this._save();
    }

    /**
     * Save the current stack state to localStorage
     * @private
     */
    _save() {
        localStorage.setItem(this.key, JSON.stringify(this.items));
    }
}

export default GeneralStack;