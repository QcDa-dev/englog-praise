document.addEventListener("DOMContentLoaded", async () => {
    // =========================================================
    // ↓↓ app.jsと同じ「GASのウェブアプリURL」を貼り付けてください
    // =========================================================
    const GAS_ENDPOINT = "https://script.google.com/macros/s/YOUR_GAS_WEB_APP_URL/exec";
    
    const container = document.getElementById("history-container");

    try {
        // GASへ履歴取得リクエスト(action: "getHistory")を送信
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "getHistory" })
        });

        const data = await response.json();

        if (data.success) {
            container.innerHTML = ""; // ローディングテキストを消去
            const logs = data.data;

            if (logs.length === 0) {
                container.innerHTML = "<p>まだ記録がありません。チャットから最初の記録を送信してみましょう！</p>";
                return;
            }

            // 履歴データをカード形式で生成
            logs.forEach(log => {
                // 日付のフォーマット整形 (例: 2025-10-25T15:00:00.000Z -> 2025/10/25)
                const dateObj = new Date(log.watchDate);
                const dateStr = !isNaN(dateObj) ? `${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()}` : log.watchDate;

                const card = document.createElement("div");
                card.classList.add("history-card");
                card.innerHTML = `
                    <div class="history-header">
                        <span class="history-title">${log.movieTitle} (${log.watchTime}分)</span>
                        <span class="history-date">視聴日: ${dateStr}</span>
                    </div>
                    <div class="history-body">
                        <strong>感想・気づき：</strong><br>
                        ${log.impression.replace(/\n/g, '<br>')}
                    </div>
                    <div class="history-ai">
                        <strong>AIコーチのフィードバック：</strong><br>
                        ${log.aiFeedback.replace(/\n/g, '<br>')}
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = `<p style="color:red;">エラー: ${data.error}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p style="color:red;">通信エラーが発生しました。画面をリロードしてください。</p>`;
        console.error(error);
    }
});
