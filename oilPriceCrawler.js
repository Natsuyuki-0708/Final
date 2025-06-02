const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./oil_price.db');
const puppeteer = require('puppeteer');

// 建立資料表
function initDB() {
  db.run(`CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    oil92 TEXT,
    oil95 TEXT,
    oil98 TEXT,
    diesel TEXT
  )`);
}

// 使用 puppeteer 爬取油價資料
async function fetchCPCPrices() {
  const url = 'https://www.cpc.com.tw/historyprice.aspx?n=2890&utm_source=chatgpt.com';
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  // 等待表格出現
  await page.waitForSelector('#tbHistoryPrice tbody tr', { timeout: 10000 });
  const prices = await page.$$eval('#tbHistoryPrice tbody tr', rows => {
    return rows.map(row => {
      const tds = Array.from(row.querySelectorAll('td'));
      if (tds.length >= 5) {
        return {
          date: tds[0].innerText.trim(),
          oil92: tds[1].innerText.trim(),
          oil95: tds[2].innerText.trim(),
          oil98: tds[3].innerText.trim(),
          diesel: tds[4].innerText.trim(),
        };
      }
      return null;
    }).filter(Boolean);
  });
  await browser.close();
  if (prices.length === 0) {
    console.warn('警告：未抓取到任何油價資料，請檢查網頁結構或防爬蟲機制。');
  }
  return prices;
}

// 將油價資料存入資料庫
async function savePricesToDB(prices) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO prices (date, oil92, oil95, oil98, diesel) VALUES (?, ?, ?, ?, ?)');
    prices.forEach(p => {
      stmt.run([p.date, p.oil92, p.oil95, p.oil98, p.diesel]);
    });
    stmt.finalize(err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// 主流程
async function refreshOilPrices() {
  initDB();
  const prices = await fetchCPCPrices();
  await savePricesToDB(prices);
  console.log('油價資料已更新');
}

// 若直接執行此檔案則刷新油價
if (require.main === module) {
  refreshOilPrices();
}

module.exports = { initDB, refreshOilPrices, db };

