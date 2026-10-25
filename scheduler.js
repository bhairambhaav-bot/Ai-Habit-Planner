// AI Smart Scheduling Engine (Dynamic Heuristic Scoring)
const SchedulerEngine = {
    calculatePriorityScore(task) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadline = new Date(task.deadline);
        const diffDays = Math.max(0.2, (deadline - today) / (1000 * 60 * 60 * 24));

        // Urgency factor
        const urgencyScore = Math.min(10, 10 / diffDays);
        // Difficulty (1-5 to 10 scale)
        const difficultyScore = (task.difficulty / 5) * 10;
        // Importance / Exam Weight (1-3 to 10 scale)
        const weightScore = (task.importance / 3) * 10;

        // Formula: (Urgency * 0.45) + (Difficulty * 0.35) + (Weight * 0.20)
        const finalScore = (urgencyScore * 0.45) + (difficultyScore * 0.35) + (weightScore * 0.20);
        return parseFloat(finalScore.toFixed(1));
    },

    getPriorityCategory(score) {
        if (score >= 8.0) return { label: 'High Priority', class: 'tag-high' };
        if (score >= 5.0) return { label: 'Medium', class: 'tag-med' };
        return { label: 'Low', class: 'tag-low' };
    },

    getSmartSuggestion(tasks, habits) {
        const pending = tasks.filter(t => !t.completed);
        if (pending.length === 0) {
            return "🎉 Great job! All scheduled tasks are complete. Take a well-deserved break or start a habit loop!";
        }
        pending.sort((a, b) => b.priorityScore - a.priorityScore);
        const top = pending[0];
        return `🎯 **AI Recommendation:** Start with "**${top.title}**" (AI Priority Score: ${top.priorityScore}/10). With deadline on ${top.deadline}, finish this in a 25-min Pomodoro focus window!`;
    }
};
