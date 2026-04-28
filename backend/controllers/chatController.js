const db = require('../db');

exports.sendMessage = async (req, res) => {
  const { message, language = 'en' } = req.body;
  
  try {
    let mockResponse = '';
    const lowerMessage = message.toLowerCase();

    // Mock multi-language responses based on simple keyword detection
    if (lowerMessage.includes('help') || lowerMessage.includes('emergency')) {
      mockResponse = language === 'hi' ? 'कृपया शांत रहें, मदद रास्ते में है। (Please stay calm, help is on the way.)' : 'Emergency detected. Please stay calm, we are locating the nearest hospital.';
    } else if (lowerMessage.includes('hospital')) {
      mockResponse = language === 'fr' ? 'L\'hôpital le plus proche est à 2 km. (The nearest hospital is 2km away.)' : 'The nearest hospital is 2km away. Route has been shared.';
    } else {
      mockResponse = 'I am the MedRescue AI assistant. How can I help you? (Say "Emergency" to trigger SOS)';
    }

    const stmt = db.prepare('INSERT INTO chat_logs (user_id, message, response, language) VALUES (?, ?, ?, ?)');
    stmt.run(req.user.id, message, mockResponse, language);

    res.json({ reply: mockResponse });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM chat_logs WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
