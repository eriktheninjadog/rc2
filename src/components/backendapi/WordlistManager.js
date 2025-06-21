

// WordList Manager Client
class WordListManager {
    constructor(baseUrl = 'https://chinese.eriktamm.com/api') {
        this.baseUrl = baseUrl;
        this.endpoint = '/managelist';
    }

    // Get all words from a list
    async getList(name) {
        try {
            const response = await fetch(this.baseUrl + this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    command: 'get'
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data.result;
        } catch (error) {
            console.error('Error getting word list:', error);
            throw error;
        }
    }

    // Add a word to a list
    async addWord(name, word) {
        try {
            const response = await fetch(this.baseUrl + this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    command: 'addto',
                    word: word
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data.result;
        } catch (error) {
            console.error('Error adding word:', error);
            throw error;
        }
    }

    // Delete an entire list
    async deleteList(name) {
        try {
            const response = await fetch(this.baseUrl + this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    command: 'delete'
                })
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data.result;
        } catch (error) {
            console.error('Error deleting list:', error);
            throw error;
        }
    }
}

// Example usage:
// const wordListManager = new WordListManager();
// 
// // Get a list
// wordListManager.getList('myVocabulary')
//     .then(words => console.log('Words:', words))
//     .catch(err => console.error(err));
// 
// // Add a word
// wordListManager.addWord('myVocabulary', '你好')
//     .then(result => console.log('Add result:', result))
//     .catch(err => console.error(err));
// 
// // Delete a list
// wordListManager.deleteList('myVocabulary')
//     .then(result => console.log('Delete result:', result))
//     .catch(err => console.error(err));

export { WordListManager };