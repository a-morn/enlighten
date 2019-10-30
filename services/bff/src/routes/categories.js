const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const categories = [
    { id: 'periodic-table', label: 'Periodic table' },
    { id: 'game-of-thrones', label: 'Game of Thrones' }
  ];

  res.send(categories);
});

module.exports = router;
