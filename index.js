const { Client, GatewayIntentBits, EmbedBuilder, Events } = require("discord.js");
const { GameDig } = require("gamedig");
const https = require('https');

const TOKEN = "Put your bot token here";
const CHANNEL_ID = "Put CHANNEL_ID this where the bot supposed to Show the Panel";

const friendsList = [
    "Ezzeldin", "KoMaTsY", "Moh009", "AHMAD_EG", "PLSt", // Example
    "brhom2223", "3NDLEB", "sa3soo3", "osamabinkaboom", "mylifebelike6", "3abas_",
    "=IED=1HPguy", "omar3215j", "ZAROVESKY", "jason65", "osama21", "eisa112", "nyslientsoul", "BaraaElAntel", "sgt.GLiiiTCHE", "eisa125", "AhmedNasr",
    "VORTEX-VIPER", "Qotibah208tti", "BaraaElAntil", "ZAKOexp", "almasry", "Youssef117", "A7MAD_EG",
    "FARESEL3ASB", "the_xyz", "Zomblex", "Mujahid_Express", "tarnished_0n3", "Star-Boy", "M_O"         // Put your friend here
];

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
                    const srv = parsed.servers.find(s => (s.properties?.hostname || "").includes("[ENG] Alliance EU"));
                    resolve(srv || null);
                } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

async function updateDashboard() {
    try {
        const state = await GameDig.query({
            type: 'battlefield2', host: '149.202.89.241', port: 29900, maxRetries: 3,
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

        // 1. حساب الوقت الحي (Live Mode)
        const startDelaySeconds = parseInt(state.raw?.bf2_startdelay) || 0;
        const exactRoundStartTime = Math.floor(mapStartTime / 1000) + startDelaySeconds;
        const timeDisplay = `<t:${exactRoundStartTime}:R>`;

        const team1Name = state.raw?.bf2_team1 || "Team 1";
        const team2Name = state.raw?.bf2_team2 || "Team 2";
        const factionsText = `${team1Name} vs ${team2Name}`;

        let activeFriends = new Set();
        let afkFriends = new Set();

        let queryPlayers = [];
        if (Array.isArray(state.players)) queryPlayers.push(...state.players);
        if (state.raw && Array.isArray(state.raw.players)) queryPlayers.push(...state.raw.players);

        friendsList.forEach(friend => {
            const fClean = friend.toLowerCase().trim();
            const pQuery = queryPlayers.find(p => (p.name || p.player || p.pname || "").toLowerCase().includes(fClean));
            const pAPI = apiPlayers.find(p => (p.name || "").toLowerCase().includes(fClean));

            if (pQuery || pAPI) {
                const finalName = (pQuery?.name || pQuery?.player || pQuery?.pname || pAPI?.name || friend).trim();

                const scoreAPI = parseInt(pAPI?.score) || 0;
                const scoreQuery = parseInt(pQuery?.score) || parseInt(pQuery?.frags) || (pQuery?.raw && pQuery?.raw?.score ? parseInt(pQuery?.raw?.score) : 0) || 0;
                const kills = parseInt(pAPI?.kills) || 0;
                const deaths = parseInt(pAPI?.deaths) || parseInt(pQuery?.deaths) || 0;

                const teamNum = parseInt(pAPI?.team) || parseInt(pQuery?.team) || (pQuery?.raw && pQuery?.raw?.team ? parseInt(pQuery?.raw?.team) : 0) || 0;
                let teamTag = "";
                if (teamNum === 1) teamTag = `[${team1Name}]`;
                else if (teamNum === 2) teamTag = `[${team2Name}]`;
                else teamTag = `[Loading/Spec]`;

                // 2. فصل الاسم والفريق، وإزالة كلمة Idle
                if (scoreAPI !== 0 || scoreQuery !== 0 || kills > 0 || deaths > 0) {
                    const displayString = `${finalName} - ${teamTag}`;
                    activeFriends.add(displayString);
                } else {
                    const displayString = `${finalName} - ${teamTag}`; // تم إزالة "- Idle" من هنا
                    afkFriends.add(displayString);
                }
            }
        });

        let activeArr = Array.from(activeFriends);
        let afkArr = Array.from(afkFriends);

        let friendsFormatted = "";
        if (activeArr.length > 0) {
            friendsFormatted += `✅ **ACTIVE:**\n\`\`\`md\n${activeArr.map(f => `• ${f}`).join("\n")}\`\`\`\n`;
        }
        if (afkArr.length > 0) {
            friendsFormatted += `💤 **AFK / LOADING:**\n\`\`\`md\n${afkArr.map(f => `• ${f}`).join("\n")}\`\`\``;
        }

        // 3. رسالة لو مفيش حد من صحابك بيلعب
        if (activeArr.length === 0 && afkArr.length === 0) {
            friendsFormatted = "```\nNo friends online\n```";
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

        // 4. قراءة أنواع الـ Layers الأربعة بشكل صحيح
        let layerDisplay = "Std";
        if (mapSize === "16") layerDisplay = "Inf";
        else if (mapSize === "32") layerDisplay = "Alt";
        else if (mapSize === "64") layerDisplay = "Std";
        else if (mapSize === "128") layerDisplay = "Lrg";

        const uniquePlayersCount = new Set(queryPlayers.map(p => p.name || p.player || p.pname)).size;

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${state.name}`)
            .setColor('#c59434')
            .setDescription(`🟢 **SERVER STATUS: ONLINE** | ⏱️ **ELAPSED: ${timeDisplay}**\n## 👥 PLAYERS: \`${state.raw.numplayers || uniquePlayersCount} / ${state.maxplayers}\``)
            .addFields(
                { name: "🗺️ CURRENT MAP", value: `**${state.map}**`, inline: true },
                { name: "🎮 MODE", value: `**${modeDisplay}**`, inline: true },
                { name: "💠 LAYER", value: `**${layerDisplay}**`, inline: true },

                { name: "⚔️ FACTIONS", value: `**${factionsText}**`, inline: true },
                { name: "⏭️ NEXT MAP", value: `**${nextMap}**`, inline: true },

                { name: "⭐ FRIENDS STATUS IN SERVER", value: friendsFormatted, inline: false }
            )
            .setThumbnail(`https://www.realitymod.com/images/maps/${mapClean}.jpg`)
            .setImage(mapLayerUrl)
            .setFooter({ text: `Developed by Ezzeldin • Updated: ${new Date().toLocaleTimeString('en-US')}` })
            .setTimestamp();

        const channel = await client.channels.fetch(CHANNEL_ID);
        if (!botMessage) {
            const msgs = await channel.messages.fetch({ limit: 10 });
            botMessage = msgs.find(m => m.author.id === client.user.id);
        }

        if (botMessage) await botMessage.edit({ embeds: [embed] });
        else botMessage = await channel.send({ embeds: [embed] });

    } catch (err) {
        console.log("Error:", err.message);
    }
}

client.once(Events.ClientReady, () => {
    console.log(`✅ Dashboard is up!`);
    updateDashboard();

    // 5. تحديث كل 15 ثانية لدقة أسرع
    setInterval(updateDashboard, 15000);
});

client.login("Put your bot token here"); 