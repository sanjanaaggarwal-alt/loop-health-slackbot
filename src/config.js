require('dotenv').config();
const path = require('path');

// Validate required environment variables
const required = ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const slack = {
  botToken: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
};

const port = parseInt(process.env.PORT, 10) || 3000;

const dbPath = path.join(__dirname, '..', 'data', 'slackbot.db');

const sickPhrases = [
  'headache',
  'migraine',
  'fever',
  'not feeling well',
  'sick today',
  'taking sick leave',
  'out sick',
  'body ache',
  'not well today',
  'feeling sick',
];

const replyMessage =
  'Hope you feel better \u{1F49B} Your company provides free doctor consultations through Loop. ' +
  "If you'd like to speak to a doctor today, you can book one here: " +
  'https://app.loophealth.com/?source=slackbot';

const cooldownHours = 24;

module.exports = {
  slack,
  port,
  dbPath,
  sickPhrases,
  replyMessage,
  cooldownHours,
};
