const { App } = require('@slack/bolt');
const config = require('./config');
const { detectSickPhrase } = require('./phraseDetector');
const { canReply, recordTrigger, logSickEvent } = require('./database');

const app = new App({
  token: config.slack.botToken,
  appToken: config.slack.appToken,
  socketMode: true,
});

// Message listener
app.message(async ({ message, say, logger }) => {
  try {
    // Ignore bot messages, message edits, and other subtypes
    if (message.subtype || message.bot_id) {
      return;
    }

    // Guard against messages without a user (e.g. Slack Connect edge cases)
    if (!message.user) {
      return;
    }

    // Check for sick phrase
    const matchedPhrase = detectSickPhrase(message.text);
    if (!matchedPhrase) {
      return;
    }

    // Anti-spam: max 1 reply per user per 24 hours
    if (!canReply(message.user)) {
      logger.info(`Skipping reply to user ${message.user} - cooldown active`);
      return;
    }

    // Log the sick event for analytics
    logSickEvent({
      userId: message.user,
      channelId: message.channel,
      messageText: message.text,
      triggeredPhrase: matchedPhrase,
    });

    // Record trigger for anti-spam
    recordTrigger(message.user);

    // Reply in thread to the original message
    await say({
      text: config.replyMessage,
      thread_ts: message.thread_ts || message.ts,
    });

    logger.info(
      `Replied to user ${message.user} in channel ${message.channel} for phrase "${matchedPhrase}"`
    );
  } catch (error) {
    logger.error(`Error handling message: ${error.message}`);
  }
});

module.exports = { app };
