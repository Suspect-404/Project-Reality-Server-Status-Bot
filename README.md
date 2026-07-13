# Project-Reality-Server-Status-Bot

![Dashboard Preview](https://i.postimg.cc/6q9hXGp4/𝒑𝒓𝒂𝒓-𝒔𝒑𝒚-PRAR-Project-Reality-Arabic-Community-Discord-5-15-2026-4-59-40-PM.png)

## About
A fully automated, live-updating Discord bot designed for Project Reality: BF2 communities. It fetches real-time server data and maintains a continuous dashboard in a specific Discord channel. It tracks server status, maps, and specific player lists (Admins/VIPs) with high precision by combining direct network pings with official PR API data.

Developed by Ezzeldin.

## How It Works
To ensure maximum accuracy and stability, this bot utilizes a dual-query system:
1. Direct Server Query: It uses the gamedig library to ping your PR server directly via the GameSpy4 protocol. This retrieves instantaneous data such as the current map, active player count, and raw match variables.
2. Official PR API Integration: It cross-references the raw data with the official Project Reality Server API. This guarantees that player names, scores, kills, and team assignments are highly accurate and formatted correctly.

## Features
- Live Updating Dashboard: The bot continuously edits a single message to avoid spamming the channel.
- Player Count & Factions: Displays the total number of active players and the current battling factions.
- Time Tracking: Displays the live round time by calculating server start delays. (Note: Due to server synchronization, the displayed time usually has an approximate 2-minute delay).
- Player Tracking: Separate lists to track when Admins and specific Friends/VIPs are online in the server, explicitly displaying which team they are currently playing on. 
- AFK/Loading Detection: The bot intelligently detects if a tracked player is active or stuck in loading/AFK by checking if their in-game score, kills, and deaths remain at zero.
- Map Visuals: Automatically pulls the current map's layout and displays it in the embed.
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
To make the bot work perfectly, you need the exact Server IP and the official API Name.

Finding the Server IP:
1. Join your target server in-game.
2. Open Windows Task Manager -> go to the "Performance" tab -> click "Open Resource Monitor".
3. Navigate to the "Network" tab and look for the PRBF2.exe process under Network Activity to see active IP connections.
4. If multiple IP addresses appear, open your terminal/command prompt and test an IP using GameDig CLI:
   `npx gamedig --type battlefield2 <IP>`
5. Check the output returned in terminal to confirm it matches your server's name.

Finding the API Name:
1. Open this link in your browser: https://servers.realitymod.com/api/ServerInfo
2. Press Ctrl + F and search for your server's name.
3. Find the exact "hostname" value. Copy it exactly as written.

### Phase 4: Free Hosting on Bot-Hosting.net
You can host this bot 100% free using Bot-Hosting.net:
1. Create an account on https://bot-hosting.net.
2. Go to the "Earn Coins" section on the left sidebar to claim your free daily coins (you get 10 free coins every day).
3. Click "Create Server" and select the **Starter** plan (256 MB RAM / 20% CPU / 10 coins per week).
4. Select NodeJS as your server environment and create the server.
5. Go to your new server panel, click on the "File Manager" tab, and upload your extracted `index.js`, `config.json`, and `package.json` files.
6. Go to the "Console" tab and run the following command to install dependencies: 
   `npm install discord.js gamedig`

### Phase 5: Configuration & Startup
Now open `config.json` directly inside the File Manager on Bot-Hosting.net and update your details:

* discord.token: Paste the bot token you saved from Phase 2.
* discord.channelId: In Discord, enable "Developer Mode" (Settings -> Advanced), right-click your desired channel, and select "Copy Channel ID". Paste it here.
* server.ip & server.port: Enter your server's IP (from Phase 3) and Port (default PR port is 29900).
* server.apiName: Ensure this matches the server name exactly as it appears in the official API (from Phase 3).
* adminsList / friendsList: Add the exact in-game names to track. If you do not want to use these features, leave the brackets empty: []

Save the file, return to the "Console" tab, and click "Start". The bot will launch and start managing your live PR dashboard.
