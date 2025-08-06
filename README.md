# 🀄 天九牌出牌分析工具 - 網頁版

專業的天九牌出牌組合分析工具，提供精確的期望值計算和最佳策略建議。

## ✨ 功能特色

- 🎯 **精確分析** - 基於數學期望值的最佳組合建議
- 🚀 **高效計算** - 平均分析時間 < 100ms
- 📱 **響應式設計** - 完美支援手機、平板、電腦
- 🎮 **完整遊戲模式** - 支援上下半場完整流程
- 📊 **詳細數據** - 顯示勝率、期望值等關鍵指標
- 🌐 **純前端** - 無需伺服器，可部署到 GitHub Pages

## 🚀 快速開始

### 方法一：本地測試
```bash
# 1. 進入 web 目錄
cd web

# 2. 啟動本地伺服器
python3 serve.py

# 3. 瀏覽器會自動打開 http://localhost:8000
```

### 方法二：直接開啟檔案
```bash
# 直接用瀏覽器打開 index.html（部分功能可能受限）
open index.html
```

## 📁 檔案結構

```
web/
├── index.html              # 主頁面
├── styles/
│   └── main.css           # 主要樣式表
├── scripts/
│   ├── tien-gow.js        # 核心分析引擎
│   └── ui.js              # 用戶界面邏輯
├── data/
│   └── rankings.json      # 牌型分數表
├── serve.py               # 本地測試伺服器
├── test-website.js        # 功能測試腳本
└── README.md              # 說明文件
```

## 🎯 使用說明

### 基本操作
1. **選擇手牌** - 點擊牌型選擇4張手牌（每種牌最多2張）
2. **分析組合** - 點擊「分析最佳組合」獲得建議
3. **查看結果** - 系統顯示所有可能組合及其期望值

### 天九牌規則
- 每種牌型有2張，總共32張牌
- 手牌需分成「前對」和「後對」
- 後對分數必須 ≥ 前對分數
- 勝負判定：
  - 前後對都贏 或 一平一贏 = 獲勝
  - 前後對都輸 或 一平一輸 = 失敗
  - 其他情況 = 平手

### 數據說明
- **勝率**：該牌對擊敗莊家對應牌對的機率
- **期望值**：考慮所有可能情況的綜合評分
- **正值**：有利組合，數值越高越好
- **負值**：不利組合，應避免使用

## 🧪 測試功能

```bash
# 執行功能測試
node test-website.js

# 預期輸出：所有測試項目都顯示 ✅
```

## 🌐 部署到 GitHub Pages

### 步驟一：建立 GitHub 倉庫
```bash
# 1. 在 GitHub 建立新倉庫（例如：tien-gow-analyzer）
# 2. 克隆到本地
git clone https://github.com/yourusername/tien-gow-analyzer.git
cd tien-gow-analyzer

# 3. 複製 web 目錄內容到倉庫根目錄
cp -r /path/to/web/* .

# 4. 提交並推送
git add .
git commit -m "初始版本：天九牌分析工具"
git push origin main
```

### 步驟二：啟用 GitHub Pages
1. 進入倉庫設置 (Settings)
2. 找到 Pages 選項
3. Source 選擇 "Deploy from a branch"
4. Branch 選擇 "main"，資料夾選擇 "/ (root)"
5. 點擊 Save

### 步驟三：訪問網站
- 網址：`https://yourusername.github.io/tien-gow-analyzer`
- 通常需要幾分鐘才能生效

## 📊 技術規格

### 核心技術
- **JavaScript** - 純前端實現，無需後端
- **CSS3** - 現代化響應式設計
- **HTML5** - 語義化結構

### 性能指標
- **分析速度** - 平均 < 100ms
- **記憶體使用** - < 10MB
- **快取命中率** - > 95%
- **計算準確度** - 100% 一致性

### 瀏覽器支援
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ 移動版瀏覽器

## 🔧 自定義修改

### 修改牌型分數
編輯 `data/rankings.json` 檔案：
```json
{
  "天": {
    "天": 68,
    "地": 23,
    ...
  }
}
```

### 修改界面樣式
編輯 `styles/main.css` 檔案，支援：
- 顏色主題修改
- 響應式斷點調整
- 動畫效果自定義

### 擴展功能
在 `scripts/ui.js` 中添加新功能：
- 遊戲記錄保存
- 統計圖表顯示
- 多人對戰模式

## 🐛 問題排解

### 常見問題
1. **載入分析引擎失敗**
   - 確保 `data/rankings.json` 檔案存在
   - 檢查瀏覽器控制台錯誤訊息

2. **計算結果不正確**
   - 檢查手牌選擇是否正確
   - 驗證牌型分數表是否完整

3. **界面顯示異常**
   - 清除瀏覽器快取
   - 檢查 CSS 檔案是否載入

### 調試方法
```javascript
// 在瀏覽器控制台中測試
const analyzer = window.tienGowUI.analyzer;
const result = analyzer.analyzeHand(['天', '地', '人', '和']);
console.log(result);
```

## 📝 更新日誌

### v1.0.0 (2024-01-XX)
- ✨ 首次發布
- 🎯 完整的分析功能
- 📱 響應式設計
- 🚀 高性能計算

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 開發環境設置
1. Fork 倉庫
2. 建立功能分支
3. 進行修改並測試
4. 提交 Pull Request

## 📄 授權

MIT License - 詳見 LICENSE 檔案

## 🙏 致謝

感謝所有對天九牌文化傳承和數學建模做出貢獻的朋友們！

---

🀄 **天九牌出牌分析工具** - 讓策略更精準，讓遊戲更有趣！