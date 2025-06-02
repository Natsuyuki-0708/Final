const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, 'db');
const dbPath = path.join(dbDir, 'sqlite.db');

// 確保 db 目錄存在
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

// 檢查資料庫檔案是否存在
const dbExists = fs.existsSync(dbPath);

// 開啟資料庫
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('無法開啟資料庫:', err.message);
    } else {
        console.log('成功開啟資料庫');
        // 若 oil_price table 不存在則建立
        db.run(`CREATE TABLE IF NOT EXISTS oil_price (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            adjust_date DATE NOT NULL,
            product_name TEXT NOT NULL,
            price REAL NOT NULL
        );`, (err) => {
            if (err) {
                console.error('建立 oil_price table 失敗:', err.message);
            } else {
                console.log('oil_price table 已確認存在');
            }
        });
    }
});

module.exports = db;

