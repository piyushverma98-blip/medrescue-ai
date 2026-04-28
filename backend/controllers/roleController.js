const db = require('../db');

exports.getUsers = async (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role FROM users').all();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // 'user', 'staff', 'admin'
  const allowedRoles = ['user', 'staff', 'admin'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role' });
  }

  try {
    // Check permissions
    if (req.user.role === 'admin' && role === 'admin') {
      return res.status(403).json({ msg: 'Admins cannot create other admins' });
    }

    const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
    if (!targetUser) return res.status(404).json({ msg: 'User not found' });
    
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ msg: 'Cannot change superadmin role' });
    }

    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    stmt.run(role, id);
    res.json({ msg: `User role updated to ${role}` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
