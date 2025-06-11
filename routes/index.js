var express = require('express');
var router = express.Router();
const { refreshOilPrices, db } = require('../oilPriceCrawler');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 取得油價資料 API
router.get('/api/oil-prices', function(req, res) {
  db.all('SELECT * FROM prices ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT MAX(date) AS lastUpdateTime FROM prices', [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ prices: rows, lastUpdateTime: row.lastUpdateTime });
    });
  });
});

// 手動刷新油價 API
router.post('/api/oil-prices/refresh', async function(req, res) {
  try {
    await refreshOilPrices();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
