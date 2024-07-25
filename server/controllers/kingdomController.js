const Kingdom = require('../models/Kingdom');

const getKingdom = async (req, res) => {
    try {
        const kingdom = await Kingdom.findById(req.params.id).populate('user');
        if (!kingdom) {
          return res.status(404).json({ msg: 'Kingdom not found' });
        }
        res.json(kingdom);
      } catch (err) {
        console.error('Error fetching kingdom:', err);
        res.status(500).json({ msg: 'Server error' });
      }
    };



module.exports = { getKingdom };
