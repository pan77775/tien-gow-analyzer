# 🚀 部署到 GitHub Pages 指南

## 📋 部署前檢查清單

在部署之前，請確保：

- ✅ 所有測試都通過 (`node test-website.js`)
- ✅ 本地測試正常 (`python3 serve.py`)
- ✅ 響應式設計在手機上正常顯示
- ✅ 有 GitHub 帳號

## 🌐 Step 1: 建立 GitHub 倉庫

### 方法一：通過 GitHub 網站
1. 登入 [GitHub](https://github.com)
2. 點擊右上角的 "+" → "New repository"
3. 設定倉庫資訊：
   - **Repository name**: `tien-gow-analyzer` (或你喜歡的名稱)
   - **Description**: `天九牌出牌分析工具 - 基於數學期望值的最佳策略建議`
   - **Visibility**: Public (免費版只能用 Public)
   - ✅ 勾選 "Add a README file"
4. 點擊 "Create repository"

### 方法二：通過 Git 命令行
```bash
# 在本地初始化 Git 倉庫
cd /Users/pandayu/projects/tien_gow/web
git init

# 添加所有檔案
git add .
git commit -m "初始版本：天九牌分析工具"

# 連接到 GitHub（請替換 yourusername）
git branch -M main
git remote add origin https://github.com/yourusername/tien-gow-analyzer.git
git push -u origin main
```

## 📤 Step 2: 上傳網站檔案

### 如果已經建立了倉庫：
```bash
# 克隆倉庫到本地
git clone https://github.com/yourusername/tien-gow-analyzer.git
cd tien-gow-analyzer

# 複製網站檔案到倉庫目錄
# 注意：我們只需要核心檔案，不需要測試檔案
cp /Users/pandayu/projects/tien_gow/web/index.html .
cp -r /Users/pandayu/projects/tien_gow/web/styles .
cp -r /Users/pandayu/projects/tien_gow/web/scripts .
cp -r /Users/pandayu/projects/tien_gow/web/data .
cp /Users/pandayu/projects/tien_gow/web/README.md .

# 提交並推送
git add .
git commit -m "新增天九牌分析工具核心檔案"
git push origin main
```

## ⚙️ Step 3: 啟用 GitHub Pages

1. 進入你的 GitHub 倉庫頁面
2. 點擊 "Settings" 標籤
3. 在左側選單中找到 "Pages"
4. 在 "Source" 設定中：
   - 選擇 "Deploy from a branch"
   - Branch: 選擇 "main"
   - Folder: 選擇 "/ (root)"
5. 點擊 "Save"

## 🎉 Step 4: 訪問你的網站

- 網站將在 5-10 分鐘內生效
- 網址格式：`https://yourusername.github.io/tien-gow-analyzer`
- GitHub 會在 Pages 設定頁面顯示網站網址

## 🔧 Step 5: 自定義設定（可選）

### 自定義域名
如果你有自己的域名：
1. 在 DNS 設定中添加 CNAME 記錄指向 `yourusername.github.io`
2. 在 Pages 設定中的 "Custom domain" 填入你的域名
3. 勾選 "Enforce HTTPS"

### 更新網站
每次修改後，只需要：
```bash
git add .
git commit -m "更新描述"
git push origin main
```

## 📋 建議的檔案結構

你的最終倉庫應該包含：

```
tien-gow-analyzer/
├── index.html              # 主頁面
├── README.md               # 專案說明
├── styles/
│   └── main.css           # 樣式表
├── scripts/
│   ├── tien-gow.js        # 分析引擎
│   └── ui.js              # 界面邏輯
└── data/
    └── rankings.json      # 分數表
```

## 🎯 SEO 優化建議

### 更新 index.html 的 meta 標籤：
```html
<meta name="description" content="專業的天九牌出牌組合分析工具，提供精確的期望值計算和最佳策略建議">
<meta name="keywords" content="天九牌,出牌分析,期望值,策略,遊戲工具">
<meta property="og:title" content="天九牌出牌分析工具">
<meta property="og:description" content="基於數學期望值的天九牌最佳策略建議工具">
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourusername.github.io/tien-gow-analyzer">
```

## 🔍 測試部署

部署完成後，請測試：

1. **功能測試**
   - ✅ 牌型選擇正常
   - ✅ 分析計算正確
   - ✅ 結果顯示完整

2. **性能測試**
   - ✅ 載入速度 < 3秒
   - ✅ 分析速度 < 1秒
   - ✅ 手機端響應正常

3. **兼容性測試**
   - ✅ Chrome/Firefox/Safari 都正常
   - ✅ 手機版正常顯示
   - ✅ 平板版正常顯示

## 🐛 常見問題

### Q: 網站顯示 404 錯誤
**A:** 
- 確保 `index.html` 在倉庫根目錄
- 等待 5-10 分鐘讓 Pages 生效
- 檢查 Pages 設定是否正確

### Q: JavaScript 功能不正常
**A:**
- 檢查瀏覽器控制台是否有錯誤
- 確保所有 `.js` 和 `.json` 檔案都已上傳
- 檢查檔案路徑是否正確

### Q: 手機版顯示異常
**A:**
- 檢查 CSS 媒體查詢是否正確
- 確保 viewport meta 標籤存在
- 測試不同手機瀏覽器

### Q: 如何更新網站
**A:**
```bash
# 修改檔案後
git add .
git commit -m "修復某個問題"
git push origin main
# 等待 1-2 分鐘自動部署
```

## 📊 推廣建議

網站部署成功後，你可以：

1. **分享給朋友** - 直接分享網址
2. **社群媒體** - 發布到相關遊戲社群
3. **改進功能** - 根據使用者回饋持續優化
4. **收集資料** - 添加簡單的使用統計

## 🎉 恭喜！

你的天九牌分析工具已經成功部署到網際網路上了！

網址格式：`https://yourusername.github.io/tien-gow-analyzer`

現在全世界的人都可以使用你的工具來分析天九牌的最佳策略了！ 🌍🀄