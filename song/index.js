const ytdl = require('ytdl-core');

module.exports = {
    name: 'song',
    category: 'downloader',
    description: 'Download MP3 from YouTube',
    async execute({ sock, msg, jid, args }) {
        if (!args) return sock.sendMessage(jid, { text: '❌ Please provide a YouTube link or song name!' });

        try {
            await sock.sendMessage(jid, { text: '⏳ _Searching and downloading your song..._' });

            // If user sent a name instead of a link, this logic can be expanded with a search tool
            const url = args.trim();
            if (!ytdl.validateURL(url)) return sock.sendMessage(jid, { text: '❌ Invalid YouTube URL.' });

            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
            
            const stream = ytdl(url, {
                quality: 'highestaudio',
                filter: 'audioonly'
            });

            // Send as Document to ensure it's an MP3 file
            await sock.sendMessage(jid, {
                document: { url: url }, // Some setups use buffer, but ytdl streams are best
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: msg });

        } catch (err) {
            console.error(err);
            await sock.sendMessage(jid, { text: '❌ Error: Could not download the song.' });
        }
    }
};
