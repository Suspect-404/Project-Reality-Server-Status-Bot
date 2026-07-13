# Project Reality Discord Dashboard Bot

## About
A fully automated, live-updating Discord bot designed for Project Reality: BF2 communities. It fetches real-time server data and maintains a continuous dashboard in a specific Discord channel. It tracks server status, maps, and specific player lists (Admins/VIPs) with high precision by combining direct network pings with official PR API data.

Developed by Ezzeldin.

## Features
- Live Updating Dashboard: The bot continuously edits a single message to avoid spamming the channel.
- Time Tracking: Displays the live round time by calculating server start delays. (Note: Due to server synchronization, the displayed time usually has an approximate 2-minute delay).
- Player Tracking: Separate lists to track when Admins and specific Friends/VIPs are online in the server. 
- AFK/Loading Detection: The bot intelligently detects if a tracked player is active or stuck in loading/AFK by checking if their in-game score, kills, and deaths remain at zero.
- Map Visuals: Automatically pulls the current map's layout and displays it in the embed.
- Next Map Detection: Extracts the upcoming map directly from the server's sponsor text.
- Easy Configuration: No coding required. Everything is controlled via a simple configuration file.

## How It Works
To ensure maximum accuracy and stability, this bot utilizes a dual-query system:
1. Direct Server Query: It uses the gamedig library to ping your PR server directly via the GameSpy4 protocol. This retrieves instantaneous data such as the current map, active player count, and raw match variables.
2. Official PR API Integration: It cross-references the raw data with the official Project Reality Server API. This guarantees that player names, scores, kills, and team assignments are highly accurate and formatted correctly.

## Setup Guide

### Phase 1: Creating Your Discord Bot
1. Go to the Discord Developer Portal (https://discord.com/developers/applications).
2. Click "New Application" and give it a name.
3. On the left sidebar, click "Bot".
4. Under "Privileged Gateway Intents", enable "Server Members Intent" and "Message Content Intent".
5. Scroll down and click "Reset Token" to get your bot's token. Copy and save it safely.
6. Go to the "OAuth2" tab -> "URL Generator". Select "bot" and check the following permissions: "View Channels", "Send Messages", and "Manage Messages".
7. Copy the generated URL, paste it into your browser, and invite the bot to your server.

### Phase 2: Finding Your Server IP and API Name
To make the bot work perfectly, you need the exact Server IP and the official API Name.

Finding the IP (Network Method):
1. Join your target server in-game.
2. Open Windows Task Manager -> go to the "Performance" tab -> click "Open Resource Monitor".
3. Navigate to the "Network" tab and look for the PRBF2.exe process.
4. Check the "Network Activity" section for the exact IP address the game is connected to. Copy this IP.

Finding the API Name:
1. Open this link in your browser: https://servers.realitymod.com/api/ServerInfo
2. Press Ctrl + F and search for your server's name.
3. Find the exact "hostname" value. Copy it exactly as written.

### Phase 3: Hosting on Bot-Hosting.net
You can easily host this bot for free 24/7 using Bot-Hosting.net.
1. Create an account on https://bot-hosting.net.
2. Go to your Dashboard and click "Create Server". Select the NodeJS option.
3. Open your new server's panel and go to the "File Manager" tab.
4. Upload your index.js, config.json, and package.json files.
5. Go to the "Console" tab and run the following command to install dependencies: 
   npm install discord.js gamedig

### Phase 4: Configuration & Startup
Now that your files are on the host, go back to the "File Manager" in Bot-Hosting and open the config.json file to update your details:

* discord.token: Paste the bot token you saved from Phase 1.
* discord.channelId: In Discord, enable "Developer Mode" (Settings -> Advanced), right-click your desired channel, and select "Copy Channel ID". Paste it here.
* server.ip & server.port: Enter your server's IP (from Phase 2) and Port (default PR port is 29900).
* server.apiName: Ensure this matches the server name exactly as it appears in the official API (from Phase 2).
* adminsList / friendsList: Add the exact in-game names to track. If you do not want to use these features, leave the brackets empty: []

Once configured, save the file, go back to the "Console" tab, and click the "Start" button. If the console shows "Dashboard is up!", your bot is successfully running!
