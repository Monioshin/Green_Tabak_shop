let tg = window.Telegram.WebApp;
tg.expand();

// Получаем имя пользователя из Telegram
const usernameElement = document.getElementById('username');
if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    usernameElement.innerText = tg.initDataUnsafe.user.first_name;
}

let exp = 0;
let level = 1;

function openModal() {
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function createTask() {
    const input = document.getElementById('task-input');
    if (input.value.trim() === "") return;

    const taskList = document.getElementById('task-list');
    const emptyMsg = document.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item'; // Можно добавить стили в CSS для .task-item
    taskDiv.style = "background: #2f3542; padding: 15px; border-radius: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
    
    taskDiv.innerHTML = `
        <span>${input.value}</span>
        <button onclick="completeTask(this)" style="width: auto; padding: 5px 15px; font-size: 12px; background: #2ed573;">Готово</button>
    `;

    taskList.appendChild(taskDiv);
    input.value = "";
    closeModal();
}

function completeTask(btn) {
    btn.parentElement.remove();
    addExp(20);
}

function addExp(amount) {
    exp += amount;
    if (exp >= 100) {
        exp = 0;
        level++;
        document.getElementById('level').innerText = `Ур. ${level}`;
        tg.HapticFeedback.notificationOccurred('success'); // Вибрация при новом уровне
    }
    document.getElementById('exp-fill').style.width = `${exp}%`;
    document.getElementById('exp-value').innerText = exp;
}