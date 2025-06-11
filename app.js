var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 定時任務：每天凌晨 0 點自動刷新油價
const cron = require('node-cron');
const { refreshOilPrices } = require('./oilPriceCrawler');
cron.schedule('0 0 * * *', async () => {
  try {
    await refreshOilPrices();
    console.log('定時自動刷新油價成功');
  } catch (e) {
    console.error('定時刷新油價失敗:', e.message);
  }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
