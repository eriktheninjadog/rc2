
async function tokenizeChineseText(text) {

    const cacheKey = `tokenize_${text}`;
    const cachedTokens = localStorage.getItem(cacheKey);

    if (cachedTokens) {
        console.log('Retrieved from cache');
        return JSON.parse(cachedTokens);
    }

    const url = 'https://chinese.eriktamm.com/api/tokenize_chinese';

    const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    localStorage.setItem(cacheKey, JSON.stringify(data.tokens));
    console.log('Stored in cache');
    return data.tokens;
}

export {tokenizeChineseText};