document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('watchDate').valueAsDate = new Date();
});

// =========================================================
// ↓↓ GASでデプロイした「ウェブアプリのURL」をここに貼り付けてください
// =========================================================
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzyJfvO-WFlQC-30inNmGr--vKxBMgT5fKIFw2KegGx7-febALgbA0H_u3bOQ0snDXT/exec";

const form = document.getElementById('log-form');
const timeline = document.getElementById('chat-timeline');
const typingIndicator = document.getElementById('typing-indicator');
const submitBtn = document.getElementById('submit-btn');

// ==========================================
// フォーム開閉トグルの処理
// ==========================================
const toggleBtn = document.getElementById('form-toggle-btn');
const inputArea = document.getElementById('chat-input-area');
let isFormVisible = true;

if (toggleBtn && inputArea) {
    toggleBtn.addEventListener('click', () => {
        isFormVisible = !isFormVisible;
        if (isFormVisible) {
            inputArea.classList.remove('hidden');
            toggleBtn.textContent = '▼ 入力フォームを閉じる';
        } else {
            inputArea.classList.add('hidden');
            toggleBtn.textContent = '▲ 入力フォームを開く';
        }
    });
}

// ==========================================
// ローカルストレージによる24時間履歴保持
// ==========================================
const LOCAL_STORAGE_KEY = 'qcda_englog_local_chat';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24時間 (ミリ秒)

function loadLocalHistory() {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData);
            const now = Date.now();
            
            // 24時間以内かチェック
            if (now - parsedData.timestamp < EXPIRATION_TIME) {
                // 履歴が有効な場合、タイムラインを初期化して復元
                timeline.innerHTML = '';
                parsedData.messages.forEach(msg => {
                    appendMessage(msg.sender, msg.content, msg.timeStr, false); // false = 保存処理をスキップ
                });
                // タイピングインジケーターを戻す
                timeline.appendChild(typingIndicator);
                scrollToBottom();
                return;
            } else {
                // 24時間経過していたらクリア
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            }
        } catch (e) {
            console.error('ローカル履歴の読み込みに失敗しました', e);
        }
    }
    
    // データがない場合、または期限切れの場合は初期メッセージのみ
    timeline.innerHTML = `
        <div class="chat-message ai">
            <div class="message-content">
                こんにちは！今日の英語学習エンタメ記録を教えてください！どんな小さなことでも全力で褒めちぎります✨
            </div>
            <div class="message-time">System</div>
        </div>
    `;
    timeline.appendChild(typingIndicator);
}

function saveLocalHistory(sender, htmlContent, timeStr) {
    let currentData = { timestamp: Date.now(), messages: [] };
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (storedData) {
        try {
            currentData = JSON.parse(storedData);
            currentData.timestamp = Date.now(); // 最新のメッセージで期限を24時間延長
        } catch (e) {}
    }
    
    currentData.messages.push({ sender, content: htmlContent, timeStr });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentData));
}

// 初期ロード時の処理を実行
loadLocalHistory();

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const movieTitle = document.getElementById('movieTitle').value;
    const watchDate = document.getElementById('watchDate').value;
    const watchTime = document.getElementById('watchTime').value;
    const impression = document.getElementById('impression').value;

    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    // 1. ユーザーの入力をタイムラインに追加
    const userMessageContent = `
        <strong>${movieTitle}</strong> (${watchTime}分)<br>
        ${impression.replace(/\n/g, '<br>')}
    `;
    appendMessage('user', userMessageContent, timeStr);

    // フォームをリセットし、ローディング表示
    form.reset();
    document.getElementById('watchDate').valueAsDate = new Date();
    submitBtn.disabled = true;
    
    // typingIndicatorを一番下に移動して表示
    timeline.appendChild(typingIndicator);
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    try {
        // GASへデータ送信
        const response = await fetch(GAS_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                movieTitle: movieTitle,
                watchDate: watchDate,
                watchTime: watchTime,
                impression: impression
            })
        });

        const data = await response.json();
        
        typingIndicator.style.display = 'none';

        if (data.success) {
            const aiTimeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            // 2. AIからの返信をタイムラインに追加
            appendMessage('ai', data.aiResponse.replace(/\n/g, '<br>'), aiTimeStr);
        } else {
            appendMessage('ai', 'エラーが発生しました: ' + data.error, null, false);
        }
    } catch (error) {
        typingIndicator.style.display = 'none';
        appendMessage('ai', '通信エラーが発生しました。時間を置いて再度お試しください。', null, false);
    } finally {
        submitBtn.disabled = false;
    }
});

function appendMessage(sender, htmlContent, timeStr = null, save = true) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    
    if (!timeStr) {
        timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    msgDiv.innerHTML = `
        <div class="message-content">${htmlContent}</div>
        <div class="message-time">${timeStr}</div>
    `;
    
    // typingIndicatorの前に挿入する
    timeline.insertBefore(msgDiv, typingIndicator);
    scrollToBottom();

    if (save) {
        saveLocalHistory(sender, htmlContent, timeStr);
    }
}

function scrollToBottom() {
    timeline.scrollTop = timeline.scrollHeight;
}
