# Project-Reality-Server-Status-Bot

## About
A fully automated, live-updating Discord bot designed for Project Reality: BF2 communities. It fetches real-time server data and maintains a continuous dashboard in a specific Discord channel. It tracks server status, maps, and specific player lists (Admins/Friends) with high precision by combining direct network pings with official PRSPY data.

## How It Works
To ensure maximum accuracy and stability, this bot utilizes a dual-query system:
1. **Direct Server Query (GameDig):** Pings your PR server directly via the GameSpy4 protocol. This retrieves the live match data shown on the dashboard: current map, next map, mode, layer, factions, and total player count.
2. **PRSPY / Realitymod Server API:** Used to cross-reference your tracked **Admins** and **Friends** lists, matching their team assignment and Active/AFK status in the server.

## Features
- Live Updating Dashboard: The bot continuously edits a single message to avoid spamming the channel.
- Player Count & Factions: Displays the total number of active players and the current battling factions.
- Time Tracking: Displays the live round time by calculating server start delays. (Note: Due to server synchronization, the displayed time usually has an approximate 2-minute delay).
- Player Tracking: Separate lists to track when Admins and specific Friends/VIPs are online in the server, explicitly displaying which team they are currently playing on.
- AFK/Loading Detection: The bot intelligently detects if a tracked player is active or stuck in loading/AFK by checking if their in-game score, kills, and deaths remain at zero.
- Map Visuals: Automatically pulls the current map's layout from the official PR Map Gallery and displays it in the embed.
- Next Map Detection: Extracts the upcoming map directly from the server's sponsor text.

## Setup Guide

### Phase 1: Download the Files
Before starting, you need to download the bot files to your computer:
1. Scroll to the top of this GitHub page.
2. Click the green **Code** button.
3. Select **Download ZIP** and extract the files to a folder on your computer.

### Phase 2: Creating Your Discord Bot
1. Go to the Discord Developer Portal (https://discord.com/developers/applications).
2. Click "New Application" and give it a name.
3. On the left sidebar, click "Bot".
4. Under "Privileged Gateway Intents", enable "Server Members Intent" and "Message Content Intent".
5. Scroll down and click "Reset Token" to get your bot's token. Copy and save it safely.
6. Go to the "OAuth2" tab -> "URL Generator". Select "bot" and check the following permissions: "View Channels", "Send Messages", and "Manage Messages".
7. Copy the generated URL, paste it into your browser, and invite the bot to your server.

### Phase 3: Finding Your Server IP and API Name

**Finding the Server IP:**
1. Join your target server in-game.
2. Open Windows Task Manager -> go to the "Performance" tab -> click "Open Resource Monitor".
3. Navigate to the "Network" tab and look for the PRBF2.exe process under Network Activity to see active IP connections.
4. If multiple IP addresses appear, use **QuickDig UI** (https://quick-dig-ui.vercel.app) to confirm which one is correct. Enter the IP with Query Port `29900` and check that the server name and player list match your server.

**Finding the API Name:**
1. Go to PRSPY (https://prspy.realitymod.org).
2. Open the "PR:BF2 Servers" tab and find your server (use the Search button if needed). Its exact name is shown at the top of the panel once opened, e.g. `[ENG] Alliance EU | alliance-community.com`.
3. Copy this name exactly as displayed. This is your `apiName`.

### Phase 4: Free Hosting on Bot-Hosting.net
You can host this bot 100% free using Bot-Hosting.net:
1. Create an account on https://bot-hosting.net.
2. Go to the "Credits" section on the left sidebar to claim your free daily coins.
3. Click "+ New" and select the **Starter** plan.
4. Choose NodeJS as your server environment and create the project.
5. Open your new project, go to the "Files" tab, and upload your extracted `index.js`, `config.json`, `package.json`, and `package-lock.json` files.
6. Dependencies (`discord.js`, `gamedig`) install automatically from `package.json` when the bot starts, no manual install command needed. If a dependency ever fails to load, check the "Packages" tab to confirm it's listed.

### Phase 5: Configuration & Startup
Now open `config.json` directly inside the "Files" tab on Bot-Hosting.net and update your details:

* `discord.token`: Paste the bot token you saved from Phase 2.
* `discord.channelId`: In Discord, enable "Developer Mode" (Settings -> Advanced), right-click your desired channel, and select "Copy Channel ID". Paste it here.
* `server.ip` & `server.port`: Enter your server's IP (from Phase 3) and Port (default PR port is 29900).
* `server.apiName`: Ensure this matches the server name exactly as it appears on PRSPY (from Phase 3).
* `adminsList` / `friendsList`: Add the exact in-game names to track. If you do not want to use these features, leave the brackets empty: `[]`

Save the file, go to the "Manage" tab, and click "Start". The bot will launch and start managing your live PR dashboard.

---

## Related Projects
- **[QuickDig UI](https://github.com/Suspect-404/QuickDig-UI)**: a free, open-source, login-free web tool by the same author for verifying a server's IP, Query Port, and live player roster. It's a lightweight companion tool, not a replacement for [PRSPY](https://prspy.realitymod.org), which remains the official PR:BF2 server/player browser.

---

## Screenshots
![Dashboard Screenshot](https://i.postimg.cc/hvcN5rzy/𝒑𝒓𝒂𝒓-𝒔𝒑𝒚-PRAR-Project-Reality-Arabic-Community-Discord-5-15-2026-4-59-40-PM.png)
![Dashboard Screenshot](https://i.postimg.cc/xdmrkByd/𝒑𝒓𝒂𝒓-𝒔𝒑𝒚-PRAR-Project-Reality-Arabic-Community-Discord-5-15-2026-5-05-27-PM.png)
