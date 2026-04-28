const db = require('../db');

exports.createEmergency = async (req, res) => {
  const { type, latitude, longitude } = req.body;
  
  try {
    const stmt = db.prepare('INSERT INTO emergencies (user_id, type, latitude, longitude) VALUES (?, ?, ?, ?)');
    const info = stmt.run(req.user.id, type, latitude, longitude);

    res.json({ msg: 'Emergency alert sent successfully', emergency_id: info.lastInsertRowid });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getActiveEmergencies = async (req, res) => {
  try {
    const emergencies = db.prepare(`
      SELECT emergencies.*, users.name, users.email 
      FROM emergencies 
      JOIN users ON emergencies.user_id = users.id 
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `).all();
    res.json(emergencies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const stmt = db.prepare('UPDATE emergencies SET status = ? WHERE id = ?');
    stmt.run('resolved', req.params.id);
    res.json({ msg: 'Emergency resolved' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
