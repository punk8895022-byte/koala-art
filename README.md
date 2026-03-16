# Koala Art Studio Finance V16.0

這是一個專為藝術工作室設計的高精度財務與 CRM 系統，具備營收校準、學生去重以及基於 Google Gemini AI 的經營洞察功能。

## 本地開發指南

### 1. 前置準備
確保你的電腦已安裝 [Node.js](https://nodejs.org/) (建議使用 LTS 版本)。

### 2. 安裝步驟
在專案根目錄開啟終端機，執行以下指令：

```bash
# 安裝所有必要的套件
npm install
```

### 3. 設定環境變數
這個專案使用 Google Gemini AI 進行數據分析。

1. 複製 `.env.example` 並重新命名為 `.env`：
   ```bash
   cp .env.example .env
   ```
2. 開啟 `.env` 檔案，將 `GEMINI_API_KEY` 替換為你的 API Key。
   * 你可以從 [Google AI Studio](https://aistudio.google.com/app/apikey) 免費取得。

### 4. 啟動開發伺服器
執行以下指令啟動本地開發環境：

```bash
npm run dev
```

啟動後，在瀏覽器打開 `http://localhost:3000` 即可看到應用程式。

## 專案功能
*   **儀表板 (Dashboard)**: 即時查看營收、欠款、學生人數及營收趨勢。
*   **學生管理 (CRM)**: 追蹤學生修課紀錄、消費習慣，並自動計算回訪率。
*   **財務紀錄 (Transactions)**: 詳細記錄每一筆交易，支援篩選與編輯。
*   **課程設定 (Courses)**: 管理課程類別與定價。
*   **AI 經營洞察**: 利用 Gemini AI 分析經營數據，提供專業建議。
*   **Excel 匯出**: 支援將財務數據匯出為 Excel 報表。

## 技術棧
*   **Frontend**: React 19 + TypeScript + Tailwind CSS
*   **Animation**: Motion (Framer Motion)
*   **Icons**: Lucide React
*   **AI**: @google/genai (Gemini 3 Flash)
*   **Data Export**: xlsx
*   **Build Tool**: Vite

## 注意事項
*   **資料儲存**: 目前資料儲存在瀏覽器的 `localStorage` 中。在本地開發時，清除瀏覽器快取會導致資料重置。
*   **API 限制**: 免費版的 Gemini API 有頻率限制，請避免過於頻繁地觸發 AI 分析功能。
