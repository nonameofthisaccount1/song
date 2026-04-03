const ytdl = require('ytdl-core');
const yts = require('yt-search');

module.exports = {
    name: 'song',
    category: 'downloader',
    description: 'Download MP3 from YouTube via URL or search',
    async execute({ sock, msg, jid, args }) {
        if (!args) return sock.sendMessage(jid, { text: '❌ Please provide a song name or YouTube link!' });

        try {
            await sock.sendMessage(jid, { text: '⏳ _Searching and downloading..._' });

            let url = args.trim();

            // 1. Search Logic: If it's not a URL, search YouTube
            if (!ytdl.validateURL(url)) {
                const search = await yts(url);
                if (!search.videos || search.videos.length === 0) {
                    return sock.sendMessage(jid, { text: '❌ No results found for that song.' });
                }
                url = search.videos[0].url; // Use the first search result
            }

            // 2. Fetch Video Metadata
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
            
            // 3. Download and Send
            // Note: Sending via URL allows Baileys to stream the file efficiently
            await sock.sendMessage(jid, {
                document: { url: url }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: msg });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(jid, { text: `❌ Error: ${err.message}` });
        }
    }
};
