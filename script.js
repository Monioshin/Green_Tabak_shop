const tg = window.Telegram.WebApp;
tg.expand();

const API_BASE_URL = "https://your-ngrok-url.ngrok-free.app"; // ВСТАВЬ СЮДА СВОЙ URL

const userId = tg.initDataUnsafe.user?.id || 0;
const userName = tg.initDataUnsafe.user?.first_name || "Игрок";

let balance = 0;
const bet = 100;

const symbols = [
    { img: '🍒', weight: 45, x: 2 },
    { img: '🍋', weight: 25, x: 5 },
    { img: '🍇', weight: 15, x: 10 },
    { img: '🔔', weight: 10, x: 25 },
    { img: '💎', weight: 4, x: 100 },
    { img: '7️⃣', weight: 1, x: 777 }
];

async function init() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/get_balance?user_id=${userId}&username=${encodeURIComponent(userName)}`);
        const data = await response.json();
        balance = data.balance;
        document.getElementById('username').textContent = userName;
        updateUI();
    } catch (e) {
        console.error("Ошибка инициализации", e);
        balance = 1000;
        updateUI();
    }
}

function getRandomSymbol() {
    const totalWeight = symbols.reduce((acc, s) => acc + s.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const s of symbols) {
        if (rand < s.weight) return s;
        rand -= s.weight;
    }
}

async function spin() {
    if (balance < bet) {
        tg.showAlert("Недостаточно золота!");
        return;
    }

    balance -= bet;
    updateUI();

    const reelEls = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    
    let spinCount = 0;
    const interval = setInterval(() => {
        reelEls.forEach(el => el.textContent = symbols[Math.floor(Math.random()*symbols.length)].img);
        spinCount++;
        if(spinCount > 15) {
            clearInterval(interval);
            const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
            reelEls.forEach((el, i) => el.textContent = results[i].img);
            
            if (results[0].img === results[1].img && results[1].img === results[2].img) {
                const win = bet * results[0].x;
                balance += win;
                tg.HapticFeedback.notificationOccurred('success');
                tg.showPopup({ title: "ПОБЕДА!", message: `Вы выиграли ${win} золота!` });
            }
            updateUI();
            saveBalance();
        }
    }, 100);
}

async function saveBalance() {
    await fetch(`${API_BASE_URL}/api/update_balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, balance: balance })
    });
}

function updateUI() {
    document.getElementById('balance').textContent = balance;
}

// РАБОТА С ТОП-ЛИСТОМ
document.getElementById('leaderboard-btn').onclick = async () => {
    const modal = document.getElementById('leaderboard-modal');
    const list = document.getElementById('leader-list');
    list.innerHTML = "Загрузка...";
    modal.style.display = 'block';

    try {
        const resp = await fetch(`${API_BASE_URL}/api/leaderboard`);
        const leaders = await resp.json();
        
        list.innerHTML = leaders.map((u, i) => {
            let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            return `
                <div class="leader-item">
                    <span style="text-align: left">${medal} ${u.username}</span>
                    <span style="font-weight: bold; color: #f8b500">${u.balance} 💰</span>
                </div>
            `;
        }).join('');
    } catch (e) {
        list.innerHTML = "Ошибка загрузки данных.";
    }
};

document.getElementById('close-modal').onclick = () => {
    document.getElementById('leaderboard-modal').style.display = 'none';
};

document.getElementById('spin-button').onclick = spin;

init();