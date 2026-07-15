const { Client, GatewayIntentBits, EmbedBuilder, Events } = require("discord.js");
const { GameDig } = require("gamedig");
const https = require('https');

const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
let botMessage = null;

let mapStartTime = Date.now();
let lastMapName = "";

let cachedApiData = null;
let lastApiFetchTime = 0;

function getFullServerData() {
    return new Promise((resolve) => {
        const url = `https://servers.realitymod.com/api/ServerInfo`;
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 429) return resolve(null);
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const srv = parsed.servers.find(s => (s.properties?.hostname || "").includes(config.server.apiName));
                    resolve(srv || null);
                } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

async function updateDashboard() {
    try {
        const state = await GameDig.query({
            type: 'battlefield2',
            host: config.server.ip,
            port: config.server.port,
            maxRetries: 3,
        });

        const now = Date.now();
        if (now - lastApiFetchTime >= 60000 || !cachedApiData) {
            const freshApiData = await getFullServerData();
            if (freshApiData) { cachedApiData = freshApiData; lastApiFetchTime = now; }
        }
        const apiData = cachedApiData;
        const apiPlayers = apiData?.players || [];

        if (state.map !== lastMapName) {
            mapStartTime = Date.now();
            lastMapName = state.map;
        }

        const startDelaySeconds = parseInt(state.raw?.bf2_startdelay) || 0;
        const exactRoundStartTime = Math.floor(mapStartTime / 1000) + startDelaySeconds;
        const timeDisplay = `<t:${exactRoundStartTime}:R>`;

        const team1Name = state.raw?.bf2_team1 || "Team 1";
        const team2Name = state.raw?.bf2_team2 || "Team 2";
        const factionsText = `${team1Name} vs ${team2Name}`;

        let queryPlayers = [];
        if (Array.isArray(state.players)) queryPlayers.push(...state.players);
        if (state.raw && Array.isArray(state.raw.players)) queryPlayers.push(...state.raw.players);

        const processList = (list) => {
            let active = new Set();
            let afk = new Set();
            list.forEach(person => {
                const fClean = person.toLowerCase().trim();
                const pQuery = queryPlayers.find(p => (p.name || p.player || p.pname || "").toLowerCase().includes(fClean));
                const pAPI = apiPlayers.find(p => (p.name || "").toLowerCase().includes(fClean));

                if (pQuery || pAPI) {
                    const finalName = (pQuery?.name || pQuery?.player || pQuery?.pname || pAPI?.name || person).trim();
                    const scoreAPI = parseInt(pAPI?.score) || 0;
                    const scoreQuery = parseInt(pQuery?.score) || parseInt(pQuery?.frags) || (pQuery?.raw && pQuery?.raw?.score ? parseInt(pQuery?.raw?.score) : 0) || 0;
                    const kills = parseInt(pAPI?.kills) || 0;
                    const deaths = parseInt(pAPI?.deaths) || parseInt(pQuery?.deaths) || 0;

                    const teamNum = parseInt(pAPI?.team) || parseInt(pQuery?.team) || (pQuery?.raw && pQuery?.raw?.team ? parseInt(pQuery?.raw?.team) : 0) || 0;
                    let teamTag = "";
                    if (teamNum === 1) teamTag = `[${team1Name}]`;
                    else if (teamNum === 2) teamTag = `[${team2Name}]`;
                    else teamTag = `[Loading/Spec]`;

                    const displayString = `${finalName} - ${teamTag}`;
                    if (scoreAPI !== 0 || scoreQuery !== 0 || kills > 0 || deaths > 0) {
                        active.add(displayString);
                    } else {
                        afk.add(displayString);
                    }
                }
            });
            return { active: Array.from(active), afk: Array.from(afk) };
        };

        const validAdmins = (config.adminsList || []).filter(name => name.trim() !== "");
        const validFriends = (config.friendsList || []).filter(name => name.trim() !== "");

        const extraFields = [];

        if (validAdmins.length > 0) {
            const adminsData = processList(validAdmins);
            let adminsFormatted = `\`\`\`md\n`;
            if (adminsData.active.length > 0) adminsFormatted += adminsData.active.map(a => `• ${a} (Active)`).join("\n") + "\n";
            if (adminsData.afk.length > 0) adminsFormatted += adminsData.afk.map(a => `• ${a} (AFK/Loading)`).join("\n") + "\n";
            if (adminsData.active.length === 0 && adminsData.afk.length === 0) adminsFormatted += `No admins online\n`;
            adminsFormatted += `\`\`\``;
            extraFields.push({ name: "🛡️ ADMINS STATUS", value: adminsFormatted, inline: false });
        }

        if (validFriends.length > 0) {
            const friendsData = processList(validFriends);
            let friendsFormatted = `\`\`\`md\n`;
            if (friendsData.active.length > 0) friendsFormatted += friendsData.active.map(f => `• ${f} (Active)`).join("\n") + "\n";
            if (friendsData.afk.length > 0) friendsFormatted += friendsData.afk.map(f => `• ${f} (AFK/Loading)`).join("\n") + "\n";
            if (friendsData.active.length === 0 && friendsData.afk.length === 0) friendsFormatted += `No friends online\n`;
            friendsFormatted += `\`\`\``;
            extraFields.push({ name: "⭐ FRIENDS STATUS IN SERVER", value: friendsFormatted, inline: false });
        }

        let nextMap = "Unknown";
        const sponsorText = state.raw.bf2_sponsortext || "";

        if (sponsorText.includes("|")) {
            let parts = sponsorText.split("|");
            if (parts.length > 1) {
                nextMap = parts.pop().trim();
            }
        }

        const rawMode = (state.raw.gametype || "gpm_insurgency").toLowerCase();
        let modeDisplay = (rawMode === "gpm_cq") ? "Advance and Secure" : rawMode.replace("gpm_", "").toUpperCase();
        const mapSize = state.raw.bf2_mapsize || "64";
        const mapClean = state.map.toLowerCase().replace(/ /g, "");
        const mapLayerUrl = `https://mapgallery.realitymod.org/images/maps/${mapClean}/mapoverview_${rawMode}_${mapSize}.jpg?v=${mapStartTime}`;

        let layerDisplay = "Std";
        if (mapSize === "16") layerDisplay = "Inf";
        else if (mapSize === "32") layerDisplay = "Alt";
        else if (mapSize === "64") layerDisplay = "Std";
        else if (mapSize === "128") layerDisplay = "Lrg";

        const uniquePlayersCount = new Set(queryPlayers.map(p => p.name || p.player || p.pname)).size;

        const embedColor = config.botSettings.embedColor || '#c59434';

        // الفوتر بيتبني بالكامل من config.json بس - مفيش أي اسم تابت (hardcoded) في الكود
        const footerParts = [];
        if (config.botSettings.footerText && config.botSettings.footerText.trim() !== "") {
            footerParts.push(config.botSettings.footerText.trim());
        }
        footerParts.push(`Updated: ${new Date().toLocaleTimeString('en-US')}`);
        const footerText = footerParts.join(" • ");

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${state.name}`)
            .setColor(embedColor)
            .setDescription(`🟢 **SERVER STATUS: ONLINE** | ⏱️ **ELAPSED: ${timeDisplay}**\n## 👥 PLAYERS: \`${state.raw.numplayers || uniquePlayersCount} / ${state.maxplayers}\``)
            .addFields(
                { name: "🗺️ CURRENT MAP", value: `**${state.map}**`, inline: true },
                { name: "🎮 MODE", value: `**${modeDisplay}**`, inline: true },
                { name: "💠 LAYER", value: `**${layerDisplay}**`, inline: true },
                { name: "⚔️ FACTIONS", value: `**${factionsText}**`, inline: true },
                { name: "⏭️ NEXT MAP", value: `**${nextMap}**`, inline: true }
            )
            .setThumbnail(`https://www.realitymod.com/images/maps/${mapClean}.jpg`)
            .setImage(mapLayerUrl)
            .setFooter({ text: footerText })
            .setTimestamp();

        if (extraFields.length > 0) {
            embed.addFields(...extraFields);
        }

        const channel = await client.channels.fetch(config.discord.channelId);
        if (!botMessage) {
            const msgs = await channel.messages.fetch({ limit: 10 });
            botMessage = msgs.find(m => m.author.id === client.user.id && !m.system && m.editable);
        }

        if (botMessage) await botMessage.edit({ embeds: [embed] });
        else botMessage = await channel.send({ embeds: [embed] });

    } catch (err) {
        console.log("Error:", err.message);
    }
}

client.once(Events.ClientReady, () => {
    console.log(`Dashboard is up!`);
    updateDashboard();
    setInterval(updateDashboard, config.botSettings.updateInterval);
});

client.login(config.discord.token);
