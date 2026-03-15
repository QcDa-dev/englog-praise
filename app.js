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

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const movieTitle = document.getElementById('movieTitle').value;
    const watchDate = document.getElementById('watchDate').value;
    const watchTime = document.getElementById('watchTime').value;
    const impression = document.getElementById('impression').value;

    // 1. ユーザーの入力をタイムラインに追加
    const userMessageContent = `
        <strong>${movieTitle}</strong> (${watchTime}分)<br>
        ${impression.replace(/\n/g, '<br>')}
    `;
    appendMessage('user', userMessageContent);

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
            // 2. AIからの返信をタイムラインに追加
            appendMessage('ai', data.aiResponse.replace(/\n/g, '<br>'));
        } else {
            appendMessage('ai', 'エラーが発生しました: ' + data.error);
        }
    } catch (error) {
        typingIndicator.style.display = 'none';
        appendMessage('ai', '通信エラーが発生しました。時間を置いて再度お試しください。');
    } finally {
        submitBtn.disabled = false;
    }
});

function appendMessage(sender, htmlContent) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-message', sender);
    
    const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    msgDiv.innerHTML = `
        <div class="message-content">${htmlContent}</div>
        <div class="message-time">${timeStr}</div>
    `;
    
    // typingIndicatorの前に挿入する
    timeline.insertBefore(msgDiv, typingIndicator);
    scrollToBottom();
}

function scrollToBottom() {
    timeline.scrollTop = timeline.scrollHeight;
}
