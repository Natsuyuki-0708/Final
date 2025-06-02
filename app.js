var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const db = require('./db');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 查詢 oil_price table 所有資料，支援排序
app.get('/api/prices', (req, res) => {
    let order = req.query.order === 'asc' ? 'ASC' : 'DESC';
    let sql = 'SELECT * FROM oil_price';
    const params = [];
    if (req.query.product_name) {
        sql += ' WHERE product_name = ?';
        params.push(req.query.product_name);
    }
    sql += ` ORDER BY adjust_date ${order}, id ${order}`;
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 查詢 oil_price table 某 product_name 的所有資料
app.get('/api', (req, res) => {
    const product_name = req.query.product_name;
    if (!product_name) return res.status(400).json({ error: '缺少 product_name 參數' });
    db.all('SELECT * FROM oil_price WHERE product_name = ?', [product_name], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST 查詢 oil_price table 某 product_name 的所有資料
app.post('/api', (req, res) => {
    const product_name = req.body.product_name;
    if (!product_name) return res.status(400).json({ error: '缺少 product_name 參數' });
    db.all('SELECT * FROM oil_price WHERE product_name = ?', [product_name], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 新增油價資料
app.post('/api/oil/add', (req, res) => {
    const { adjust_date, product_name, price } = req.body;
    if (!adjust_date || !product_name || !price) {
        return res.status(400).send('缺少必要欄位');
    }
    db.run('INSERT INTO oil_price (adjust_date, product_name, price) VALUES (?, ?, ?)', [adjust_date, product_name, price], function(err) {
        if (err) return res.status(500).send('新增失敗: ' + err.message);
        res.send('新增成功');
    });
});

module.exports = app;
