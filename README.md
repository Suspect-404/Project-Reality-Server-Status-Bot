# Project Reality Discord Dashboard Bot

## About
A fully automated, live-updating Discord bot designed for Project Reality: BF2 communities. It fetches real-time server data and maintains a continuous dashboard in a specific Discord channel. It tracks server status, maps, and specific player lists (Admins/VIPs) with high precision by combining direct network pings with official PR API data.

## How to Get Your Server IP and Port
If you are the server owner or administrator, you can find your connection details:
1.  **In-Game:** Open the server browser in PR:BF2. Right-click on your server and select "Copy IP/Port".
2.  **Server Panel:** If you host your server (e.g., via a GSP), the IP and Port are always displayed in your server dashboard/control panel.
3.  **Note:** The standard Port for Project Reality is `29900`. If you are unsure, ask your hosting provider for the "Query Port".

## Step-by-Step Setup Guide

### Phase 1: Creating Your Discord Bot
1.  Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2.  Click "New Application" and give it a name.
3.  On the left sidebar, click "Bot".
4.  Under "Privileged Gateway Intents", enable **Server Members Intent** and **Message Content Intent**.
5.  Scroll down and click "Reset Token" to get your bot's token. Copy and save it.
6.  Go to the "OAuth2" tab -> "URL Generator". Select `bot` and `View Channels`, `Send Messages`, `Manage Messages` (needed to edit the dashboard).
7.  Copy the generated URL, paste it into your browser, and invite the bot to your server.

### Phase 2: Configuration
Open the `config.json` file provided in the repository and update the following:
*   `token`: Paste the bot token you saved from Phase 1.
*   `channelId`: In Discord, enable "Developer Mode" (Settings -> Advanced), right-click your desired channel, and select "Copy Channel ID".
*   `server.ip` & `server.port`: Enter your server's IP and Query Port.
*   `server.apiName`: Ensure this matches the server name exactly as it appears in the official PR launcher list; otherwise, player stats will not load.
*   `adminsList` / `friendsList`: Add the exact in-game names to track. If you don't need these lists, leave them empty as `[]`.

### Phase 3: Hosting on Bot-Hosting.net
1.  Create an account on [Bot-Hosting.net](https://bot-hosting.net/).
2.  Go to your Dashboard and click "Create Server". Select the **NodeJS** option.
3.  Open your new server's "File Manager".
4.  Upload your `index.js`, `config.json`, and `package.json` files.
5.  Go to the "Console" tab and run the following command to install the required tools:
    `npm install discord.js gamedig`
6.  Click the "Start" button. If the console shows "Dashboard is up!", your bot is successfully running.
