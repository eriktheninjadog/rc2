


class SRTParser {
    constructor(url) {
        this.url = url;
        this.subtitles = [];
    }

    async fetchSRT() {
        try {
            const response = await fetch(this.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch SRT file: ${response.statusText}`);
            }
            const text = await response.text();
            this.parseSRT(text);
        } catch (error) {
            console.error('Error fetching SRT file:', error);
        }
    }

    reparse(url) {
        this.url = url;
        this.subtitles = [];
        this.fetchSRT();
    }

    parseSRT(text) {
        const lines = text.split('\n');
        let currentSubtitle = {};

        lines.forEach(line => {
            if (line[0] === '#') {
                
            }
            else
            if (line.match(/^\d+$/) || line.length == 0) {
                if (currentSubtitle.text) {
                    this.subtitles.push(currentSubtitle);
                }
                currentSubtitle = { index: parseInt(line, 10), start: '', end: '', text: '' };
            } else if (line.match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)) {
                const [start, end] = line.split(' --> ');
                currentSubtitle.start = this.parseTime(start);
                currentSubtitle.end = this.parseTime(end);
            } else if (line.trim() !== '') {
                currentSubtitle.text = (currentSubtitle.text ? currentSubtitle.text + '\n' : '') + line;
            }
        });

        if (currentSubtitle.text) {
            this.subtitles.push(currentSubtitle);
        }
    }

    parseTime(timeStr) {
        const [time, milliseconds] = timeStr.split(',');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }


    getSRTIndex(idx) {
        let chosenSubtitle = null;
        let cnt = 1
        for (const subtitle of this.subtitles) {
            if (cnt == idx) {
                chosenSubtitle = subtitle;
                break;
            }
            cnt++;
        }
        return chosenSubtitle ? chosenSubtitle.index : null;
    }

    getSRT(time) {
        let chosenSubtitle = null;

        for (const subtitle of this.subtitles) {
            if (subtitle.start <= time) {
                chosenSubtitle = subtitle;
            } else {
                break;
            }
        }

        return chosenSubtitle ? chosenSubtitle.text.trim() : null;
    }
}

// Usage example:
async function exampleUsage() {
    const srtUrl = 'https://exhttps://chinese.eriktamm.com/watchit/U83D8ZStPozz.srtample.com/subtitles.srt';
    const srtParser = new SRTParser(srtUrl);

    await srtParser.fetchSRT();

    const timepoint = 120; // Example timepoint in seconds
    const subtitle = srtParser.getSRT(timepoint);

    console.log(`Subtitle closest before ${timepoint}s: ${subtitle ? subtitle : 'No subtitle found'}`);
}


export {SRTParser};