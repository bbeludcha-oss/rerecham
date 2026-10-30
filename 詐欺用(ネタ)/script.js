let generatedPin = '';
let registeredTel = '';
let registeredName = '';
let currentBalance = 0;
let totalProfit = 0;
let isTradingActive = false;
let aiTradeInterval = null;

// ステップ1: 登録フォーム送信
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastKana = document.getElementById('lastKana').value.trim();
    const firstKana = document.getElementById('firstKana').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const tel = document.getElementById('tel').value.trim();

    // バリデーション
    const kanaRegex = /^[ぁ-んー]+$/;
    if (!kanaRegex.test(lastKana) || !kanaRegex.test(firstKana)) {
        alert('ふりがなは全角ひらがなで入力してください。');
        return;
    }

    const telRegex = /^[0-9]{10,11}$/;
    if (!telRegex.test(tel)) {
        alert('電話番号はハイフンなしの10桁または11桁の半角数字で入力してください。');
        return;
    }

    if (address.length < 5) {
        alert('有効な住所を入力してください。');
        return;
    }

    registeredTel = tel;
    registeredName = `${lastName} ${firstName}`;

    // 4桁認証コード生成
    generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('sentPinBox').textContent = generatedPin;
    document.getElementById('userEmailDisplay').textContent = email;

    // 画面切り替え
    document.getElementById('registerSection').classList.add('hidden');
    document.getElementById('verifySection').classList.remove('hidden');
});

// ステップ2: 認証コード確認
document.getElementById('verifyForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const enteredPin = document.getElementById('pinCode').value.trim();

    if (enteredPin === generatedPin) {
        // ダッシュボードへ反映
        document.getElementById('displayUserName').textContent = registeredName;
        document.getElementById('displayUserTel').textContent = registeredTel;

        document.getElementById('verifySection').classList.add('hidden');
        document.getElementById('aiDashboardSection').classList.remove('hidden');
    } else {
        alert('認証コードが正しくありません。確認メール内の4桁コードを入力してください。');
    }
});

// ステップ3: 入金ボタン（モーダルを開く）
document.getElementById('openDepositModalBtn').addEventListener('click', function() {
    document.getElementById('depositModal').classList.remove('hidden');
});

// モーダル閉じる
document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('depositModal').classList.add('hidden');
});

// ステップ4: クレジットカード決済処理
document.getElementById('paymentForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const depositAmount = parseFloat(document.getElementById('depositAmount').value);
    const cardNumber = document.getElementById('cardNumber').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCvc = document.getElementById('cardCvc').value.trim();

    // 最低250$チェック
    if (depositAmount < 250) {
        alert('【エラー】最低入金額は $250 からとなります。');
        return;
    }

    // 簡単なカード桁数チェック
    if (cardNumber.replace(/\s/g, '').length < 15 || cardCvc.length < 3) {
        alert('【エラー】有効なクレジットカード情報を入力してください。');
        return;
    }

    // 決済成功処理
    currentBalance += depositAmount;
    updateBalanceDisplay();

    // モーダルを閉じる
    document.getElementById('depositModal').classList.add('hidden');

    // 登録された電話番号にSMS通知を送信！
    triggerSmsNotification(`決済が ${depositAmount.toLocaleString()}$ 完了しました。`);

    // AIトレード本格始動
    startAiTrading();
});

// SMS通知を画面右下にポップアップ表示する関数
function triggerSmsNotification(message) {
    const smsBox = document.getElementById('smsNotification');
    const smsText = document.getElementById('smsTextMessage');
    
    smsText.textContent = `[${registeredTel}] ${message}`;
    smsBox.classList.remove('hidden');

    // 6秒後に自動で消える
    setTimeout(() => {
        smsBox.classList.add('hidden');
    }, 6000);
}

// 残高表示更新
function updateBalanceDisplay() {
    document.getElementById('balanceAmount').textContent = `$${currentBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

// AIトレードのリアルタイム自動売買シミュレーション
function startAiTrading() {
    if (isTradingActive) return;
    isTradingActive = true;

    document.getElementById('aiStatusText').textContent = '自動売買稼働中 (Active)';
    document.getElementById('aiStatusText').className = 'status-active';
    document.getElementById('aiStatusDesc').textContent = 'AIアルゴリズムが暗号資産・株式市場を高頻度でスキャンし、自動利益確定を繰り返しています。';
    document.getElementById('openDepositModalBtn').textContent = '💳 追加資金を入金する';

    const logContainer = document.getElementById('tradeLogContainer');
    
    addLog(`[AI Engine] 証拠金 $${currentBalance.toLocaleString()} を検知。ポートフォリオ構築完了。`, 'log-item');

    const symbols = ['AAPL', 'TSLA', 'BTC/USD', 'NVDA', 'ETH/USD', 'MSFT'];

    aiTradeInterval = setInterval(() => {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const isBuy = Math.random() > 0.4;
        const amount = (Math.random() * 40 + 10).toFixed(2);
        const profitLoss = (Math.random() * 12 - 4).toFixed(2);

        totalProfit += parseFloat(profitLoss);
        currentBalance += parseFloat(profitLoss);
        updateBalanceDisplay();

        const profitEl = document.getElementById('profitIndicator');
        profitEl.textContent = `${totalProfit >= 0 ? '+ ' : ''}$${totalProfit.toFixed(2)} (${((totalProfit / 250) * 100).toFixed(1)}%)`;
        profitEl.style.color = totalProfit >= 0 ? '#34d399' : '#f87171';

        if (isBuy) {
            addLog(`[BUY] ${symbol} を自動買付 (量: ${amount})`, 'log-buy');
        } else {
            addLog(`[SELL] ${symbol} 利食い決済 収益: ${profitLoss >= 0 ? '+' : ''}$${profitLoss}`, 'log-sell');
        }

    }, 3500); // 3.5秒ごとにAIがトレードを実行
}

function addLog(text, className) {
    const logContainer = document.getElementById('tradeLogContainer');
    const div = document.createElement('div');
    div.className = `log-item ${className || ''}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    logContainer.prepend(div);

    // ログが溜まりすぎたら古いものを消す
    if (logContainer.children.length > 25) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// ログアウトボタン
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (aiTradeInterval) clearInterval(aiTradeInterval);
    isTradingActive = false;
    currentBalance = 0;
    totalProfit = 0;
    location.reload();
});

// 修正ボタン
document.getElementById('backButton').addEventListener('click', function() {
    document.getElementById('verifySection').classList.add('hidden');
    document.getElementById('registerSection').classList.remove('hidden');
});