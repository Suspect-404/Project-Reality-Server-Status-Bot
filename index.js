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


let previousOnlineFriends = new Set();
let adminAlertActive = false;
let lastAdminAlertTime = 0;

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
            
            previousOnlineFriends = new Set();
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
            let active = [];
            let afk = [];
            const seenActive = new Set();
            const seenAfk = new Set();

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

                   
                    const entry = { name: finalName, display: `${finalName} - ${teamTag}` };

                    if (scoreAPI !== 0 || scoreQuery !== 0 || kills > 0 || deaths > 0) {
                        if (!seenActive.has(finalName)) { seenActive.add(finalName); active.push(entry); }
                    } else {
                        if (!seenAfk.has(finalName)) { seenAfk.add(finalName); afk.push(entry); }
                    }
                }
            });
            return { active, afk };
        };

        const validAdmins = (config.adminsList || []).filter(name => name.trim() !== "");
        const validFriends = (config.friendsList || []).filter(name => name.trim() !== "");

        const formatTrackedGroup = (data, emptyLabel) => {
            if (data.active.length === 0 && data.afk.length === 0) {
                return `\`\`\`\n${emptyLabel}\n\`\`\``;
            }
            let out = "";
            if (data.active.length > 0) {
                out += `✅ **ACTIVE:**\n\`\`\`md\n${data.active.map(p => `• ${p.display}`).join("\n")}\`\`\`\n`;
            }
            if (data.afk.length > 0) {
                out += `💤 **AFK / LOADING:**\n\`\`\`md\n${data.afk.map(p => `• ${p.display}`).join("\n")}\`\`\``;
            }
            return out;
        };

        const extraFields = [];

        let adminsData = null;
        if (validAdmins.length > 0) {
            adminsData = processList(validAdmins);
            const adminsFormatted = formatTrackedGroup(adminsData, "No admins online");
            extraFields.push({ name: "🛡️ ADMINS STATUS IN SERVER", value: adminsFormatted, inline: false });
        }

        let friendsData = null;
        if (validFriends.length > 0) {
            friendsData = processList(validFriends);
            const friendsFormatted = formatTrackedGroup(friendsData, "No friends online");
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
        const currentPlayerCount = parseInt(state.raw.numplayers) || uniquePlayersCount;

        const embedColor = config.botSettings.embedColor || '#c59434';

        
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

        
        const notifyCfg = config.notifications || {};

        
        const friendNotifyCfg = notifyCfg.friends || {};
        if (friendsData && friendNotifyCfg.channelId && friendNotifyCfg.channelId.trim() !== "") {
            const currentOnlineFriends = new Set([...friendsData.active, ...friendsData.afk].map(p => p.name));
            const newlyOnline = [...currentOnlineFriends].filter(n => !previousOnlineFriends.has(n));

            if (newlyOnline.length > 0) {
                const message = newlyOnline.length === 1
                    ? `${newlyOnline[0]} is online!`
                    : `${newlyOnline.join(", ")} are online!`;
                const mention = (friendNotifyCfg.roleId && friendNotifyCfg.roleId.trim() !== "")
                    ? `<@&${friendNotifyCfg.roleId}> `
                    : "";

                try {
                    const notifyChannel = await client.channels.fetch(friendNotifyCfg.channelId);
                    await notifyChannel.send({ content: `${mention}🟢 **${message}**` });
                } catch (e) {
                    console.log("Friend notification error:", e.message);
                }
            }
            previousOnlineFriends = currentOnlineFriends;
        }

        
        const adminNotifyCfg = notifyCfg.admins || {};
        if (validAdmins.length > 0 && adminNotifyCfg.channelId && adminNotifyCfg.channelId.trim() !== "") {
            const threshold = parseInt(adminNotifyCfg.playerThreshold) || 60;
            const repeatMinutes = parseInt(adminNotifyCfg.repeatMinutes) || 30;
            const repeatIntervalMs = repeatMinutes * 60 * 1000;
            const noAdminsOnline = adminsData && adminsData.active.length === 0 && adminsData.afk.length === 0;

            if (currentPlayerCount >= threshold && noAdminsOnline) {
                const nowTime = Date.now();
               
                const shouldSend = !adminAlertActive || (nowTime - lastAdminAlertTime >= repeatIntervalMs);

                if (shouldSend) {
                    adminAlertActive = true;
                    lastAdminAlertTime = nowTime;
                    const mention = (adminNotifyCfg.roleId && adminNotifyCfg.roleId.trim() !== "")
                        ? `<@&${adminNotifyCfg.roleId}> `
                        : "";
                    try {
                        const notifyChannel = await client.channels.fetch(adminNotifyCfg.channelId);
                        await notifyChannel.send({ content: `${mention}⚠️ **${currentPlayerCount} players online and no admins online!**` });
                    } catch (e) {
                        console.log("Admin notification error:", e.message);
                    }
                }
            } else {
                adminAlertActive = false;
            }
        }

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
