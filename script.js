const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let cart = [];

// БАЗА ТОВАРОВ
const products = {
    'Жевательный табак': [
        { id: 1, name: "Siberia Red Slim", price: 650 },
        { id: 2, name: "Odens Cold Dry", price: 600 },
        { id: 3, name: "Corvus Extreme", price: 550 },
        { id: 4, name: "Arqa Cold Russian", price: 500 }
    ],
    'Одноразки': [
        { id: 5, name: "Elf Bar BC5000", price: 1150 },
        { id: 6, name: "Lost Mary OS5000", price: 1050 },
        { id: 7, name: "Waka SoPro 10000", price: 1600 },
        { id: 8, name: "HQD Cuvie Plus", price: 600 }
    ],
    'Жидкости': [
        { id: 9, name: "Husky Salt (Double Ice)", price: 450 },
        { id: 10, name: "Maxwell's Shoria", price: 550 },
        { id: 11, name: "Boshki Salt", price: 480 },
        { id: 12, name: "Rick and Morty Liquid", price: 500 }
    ],
    'Вейпы': [
        { id: 13, name: "Vaporesso XROS 3 Nano", price: 2900 },
        { id: 14, name: "Smoant Knight 80", price: 3400 },
        { id: 15, name: "GeekVape Aegis Hero 2", price: 3100 },
        { id: 16, name: "Brusko Minican 3", price: 1600 }
    ]
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0, 0);
    updateMainButton(); // Проверяем состояние кнопки заказа
}

function showCategory(cat) {
    const container = document.getElementById('items-list');
    document.getElementById('cat-title').innerText = cat;
    
    container.innerHTML = products[cat].map(p => `
        <div class="product-item">
            <div>
                <div style="font-weight:700; font-size:15px;">${p.name}</div>
                <div style="color:var(--text-mute); font-size:13px; margin-top:4px;">${p.price} ₽</div>
            </div>
            <button class="buy-btn" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">Купить</button>
        </div>
    `).join('');
    showScreen('category-screen');
}

function addToCart(id, name, price) {
    cart.push({ id, name, price, uid: Date.now() });
    
    // Виброотклик
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    updateUI();
}

function removeFromCart(uid) {
    cart = cart.filter(i => i.uid !== uid);
    updateUI();
    showCart(); // Обновляем экран корзины сразу
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.length;
    updateMainButton();
}

function showCart() {
    const container = document.getElementById('cart-items-list');
    const empty = document.getElementById('cart-empty');
    const totalInfo = document.getElementById('cart-total-info');
    const totalSum = document.getElementById('total-sum');
    
    if(cart.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        totalInfo.style.display = 'none';
    } else {
        empty.style.display = 'none';
        totalInfo.style.display = 'block';
        
        const sum = cart.reduce((s, i) => s + i.price, 0);
        totalSum.innerText = sum;

        container.innerHTML = cart.map(item => `
            <div class="product-item">
                <div>
                    <div style="font-weight:700; font-size:14px;">${item.name}</div>
                    <div style="color:var(--primary); font-size:13px;">${item.price} ₽</div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.uid})">Удалить</button>
            </div>
        `).join('');
    }
    showScreen('cart-screen');
}

function updateMainButton() {
    // Если мы на экране корзины и она не пуста — показываем кнопку оформления
    const activeScreen = document.querySelector('.screen.active').id;
    
    if (cart.length > 0) {
        const total = cart.reduce((s, i) => s + i.price, 0);
        tg.MainButton.setText(`ОФОРМИТЬ ЗАКАЗ: ${total} ₽`);
        tg.MainButton.setParams({ color: '#2E7D32', is_visible: true });
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// При нажатии "Оформить заказ" в Telegram
tg.onEvent('mainButtonClicked', () => {
    if (cart.length === 0) return;
    
    const orderData = {
        items: cart.map(i => ({ name: i.name, price: i.price })),
        total: cart.reduce((s, i) => s + i.price, 0)
    };
    
    // Отправляем данные боту (он их получит через content_type="web_app_data")
    tg.sendData(JSON.stringify(orderData));
});