const config = require('./config');

function detectSickPhrase(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const lowerText = text.toLowerCase();

  // Check if any ignore phrase is present — if so, skip entirely
  for (const ignore of config.ignorePhrases) {
    if (lowerText.includes(ignore)) {
      return null;
    }
  }

  // Check for sick phrase match
  for (const phrase of config.sickPhrases) {
    if (lowerText.includes(phrase)) {
      return phrase;
    }
  }

  return null;
}

module.exports = { detectSickPhrase };
