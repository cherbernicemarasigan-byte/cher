document.addEventListener('DOMContentLoaded', main);

function main() {
    const savedEmail = localStorage.getItem('savedEmail');
    if (!savedEmail) {
        window.location.href = 'Account.html';
        return;
    }

    const userKey = savedEmail ? encodeURIComponent(savedEmail) : 'guest';

    initProfile(savedEmail);
    TasksModule.init(userKey);
    NotesModule.init(userKey);
    ClockModule.init();
    CalendarModule.init();
    ModalModule.init();
    ThemeModule.init(userKey);
    FontModule.init();
    LogoutModule.init();
}

/*          PROFILE          */
function initProfile(savedEmail) {
    const avatarEl = document.getElementById('avatar');
    const profileTextEl = document.getElementById('profileText');
    const username = savedEmail.split('@')[0];
    if (avatarEl) avatarEl.textContent = username.charAt(0).toUpperCase();
    if (profileTextEl) profileTextEl.textContent = `Good day, ${username}!`;
}

/*          TO DO LIST           */
const TasksModule = (function () {
    let tasks = [];
    let userKey = 'guest';
    let elems = {};

    function init(key) {
        userKey = key;
        elems.tasksList = document.getElementById('tasksList');
        elems.addTaskForm = document.getElementById('addTaskForm');
        elems.taskInput = document.getElementById('taskInput');

        if (!elems.tasksList || !elems.addTaskForm || !elems.taskInput) {
            console.info('Task UI elements not found — task features disabled.');
            return;
        }

        load();
        elems.addTaskForm.addEventListener('submit', onAddTask);
        render();
    }

    function storageKey() { return `tasks_${userKey}`; }

    function load() {
        const stored = localStorage.getItem(storageKey());
        tasks = stored ? JSON.parse(stored) : [];
    }

    function save() {
        localStorage.setItem(storageKey(), JSON.stringify(tasks));
    }

    function render() {
        elems.tasksList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                <button class="delete-btn">🗑</button>
            `;

            taskItem.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
            taskItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
            elems.tasksList.appendChild(taskItem);
        });
        save();
    }

    function toggleTask(id) {
        tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        render();
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        render();
    }

    function onAddTask(e) {
        e.preventDefault();
        const text = elems.taskInput.value.trim();
        if (!text) return;
        tasks.push({ id: Date.now(), text, completed: false });
        elems.taskInput.value = '';
        render();
    }

    return { init };
})();

/*          NOTES        */
const NotesModule = (function () {
    let userKey = 'guest';
    let notesEl = null;

    function init(key) {
        userKey = key;
        notesEl = document.getElementById('notesInput');
        if (!notesEl) return;
        const saved = localStorage.getItem(`notes_${userKey}`);
        if (saved) notesEl.value = saved;
        notesEl.addEventListener('input', (e) => localStorage.setItem(`notes_${userKey}`, e.target.value));
    }

    return { init };
})();

/*          CLOCK        */
const ClockModule = (function () {
    let clockTime = null;
    let clockDate = null;

    function init() {
        clockTime = document.getElementById('clockTime');
        clockDate = document.getElementById('clockDate');
        updateClock();
        setInterval(updateClock, 1000);
    }

    function updateClock() {
        const now = new Date();
        if (clockTime) clockTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        if (clockDate) clockDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    return { init };
})();

/*          CALENDAR         */
const CalendarModule = (function () {
    let calendarDays = null;
    let calendarMonthDisplay = null;
    let currentDate = new Date();

    function init() {
        calendarDays = document.getElementById('calendarDays');
        calendarMonthDisplay = document.getElementById('calendarMonth');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
        renderCalendar();
    }

    function renderCalendar() {
        if (!calendarDays || !calendarMonthDisplay) return;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const lastDate = lastDay.getDate();

        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        calendarMonthDisplay.textContent = `${monthNames[month]} ${year}`;
        calendarDays.innerHTML = '';

        ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day => {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'calendar-day-header';
            headerDiv.textContent = day;
            calendarDays.appendChild(headerDiv);
        });

        const prevLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const div = document.createElement('div');
            div.className = 'calendar-day other-month';
            div.textContent = prevLastDay - i;
            calendarDays.appendChild(div);
        }

        const today = new Date();
        for (let i = 1; i <= lastDate; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) div.classList.add('today');
            div.textContent = i;
            calendarDays.appendChild(div);
        }

        const totalCells = calendarDays.childNodes.length;
        for (let i = 1; i <= 42 - totalCells; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day other-month';
            div.textContent = i;
            calendarDays.appendChild(div);
        }
    }

    function changeMonth(delta) {
        currentDate.setMonth(currentDate.getMonth() + delta);
        renderCalendar();
    }

    return { init };
})();

/*          MODAL        */
const ModalModule = (function () {
    let modal = null;
    let overlay = null;
    let settingsBtn = null;
    let closeBtn = null;

    function init() {
        settingsBtn = document.getElementById('openSettings');
        modal = document.getElementById('settingsModal');
        overlay = document.getElementById('modalOverlay');
        closeBtn = document.getElementById('closeModal');

        if (!modal || !overlay) return;
        if (settingsBtn) settingsBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);

        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (overlay) { overlay.classList.remove('active'); overlay.style.pointerEvents = 'none'; overlay.setAttribute('aria-hidden','true'); }

        if (modal) {
            const accountAnchor = modal.querySelector('.modal-link');
            if (accountAnchor) accountAnchor.addEventListener('click', () => console.log('[modal] account anchor clicked — href:', accountAnchor.getAttribute('href')));
        }
    }

    function openModal() {
        if (!modal || !overlay) return;
        modal.classList.add('active');
        overlay.classList.add('active');
        overlay.style.pointerEvents = 'auto';
        overlay.style.zIndex = '10000';
        modal.style.zIndex = '10010';
        modal.setAttribute('aria-hidden', 'false');
        const focusable = modal.querySelector('a, button, input, select, textarea');
        if (focusable && typeof focusable.focus === 'function') focusable.focus();
    }

    function closeModal() {
        if (!modal || !overlay) return;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        overlay.style.pointerEvents = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    return { init };
})();

/*          THEME (PER USER)         */
const ThemeModule = (function () {
    function init(userKey) {
        const themeSelect = document.getElementById('themeSelect');
        const savedTheme = localStorage.getItem(`theme_${userKey}`) || localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            if (themeSelect) themeSelect.value = 'dark';
        } else {
            document.body.classList.remove('dark');
            if (themeSelect) themeSelect.value = 'light';
        }

        if (themeSelect) {
            themeSelect.addEventListener('change', function () {
                if (this.value === 'dark') {
                    document.body.classList.add('dark');
                    localStorage.setItem(`theme_${userKey}`, 'dark');
                } else {
                    document.body.classList.remove('dark');
                    localStorage.setItem(`theme_${userKey}`, 'light');
                }
            });
        }
    }

    return { init };
})();

/*      FONT STYLES      */
const FontModule = (function () {
    function init() {
        const fontSelect = document.getElementById('fontSelect');
        if (!fontSelect) return;
        fontSelect.addEventListener('change', function () { document.body.style.fontFamily = this.value; });
    }
    return { init };
})();

/*          LOG OUT          */
const LogoutModule = (function () {
    function init() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (!logoutBtn) return;
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('savedPassword');
            alert('You have been logged out.');
            window.location.href = 'Account.html';
        });
    }
    return { init };
})();