# Project Reality Discord Dashboard Bot

## About
A fully automated, live-updating Discord bot designed for Project Reality: BF2 communities. It fetches real-time server data and maintains a continuous dashboard in a specific Discord channel. It tracks server status, maps, and specific player lists (Admins/VIPs) with high precision by combining direct network pings with official PR API data.

Developed by Ezzeldin.

## Features
- Live Updating Dashboard: The bot continuously edits a single message to avoid spamming the channel.
- Accurate Time Tracking: Displays the exact live round time by calculating server start delays.
- Player Tracking: Separate lists to track when Admins and specific Friends/VIPs are online (Detects if they are Active or AFK/Loading).
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
To make the bot work perfectly, you need the exact IP and the official Server Name.

Method A: The API Method (Recommended & Easiest)
Instead of using external tools, you can find your exact details directly from the official API:
1. Open this link in your browser: https://servers.realitymod.com/api/ServerInfo
2. Press Ctrl + F and search for your server's name.
3. You will find the exact "hostname" (API Name) and "ip" right next to it. Copy both.

Method B: The Manual Network Method
If you are currently playing on the server and want to extract the IP manually:
1. Join the server in-game.
2. Open Windows Task Manager -> go to the "Performance" tab -> click "Open Resource Monitor".
3. Navigate to the "Network" tab and look for the PRBF2.exe process.
4. Check the "Network Activity" section for the IP addresses the game is connected to.
5. You can test this IP using GameDig to verify it returns your exact server name.

### Phase 3: Configuration
Open the config.json file provided in the repository and update the following fields:
* discord.token: Paste the bot token you saved from Phase 1.
* discord.channelId: In Discord, enable "Developer Mode" (Settings -> Advanced), right-click your desired channel, and select "Copy Channel ID".
* server.ip & server.port: Enter your server's IP and Port (default PR port is 29900).
* server.apiName: Ensure this matches the server name exactly as it appears in the official API (from Phase 2).
* adminsList / friendsList: Add the exact in-game names to track. If you do not want to use these features, leave the brackets empty: []

### Phase 4: Hosting on Bot-Hosting.net
You can easily host this bot for free 24/7 using Bot-Hosting.net.
1. Create an account on https://bot-hosting.net.
2. Go to your Dashboard and click "Create Server". Select the NodeJS option.
3. Open your new server's panel and go to the "File Manager" tab.
4. Upload your index.js, config.json, and package.json files.
5. Go to the "Console" tab and run the following command to install dependencies: 
   npm install discord.js gamedig
6. Click the "Start" button. If the console shows "Dashboard is up!", your bot is successfully running and the dashboard will appear in your Discord channel.
