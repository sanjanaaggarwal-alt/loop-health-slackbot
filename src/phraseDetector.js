const config = require('./config');

function detectSickPhrase(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const lowerText = text.toLowerCase();

  for (const phrase of config.sickPhrases) {
    if (lowerText.includes(phrase)) {
      return phrase;
    }
  }

  return null;
}

module.exports = { detectSickPhrase };
