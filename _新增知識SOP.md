# 新增知識主題 SOP（操作手冊）

> 給未來的 Ivan／AI 看的：要在知識庫加一個新主題時，照這份做就好，不用回翻舊對話。
> 知識庫架構：n8n bot（LINE＋TG）會去讀 GitHub 的 `hegrn-kb` repo，依 catalog.md 找到對應主題檔回答。

---

## 🟢 標準流程（5 步）

**1️⃣ 做知識檔（.md）**
• 檔名一律用**英文**（中文檔名 GitHub raw 會 404，這是最貴的一課）。例：`pricing.md`、`vfp.md`。
• 內容格式照 `_格式規範.md`：🚫 不用表格、😀 適時加 emoji、📏 短句短段、用 `---` 分段、白話優先。
• 開頭可埋一句「回答請用條列＋emoji，不要用表格」提示 bot。

**2️⃣ 上傳到 hegrn-kb repo**
github.com/ham15154321-oss/hegrn-kb → Add file → Upload files → 拖檔 → Commit directly to main。

**3️⃣ 在 catalog.md 加一行**
進 repo → 點 `catalog.md` → 鉛筆 ✏️ 編輯 → 最後加一行，格式：
```
主題名|關鍵字1,關鍵字2,關鍵字3…|https://raw.githubusercontent.com/ham15154321-oss/hegrn-kb/main/檔名.md
```
• 網址一定要是 `hegrn-kb`（不是舊的 appluad）。
• 關鍵字多放幾個常見問法，A 路靠它挑檔。
• Commit directly to main。

**4️⃣ 等快取 2～5 分鐘 → 測 A 路**
LINE 或 TG 打「知識 〔主題相關問句〕」→ 答得出新內容就成功。
（raw 改檔後有幾分鐘快取，剛改別急著測。）

**5️⃣（選配）讓「不打前綴」也命中 → 接 B 路**
要讓使用者不打「知識」也能自動答這個主題，請擴充把該主題關鍵字加進 **LINE＋TG 兩支** 的 CEO 派工器（`Basic LLM Chain1`）system prompt 裡的【派工目標：知識】區塊，新增一行：
```
- 主題名：關鍵字、關鍵字、關鍵字…
```
改完兩支各自 UI 點「Publish / 發佈」。不接 B 路也沒關係，打「知識」前綴永遠通。

---

## 🧭 兩條路的差別（理解用）

🅰️ **A 路**：打「知識 …」前綴 → 精準直達知識庫。加新檔＋catalog 後就自動可用。
🅱️ **B 路**：不打前綴、直接問 → CEO 派工器判斷後自動導進知識庫。需要第 5 步把關鍵字加進 CEO。

挑檔比對現在會同時吃「使用者自然句＋CEO 萃取的主題詞」，所以自然句命中率高。

---

## ⚠️ 踩過的雷（別再犯）

🚫 **中文檔名** → raw 間歇 404。一律英文檔名。
🔀 **catalog 漂移** → 舊 appluad repo 的網址會回來鬧。新版 catalog 的 7 行網址都要是 `hegrn-kb`；用「網頁編輯貼上」比「重新上傳覆蓋」穩（避免拖到舊資料夾的同名檔）。
⏳ **快取** → raw 改檔後等 2～5 分鐘再測，不是壞掉。
💣 **壞 fallback URL** → 挑檔沒命中時會 fallback；fallback URL 已修成 hegrn-kb 的 catalog.md（200），別再改回 applaod。
⌨️ **n8n 改 code 時 CodeMirror 會自動補多餘的 `}` 或雜散字元** → 擴充存檔前要檢查、清掉，否則 Execute 報語法錯。
🔑 **n8n session 會過期（401）** → 擴充存不了檔時先重新登入 n8n，不要硬存。
📤 **改完一定要按 Publish／發佈**（n8n 有草稿 vs 已發佈分離，光存草稿不生效）。

---

## 🗂️ 相關檔案

• `catalog.md` — 主題目錄，bot 從這裡找主題。
• `_格式規範.md` — 知識檔的排版規則。
• 各主題 .md — 實際內容（graphic-qa、consumer-journey、scheduling、team-leader、ai-mastery、pdr-deputy、vfp…）。

---

## 一句話

> 英文 .md 上傳 → catalog 加一行 → 等幾分鐘測。要免前綴就再請擴充把關鍵字加進兩支 CEO 派工器。
