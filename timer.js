// Pomodoro Focus Timer
const TimerEngine = {
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    timerId: null,
    isRunning: false,

    init() {
        this.updateDisplay();
        document.querySelectorAll('.timer-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const mins = parseInt(e.target.dataset.time);
                this.setMode(mins, e.target.textContent);
            });
        });

        document.getElementById('timerStartBtn').addEventListener('click', () => this.start());
        document.getElementById('timerPauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('timerResetBtn').addEventListener('click', () => this.reset());
    },

    setMode(mins, label) {
        this.pause();
        this.totalSeconds = mins * 60;
        this.remainingSeconds = this.totalSeconds;
        document.getElementById('timerStatusLabel').textContent = label;
        this.updateDisplay();
    },

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('timerStartBtn').disabled = true;
        document.getElementById('timerPauseBtn').disabled = false;

        this.timerId = setInterval(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
                this.updateDisplay();
            } else {
                this.completeSession();
            }
        }, 1000);
    },

    pause() {
        this.isRunning = false;
        clearInterval(this.timerId);
        document.getElementById('timerStartBtn').disabled = false;
        document.getElementById('timerPauseBtn').disabled = true;
    },

    reset() {
        this.pause();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
    },

    updateDisplay() {
        const mins = Math.floor(this.remainingSeconds / 60);
        const secs = this.remainingSeconds % 60;
        document.getElementById('timerCountdown').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    completeSession() {
        this.pause();
        alert('🔔 Focus session complete! Time for a short break or habit reward.');
        const stats = StorageService.getStats();
        stats.totalFocusMinutes = (stats.totalFocusMinutes || 0) + Math.floor(this.totalSeconds / 60);
        StorageService.saveStats(stats);
        App.renderAll();
    }
};
