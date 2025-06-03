// main.js
// 將原本 index.html 內的 JS 移至此檔案，並加強無障礙設計

let oilData = [];
let sortDesc = true;
let autoRefreshInterval = null;

function sortByDate() {
  oilData.sort((a, b) => {
    // 將民國年轉西元年排序
    const toAD = s => {
      const [y, m, d] = s.split('/').map(Number);
      return new Date(y + 1911, m - 1, d);
    };
    return sortDesc ? toAD(b.date) - toAD(a.date) : toAD(a.date) - toAD(b.date);
  });
}

function formatDate(dateStr, type) {
  // dateStr: 民國年格式 (e.g. 113/06/03)
  if (type === 'ad') {
    const [y, m, d] = dateStr.split('/').map(Number);
    return `${y + 1911}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  }
  return dateStr;
}

function renderTable() {
  const dateType = document.getElementById('dateType').value;
  const tbody = document.querySelector('#oilTable tbody');
  tbody.innerHTML = '';
  oilData.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="調價日期">${formatDate(row.date, dateType)}</td>
      <td data-label="92 無鉛汽油">${row.oil92} 元/公升</td>
      <td data-label="95 無鉛汽油">${row.oil95} 元/公升</td>
      <td data-label="98 無鉛汽油">${row.oil98} 元/公升</td>
      <td data-label="超級/高級柴油">${row.diesel} 元/公升</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('oilTable').style.display = oilData.length ? '' : 'none';
}

async function loadOilPrices() {
  document.getElementById('status').textContent = '載入中...';
  try {
    const res = await fetch('/api/oil-prices');
    oilData = await res.json();
    sortByDate();
    renderTable();
    document.getElementById('status').textContent = oilData.length ? '' : '查無資料';
    updateLastUpdateTime();
  } catch (e) {
    document.getElementById('status').textContent = '資料載入失敗';
  }
}

function updateLastUpdateTime() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('lastUpdate').textContent = `最後更新時間：${timeStr}`;
}

function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(loadOilPrices, 60000); // 每60秒自動刷新
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('dateHeader').onclick = function() {
    sortDesc = !sortDesc;
    document.getElementById('sortIcon').textContent = sortDesc ? '▼' : '▲';
    sortByDate();
    renderTable();
  };
  document.getElementById('dateHeader').onkeydown = function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this.click();
    }
  };
  document.getElementById('dateType').onchange = renderTable;
  loadOilPrices();
  startAutoRefresh();
});

