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
  'fever',
  'not feeling well',
  'sick',
  'sick leave',
  'unwell',
  'cold',
  'headache',
  'period leave',
  'sore throat',
  'throat pain',
  'cough',
  'body pain',
  'body ache',
  'food poisoning',
  'stomach infection',
  'injured',
  'doctor appointment',
  'down with fever',
  'having headache',
  'bad cold',
  'not feeling well today',
  'taking sick leave',
  'woke up with fever',
  'food poisoning today',
  'under the weather',
];

const ignorePhrases = [
  'planned leave',
  'travel',
  'flight',
  'errands',
  'logging off',
  'afk',
  'meeting',
  'personal work',
];

const channelReplyMessage =
  'Take care \u{1F49A} Your company provides free doctor consultations through Loop, sharing the details on message.';

const dmMessage =
  'Hey, hope you are feeling a bit better. Your company provides free doctor consultations through Loop - would you like to speak to a doctor today?\n\n' +
  'Book here: https://app.loophealth.com/?utm_source=slackbot&utm_medium=slack&utm_campaign=sick_leave_bot';

const cooldownHours = 24;

module.exports = {
  slack,
  port,
  dbPath,
  sickPhrases,
  ignorePhrases,
  channelReplyMessage,
  dmMessage,
  cooldownHours,
};
