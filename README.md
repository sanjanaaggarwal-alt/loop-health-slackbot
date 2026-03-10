# Loop Health Slack Bot

A Slack bot that detects when employees mention being sick and replies in-thread with a link to book a free doctor consultation through Loop Health.

## Prerequisites

- Node.js >= 18
- A Slack workspace where you have admin access

## Slack App Configuration

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** > **From scratch**
2. Name it (e.g. "Loop Health Bot") and select your workspace
3. Go to **Socket Mode** in the left sidebar and **enable** it
4. Go to **OAuth & Permissions** and add these **Bot Token Scopes**:
   - `channels:history` — read messages in public channels
   - `groups:history` — read messages in private channels
   - `chat:write` — send messages
5. Click **Install App** in the left sidebar and install to your workspace. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
6. Go to **Basic Information** → scroll to **App-Level Tokens** → click **Generate Token and Scopes**
   - Name: `socket-token`
   - Add scope: `connections:write`
   - Click **Generate** and copy the token (starts with `xapp-`)
7. Go to **Event Subscriptions**:
   - Toggle **Enable Events** on
   - Under **Subscribe to bot events**, add:
     - `message.channels`
     - `message.groups`
   - Click **Save Changes**
8. Invite the bot to channels where it should listen: `/invite @Loop Health Bot`

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
# Edit .env with your SLACK_BOT_TOKEN and SLACK_APP_TOKEN

# 3. Start the server
npm run dev
```

No ngrok or public URL needed — Socket Mode connects directly to Slack via WebSocket.

## Deploy on Render

1. Push this code to a GitHub repository
2. On [Render](https://render.com), create a new **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `SLACK_BOT_TOKEN` — your bot token (xoxb-)
     - `SLACK_APP_TOKEN` — your app-level token (xapp-)
     - `PORT` is set automatically by Render
5. No Slack Request URL configuration needed (Socket Mode connects outbound)

> **Note on persistence:** Render's free tier uses ephemeral disk. The SQLite database resets on each deploy. For persistent storage, use a Render Disk (paid) or switch to PostgreSQL.

## How It Works

```
App connects to Slack via WebSocket (Socket Mode)
  -> Receives message events
  -> Message listener:
     1. Ignore bot messages and edits
     2. Check message for sick phrases (headache, fever, etc.)
     3. Check 24-hour cooldown (max 1 reply per user per day)
     4. Log event to database
     5. Reply in thread with Loop Health consultation link
```

## Trigger Phrases

The bot responds to messages containing any of these phrases (case-insensitive):

- headache
- migraine
- fever
- not feeling well
- sick today
- taking sick leave
- out sick
- body ache
- not well today
- feeling sick

## Testing

Send any of these messages in a channel the bot has been invited to:

| Message | Should trigger? |
|---------|----------------|
| "I have a headache today" | Yes |
| "Taking sick leave tomorrow" | Yes |
| "Not feeling well, going to rest" | Yes |
| "The project is sick!" | Yes (contains "sick") |
| "I'll be in the office at 10" | No |
| Same user sends "fever" again within 24h | No (cooldown) |

## Project Structure

```
src/
  server.js          — Entrypoint: DB init, Socket Mode start, graceful shutdown
  slackApp.js        — Bolt app with Socket Mode, message listener
  phraseDetector.js  — Sick phrase matching
  database.js        — SQLite schema and queries
  config.js          — Environment variables and constants
```
