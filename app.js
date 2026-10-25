// App Controller
const App = {
    init() {
        StorageService.init();
        SyllabusEngine.init();
        this.bindEvents();
        TimerEngine.init();
        this.renderAll();
        this.detectNetwork();
    },

    detectNetwork() {
        const badge = document.getElementById('networkStatusBadge');
        const updateStatus = () => {
            if (navigator.onLine) {
                badge.className = 'badge online-badge';
                badge.textContent = '🌐 Online (Ready to Upload)';
            } else {
                badge.className = 'badge offline-badge';
                badge.textContent = '⚡ 100% Offline Active';
            }
        };
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    },

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                e.target.classList.add('active');
                const targetPane = document.getElementById(e.target.dataset.tab);
                if (targetPane) targetPane.classList.add('active');

                if (e.target.dataset.tab === 'tab-analytics') {
                    AnalyticsEngine.renderCharts();
                }
            });
        });

        // Theme Toggle
        document.getElementById('themeToggleBtn').addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            document.getElementById('themeToggleBtn').textContent = next === 'dark' ? '☀️' : '🌙';
        });

        // Reset Data
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            if (confirm('Kya aap sample data wapas load karna chahte hain?')) {
                StorageService.seedDemoData();
                this.renderAll();
            }
        });

        // Add Custom Task
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newTask = {
                id: 't_' + Date.now(),
                title: document.getElementById('taskTitle').value,
                deadline: document.getElementById('taskDeadline').value,
                duration: parseFloat(document.getElementById('taskDuration').value),
                difficulty: parseInt(document.getElementById('taskDifficulty').value),
                importance: parseInt(document.getElementById('taskImportance').value),
                completed: false
            };
            newTask.priorityScore = SchedulerEngine.calculatePriorityScore(newTask);
            
            const tasks = StorageService.getTasks();
            tasks.push(newTask);
            StorageService.saveTasks(tasks);

            e.target.reset();
            alert('✅ Task added with AI Priority Score: ' + newTask.priorityScore);
            this.renderAll();
        });

        // Add Habit Form
        document.getElementById('habitForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const newHabit = {
                id: 'h_' + Date.now(),
                name: document.getElementById('habitName').value,
                cue: document.getElementById('habitCue').value,
                routine: document.getElementById('habitRoutine').value,
                reward: document.getElementById('habitReward').value,
                streak: 0,
                lastCompleted: null
            };
            const habits = StorageService.getHabits();
            habits.push(newHabit);
            StorageService.saveHabits(habits);

            e.target.reset();
            alert('🔄 Habit loop created successfully!');
            this.renderAll();
        });
    },

    renderAll() {
        const tasks = StorageService.getTasks();
        const habits = StorageService.getHabits();
        const stats = StorageService.getStats();

        // Stats
        document.getElementById('statTotalTasks').textContent = tasks.length;
        document.getElementById('statCompletedTasks').textContent = tasks.filter(t => t.completed).length;
        const maxStreak = habits.length ? Math.max(...habits.map(h => h.streak)) : 0;
        document.getElementById('statActiveStreak').textContent = `${maxStreak} Days`;
        document.getElementById('statFocusTime').textContent = `${(stats.totalFocusMinutes / 60).toFixed(1)} hrs`;

        // AI Recommendation
        document.getElementById('aiSmartSuggestion').innerHTML = SchedulerEngine.getSmartSuggestion(tasks, habits);

        // Quick Today Tasks
        const quickTaskList = document.getElementById('quickTodayTasks');
        quickTaskList.innerHTML = '';
        const sortedTasks = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);
        
        sortedTasks.slice(0, 5).forEach(t => {
            const cat = SchedulerEngine.getPriorityCategory(t.priorityScore);
            const li = document.createElement('li');
            li.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--border-color);";
            li.innerHTML = `
                <div>
                    <span style="${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}"><strong>${t.title}</strong></span>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Due: ${t.deadline} | Est: ${t.duration}h</div>
                </div>
                <span class="tag ${cat.class}">Score: ${t.priorityScore}</span>
            `;
            quickTaskList.appendChild(li);
        });

        // Quick Habits
        const quickHabits = document.getElementById('quickHabitLoops');
        quickHabits.innerHTML = '';
        habits.forEach(h => {
            const div = document.createElement('div');
            div.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding: 0.6rem 0; border-bottom: 1px solid var(--border-color);";
            div.innerHTML = `
                <div>
                    <strong>${h.name}</strong>
                    <div style="font-size:0.75rem; color:var(--text-secondary);">Cue: ${h.cue}</div>
                </div>
                <span class="streak-counter">🔥 ${h.streak}d</span>
            `;
            quickHabits.appendChild(div);
        });

        // Scheduler Table
        const tbody = document.getElementById('schedulerTableBody');
        tbody.innerHTML = '';
        sortedTasks.forEach(t => {
            const cat = SchedulerEngine.getPriorityCategory(t.priorityScore);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="App.toggleTask('${t.id}')">
                </td>
                <td style="${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}"><strong>${t.title}</strong></td>
                <td>${t.deadline}</td>
                <td><strong>${t.priorityScore}</strong></td>
                <td><span class="tag ${cat.class}">${cat.label}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="App.deleteTask('${t.id}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Habit Cards
        const habitContainer = document.getElementById('habitsListContainer');
        habitContainer.innerHTML = '';
        habits.forEach(h => {
            const card = document.createElement('div');
            card.className = 'habit-loop-card';
            card.innerHTML = `
                <div>
                    <div class="habit-title">${h.name}</div>
                    <div class="habit-loop-details">
                        <span><strong>📍 Cue:</strong> ${h.cue}</span><br>
                        <span><strong>⚡ Routine:</strong> ${h.routine}</span><br>
                        <span><strong>🎁 Reward:</strong> ${h.reward}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div class="streak-counter" style="margin-bottom: 0.5rem;">🔥 Streak: ${h.streak} Days</div>
                    <button class="btn btn-success btn-sm" onclick="HabitManager.checkIn('${h.id}')">✅ Check-in Today</button>
                </div>
            `;
            habitContainer.appendChild(card);
        });

        // Timer Task Select
        const timerTaskSelect = document.getElementById('timerTaskLink');
        timerTaskSelect.innerHTML = '<option value="">General Deep Work</option>';
        tasks.filter(t => !t.completed).forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.title;
            timerTaskSelect.appendChild(opt);
        });

        AnalyticsEngine.renderCharts();
    },

    toggleTask(taskId) {
        const tasks = StorageService.getTasks();
        const t = tasks.find(x => x.id === taskId);
        if (t) {
            t.completed = !t.completed;
            StorageService.saveTasks(tasks);
            this.renderAll();
        }
    },

    deleteTask(taskId) {
        let tasks = StorageService.getTasks();
        tasks = tasks.filter(x => x.id !== taskId);
        StorageService.saveTasks(tasks);
        this.renderAll();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
