# Project Reality Discord Dashboard Bot 🎮

## 📖 About
A fully automated, live-updating Discord bot designed for **Project Reality: BF2** communities. It fetches real-time server data and maintains a continuous dashboard in a specific Discord channel. It seamlessly tracks server status, current map, elapsed time, factions, and even tracks specific Admins and Friends/VIPs presence in the server.

Developed by **Ezzeldin**.

## ✨ Features
- **Live Updating Dashboard:** The bot continuously edits a single message to avoid spamming the channel.
- **Accurate Time Tracking:** Displays the exact live round time.
- **Player Tracking:** Separate lists to track when Admins and specific Friends/VIPs are online in the server (Detects if they are Active or AFK/Loading).
- **Map Visuals:** Automatically pulls the current map's layout/minimap and displays it in the embed.
- **Next Map Detection:** Extracts the upcoming map from the server's sponsor text.
- **Easy Configuration:** No need to edit the main code. Everything is controlled via a simple `config.json` file.

## ⚙️ Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine or host.
- A Discord Bot Token (Get it from [Discord Developer Portal](https://discord.com/developers/applications)).

### 2. Installation
Clone the repository and install the required dependencies:
```bash
npm install discord.js gamedig
