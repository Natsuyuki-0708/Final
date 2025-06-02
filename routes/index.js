var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 刪除油價資料
router.delete('/api/oil/:id', function(req, res) {
  const id = req.params.id;
  db.run('DELETE FROM oil_price WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).send('刪除失敗: ' + err.message);
    } else if (this.changes === 0) {
      res.status(404).send('找不到該筆資料');
    } else {
      res.send('刪除成功');
    }
  });
});

module.exports = router;
