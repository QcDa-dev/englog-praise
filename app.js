document.addEventListener("DOMContentLoaded", () => {
    // 今日の日付をデフォルトセット
    document.getElementById('watchDate').valueAsDate = new Date();
});

document.getElementById('log-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const movieTitle = document.getElementById('movieTitle').value;
    const watchDate = document.getElementById('watchDate').value;
    const watchTime = document.getElementById('watchTime').value;
    const impression = document.getElementById('impression').value;

    const loader = document.getElementById('loader');
    const resultArea = document.getElementById('result-area');
    const submitBtn = document.getElementById('submit-btn');

    // UI状態変更
    submitBtn.disabled = true;
    loader.style.display = 'block';
    resultArea.style.display = 'none';

    // =========================================================
    // ↓↓ ここにGASでデプロイして取得した「ウェブアプリのURL」を貼り付けます ↓↓
    // =========================================================
    const endpoint = "https://script.google.com/macros/s/YOUR_GAS_WEB_APP_URL/exec";

    try {
        // GASのCORS制約を回避するため、text/plainで送信します
        const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
                movieTitle: movieTitle,
                watchDate: watchDate,
                watchTime: watchTime,
                impression: impression
            })
        });

        const data = await response.json();

        if (data.success) {
            resultArea.innerHTML = `<h3>コーチからのメッセージ 🎉</h3><p>${data.aiResponse.replace(/\n/g, '<br>')}</p>`;
            resultArea.style.display = 'block';
            document.getElementById('log-form').reset();
            document.getElementById('watchDate').valueAsDate = new Date(); // 日付リセット
        } else {
            alert('エラーが発生しました: ' + data.error);
        }
    } catch (error) {
        console.error("通信エラー:", error);
        alert('ネットワークエラーが発生しました。時間を置いて再度お試しください。');
    } finally {
        submitBtn.disabled = false;
        loader.style.display = 'none';
    }
});
