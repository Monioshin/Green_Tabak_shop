const tg = window.Telegram.WebApp;
tg.expand();

const API_BASE_URL = "http://твой-ip-сервера:8080"; // Или адрес через ngrok
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

// Инициализация данных
async function init() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/get_balance?user_id=${userId}`);
        const data = await response.json();
        balance = data.balance;
        document.getElementById('username').textContent = data.username;
        updateUI();
    } catch (e) {
        console.error("Ошибка сети", e);
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
        tg.showAlert("Недостаточно золота для ставки!");
        return;
    }

    balance -= bet;
    updateUI();

    // Эффект кручения (быстрая смена значков)
    const spinEffect = setInterval(() => {
        document.getElementById('reel1').textContent = symbols[Math.floor(Math.random()*6)].img;
        document.getElementById('reel2').textContent = symbols[Math.floor(Math.random()*6)].img;
        document.getElementById('reel3').textContent = symbols[Math.floor(Math.random()*6)].img;
    }, 100);

    setTimeout(async () => {
        clearInterval(spinEffect);
        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        document.getElementById('reel1').textContent = results[0].img;
        document.getElementById('reel2').textContent = results[1].img;
        document.getElementById('reel3').textContent = results[2].img;

        if (results[0].img === results[1].img && results[1].img === results[2].img) {
            const win = bet * results[0].x;
            balance += win;
            tg.showPopup({ title: "ПОБЕДА!", message: `Вы выиграли ${win} золота!` });
        }

        updateUI();
        // Сохраняем в БД
        await fetch(`${API_BASE_URL}/api/update_balance`, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, balance: balance })
        });
    }, 1000);
}

function updateUI() {
    document.getElementById('balance').textContent = balance;
}

// Лидерборд
document.getElementById('leaderboard-btn').onclick = async () => {
    const resp = await fetch(`${API_BASE_URL}/api/leaderboard`);
    const leaders = await resp.json();
    const list = document.getElementById('leader-list');
    list.innerHTML = leaders.map((u, i) => `
        <div class="leader-item">
            <span>${i+1}. ${u.username}</span>
            <span>${u.balance} 💰</span>
        </div>
    `).join('');
    document.getElementById('leaderboard-modal').style.display = 'block';
};

document.getElementById('close-modal').onclick = () => {
    document.getElementById('leaderboard-modal').style.display = 'none';
};

document.getElementById('spin-button').addEventListener('click', spin);

init();