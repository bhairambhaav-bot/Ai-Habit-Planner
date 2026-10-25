// Habit Loop Mechanism
const HabitManager = {
    checkIn(habitId) {
        const habits = StorageService.getHabits();
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        if (habit.lastCompleted === today) {
            alert('Aapne yeh habit loop aaj pehle hi complete kar liya hai! 🎉');
            return;
        }

        const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
        if (habit.lastCompleted === yesterday) {
            habit.streak += 1;
        } else {
            habit.streak = 1;
        }

        habit.lastCompleted = today;
        StorageService.saveHabits(habits);
        App.renderAll();
    }
};
