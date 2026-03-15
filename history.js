document.addEventListener("DOMContentLoaded", async () => {
    // =========================================================
    // ↓↓ GASのウェブアプリURLを貼り付けてください
    // =========================================================
    const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzyJfvO-WFlQC-30inNmGr--vKxBMgT5fKIFw2KegGx7-febALgbA0H_u3bOQ0snDXT/exec";
    
    const container = document.getElementById("history-container");

    // 履歴を読み込む関数
    async function loadHistory() {
        container.innerHTML = '<div class="loading-text">データを読み込んでいます...</div>';
        try {
            const response = await fetch(GAS_ENDPOINT, {
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: "getHistory" })
            });

            const data = await response.json();

            if (data.success) {
                container.innerHTML = ""; 
                const logs = data.data;

                if (logs.length === 0) {
                    container.innerHTML = "<p>まだ記録がありません。チャットから最初の記録を送信してみましょう！</p>";
                    return;
                }

                // 履歴データをカード形式で生成
                logs.forEach(log => {
                    const card = createHistoryCard(log);
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = `<p style="color:red;">エラー: ${data.error}</p>`;
            }
        } catch (error) {
            container.innerHTML = `<p style="color:red;">通信エラーが発生しました。画面をリロードしてください。</p>`;
            console.error(error);
        }
    }

    // 履歴カード(ブロック)を生成する関数
    function createHistoryCard(log) {
        // 日付のフォーマット整形
        const dateObj = new Date(log.watchDate);
        const dateStr = !isNaN(dateObj) ? `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}` : log.watchDate;

        const card = document.createElement("div");
        card.classList.add("history-card");
        
        // --- 閲覧モードのHTML ---
        const viewHtml = `
            <div class="history-view">
                <div class="history-header">
                    <span class="history-title">
                        <span class="v-title">${log.movieTitle}</span> 
                        (<span class="v-time">${log.watchTime}</span>分)
                    </span>
                    <div>
                        <span class="history-date">視聴日: <span class="v-date">${dateStr}</span></span>
                        <button class="edit-btn" style="margin-left: 10px;">編集</button>
                    </div>
                </div>
                <div class="history-body">
                    <strong>感想・気づき：</strong><br>
                    <span class="v-impression">${log.impression.replace(/\n/g, '<br>')}</span>
                </div>
                <div class="history-ai">
                    <div style="margin-bottom: 5px;"><strong>ピックアップフレーズ:</strong> <span class="v-phrase">${log.phrase}</span></div>
                    <div style="margin-bottom: 5px;"><strong>ビジネス変換:</strong> <span class="v-business">${log.business}</span></div>
                    <div><strong>TOEICポイント:</strong> <span class="v-toeic">${log.toeic}</span></div>
                </div>
            </div>
        `;

        // --- 編集モードのHTML ---
        const editHtml = `
            <div class="history-edit-form">
                <div class="edit-group">
                    <label>視聴日</label>
                    <input type="date" class="e-date" value="${dateStr}">
                </div>
                <div style="display: flex; gap: 10px;">
                    <div class="edit-group" style="flex: 2;">
                        <label>作品名</label>
                        <input type="text" class="e-title" value="${log.movieTitle}">
                    </div>
                    <div class="edit-group" style="flex: 1;">
                        <label>時間(分)</label>
                        <input type="number" class="e-time" value="${log.watchTime}">
                    </div>
                </div>
                <div class="edit-group">
                    <label>感想・気づき</label>
                    <textarea class="e-impression">${log.impression}</textarea>
                </div>
                <div class="edit-group">
                    <label>ピックアップフレーズ</label>
                    <input type="text" class="e-phrase" value="${log.phrase}">
                </div>
                <div class="edit-group">
                    <label>ビジネス変換</label>
                    <textarea class="e-business" style="height: 40px;">${log.business}</textarea>
                </div>
                <div class="edit-group">
                    <label>TOEICポイント</label>
                    <textarea class="e-toeic" style="height: 40px;">${log.toeic}</textarea>
                </div>
                <div class="edit-actions">
                    <button class="cancel-btn">キャンセル</button>
                    <button class="save-btn">保存</button>
                </div>
            </div>
            <div class="saving-overlay">保存中...</div>
        `;

        card.innerHTML = viewHtml + editHtml;

        // イベントリスナーの登録
        const viewMode = card.querySelector('.history-view');
        const editMode = card.querySelector('.history-edit-form');
        const overlay = card.querySelector('.saving-overlay');
        const rowIndex = log.rowIndex; // GASに送るための行番号

        // 「編集」ボタン
        card.querySelector('.edit-btn').addEventListener('click', () => {
            viewMode.classList.add('hidden');
            editMode.classList.add('active');
        });

        // 「キャンセル」ボタン
        card.querySelector('.cancel-btn').addEventListener('click', () => {
            editMode.classList.remove('active');
            viewMode.classList.remove('hidden');
            // 値をリセットしたい場合はここで実施
        });

        // 「保存」ボタン
        card.querySelector('.save-btn').addEventListener('click', async () => {
            // 入力値の取得
            const updatedData = {
                action: "updateHistory",
                rowIndex: rowIndex,
                watchDate: card.querySelector('.e-date').value,
                movieTitle: card.querySelector('.e-title').value,
                watchTime: card.querySelector('.e-time').value,
                impression: card.querySelector('.e-impression').value,
                phrase: card.querySelector('.e-phrase').value,
                business: card.querySelector('.e-business').value,
                toeic: card.querySelector('.e-toeic').value
            };

            overlay.classList.add('active'); // 保存中UI表示

            try {
                // GASへ更新リクエスト
                const res = await fetch(GAS_ENDPOINT, {
                    method: 'POST',
                    mode: 'cors',
                    redirect: 'follow',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(updatedData)
                });
                
                const result = await res.json();
                
                if (result.success) {
                    // 表示(閲覧モード)のテキストを更新した内容で書き換える
                    card.querySelector('.v-date').textContent = updatedData.watchDate;
                    card.querySelector('.v-title').textContent = updatedData.movieTitle;
                    card.querySelector('.v-time').textContent = updatedData.watchTime;
                    card.querySelector('.v-impression').innerHTML = updatedData.impression.replace(/\n/g, '<br>');
                    card.querySelector('.v-phrase').textContent = updatedData.phrase;
                    card.querySelector('.v-business').textContent = updatedData.business;
                    card.querySelector('.v-toeic').textContent = updatedData.toeic;

                    // モードを戻す
                    editMode.classList.remove('active');
                    viewMode.classList.remove('hidden');
                } else {
                    alert('保存に失敗しました: ' + result.error);
                }
            } catch (err) {
                alert('通信エラーが発生しました。');
            } finally {
                overlay.classList.remove('active');
            }
        });

        return card;
    }

    // 初回読み込みの実行
    loadHistory();
});
