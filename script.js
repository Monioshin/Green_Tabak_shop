const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Настройка цветов ТГ
tg.backgroundColor = '#000000';
tg.headerColor = '#000000';

let cart = [];

// Получаем ID из параметров ссылки
const urlParams = new URLSearchParams(window.location.search);
const userNumber = urlParams.get('user_num') || "000";

function initId() {
    const display = document.getElementById('user-id-display');
    const formattedId = userNumber.toString().padStart(3, '0');
    display.innerText = `ID: ${formattedId} / S.E.C.`;
}
initId();

const products = {
    'Жевательный табак': [
        { id: 1, name: "Siberia Red Slim", price: 650 },
        { id: 2, name: "Odens Cold Dry", price: 600 }
    ],
    'Одноразки': [
        { id: 3, name: "Elf Bar BC5000", price: 1150 },
        { id: 4, name: "Lost Mary OS5000", price: 1050 }
    ],
    'Жидкости': [
        { id: 5, name: "Husky Salt", price: 450 },
        { id: 6, name: "Maxwell's Shoria", price: 550 }
    ],
    'Вейпы': [
        { id: 7, name: "Vaporesso XROS 3", price: 2900 },
        { id: 8, name: "GeekVape Hero 2", price: 3100 }
    ]
};

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    updateMainButton();
}

function showCategory(cat) {
    const container = document.getElementById('items-list');
    document.getElementById('cat-title').innerText = cat.toUpperCase();
    container.innerHTML = products[cat].map(p => `
        <div class="product-item">
            <div>
                <div style="font-weight:700; font-size:13px;">${p.name.toUpperCase()}</div>
                <div style="color:#666; font-size:12px;">${p.price} ₽</div>
            </div>
            <button class="buy-btn" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">ADD</button>
        </div>
    `).join('');
    showScreen('category-screen');
}

function addToCart(id, name, price) {
    cart.push({ id, name, price, uid: Date.now() });
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    updateUI();
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.length;
}

function showCart() {
    const container = document.getElementById('cart-items-list');
    const totalSum = document.getElementById('total-sum');
    if(cart.length === 0) {
        container.innerHTML = '';
        document.getElementById('cart-empty').style.display = 'block';
    } else {
        document.getElementById('cart-empty').style.display = 'none';
        totalSum.innerText = cart.reduce((s, i) => s + i.price, 0);
        container.innerHTML = cart.map(i => `
            <div class="product-item">
                <div><div>${i.name.toUpperCase()}</div><div>${i.price} ₽</div></div>
                <button onclick="removeFromCart(${i.uid})" style="background:none; border:none; color:red;">REMOVE</button>
            </div>
        `).join('');
    }
    showScreen('cart-screen');
}

function removeFromCart(uid) {
    cart = cart.filter(i => i.uid !== uid);
    updateUI();
    showCart();
}

function updateMainButton() {
    if (cart.length > 0 && document.getElementById('cart-screen').classList.contains('active')) {
        tg.MainButton.setText(`CONFIRM: ${cart.reduce((s, i) => s + i.price, 0)} ₽`);
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

tg.onEvent('mainButtonClicked', () => {
    const data = {
        user_id: userNumber,
        items: cart,
        total: cart.reduce((s, i) => s + i.price, 0)
    };
    tg.sendData(JSON.stringify(data));
});
