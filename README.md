# Project Reality Discord Dashboard Bot

## About
A fully automated, live-updating Discord bot designed for Project Reality: BF2 communities. It fetches real-time server data and maintains a continuous dashboard in a specific Discord channel. It seamlessly tracks server status, current map, elapsed time, factions, and specific players' presence.

Developed by Ezzeldin.

## How It Works
To ensure maximum accuracy and stability, this bot utilizes a dual-query system:
1.  **Direct Server Query:** It uses the `gamedig` library to ping your PR server directly via the GameSpy4 protocol. This retrieves instantaneous data such as the current map, active player count, and raw match variables (like starting delay and gamemodes).
2.  **Official PR API Integration:** It cross-references the raw data with the official Project Reality Server API (`servers.realitymod.com/api/ServerInfo`). This guarantees that player names, scores, kills, and team assignments are highly accurate and formatted correctly, bypassing the common glitches of basic server queries.

## Features
-   **Live Updating Dashboard:** The bot continuously edits a single message to avoid spamming the channel.
-   **Accurate Time Tracking:** Displays the exact live round time by calculating server start delays.
-   **Player Tracking:** Separate lists to track when Admins and specific Friends/VIPs are online (Detects if they are Active or AFK/Loading).
-   **Map Visuals:** Automatically pulls the current map's layout and displays it in the embed.
-   **Next Map Detection:** Extracts the upcoming map directly from the server's sponsor text.

## Configuration Guide
All bot settings are managed through the `config.json` file. You do not need to edit the main code.

*   `discord.token`: Your Discord bot token from the Discord Developer Portal.
*   `discord.channelId`: The ID of the Discord channel where the bot will post and update the dashboard.
*   `server.ip`: Your PR server IP address.
*   `server.port`: Your PR server Port (the default PR port is 29900).
*   `server.apiName`: The exact name of your server as it appears on the official PR server list (Crucial for fetching accurate player stats).
*   `botSettings.updateInterval`: How often the bot refreshes the data in milliseconds (15000 = 15 seconds).
*   `botSettings.footerText`: Custom text to display at the bottom of the dashboard.
*   `adminsList`: Add in-game names here to track server administrators. Leave empty `[]` if not needed.
*   `friendsList`: Add in-game names here to track VIPs or friends. Leave empty `[]` if not needed.

## Setup & Hosting (Bot-Hosting.net)
You can easily host this bot for free 24/7 using Bot-Hosting.net.

1.  **Prepare your files:** Ensure you have your `index.js`, `config.json`, and `package.json` ready.
2.  **Create a Server:** Log in to Bot-Hosting.net, go to your dashboard, and create a new NodeJS server.
3.  **Upload Files:** Go to the "Files" section of your new server panel and upload the bot files.
4.  **Install Packages:** Go to the "Console" tab and type: `npm install discord.js gamedig`
5.  **Start the Bot:** Once the installation is complete, click the "Start" button on the panel. The bot will go online and generate the dashboard in your specified channel.
