// LocalStorage Data Manager & Default Schema
const STORAGE_KEYS = {
    TASKS: 'agile_study_tasks',
    HABITS: 'agile_study_habits',
    SETTINGS: 'agile_study_settings',
    STATS: 'agile_study_stats'
};

const DEFAULT_DEMO_DATA = {
    tasks: [
        {
            id: 't_1',
            title: 'Computer Org: Cache Memory & Mapping Techniques',
            deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
            duration: 2.5,
            difficulty: 5,
            importance: 3,
            completed: false,
            priorityScore: 9.4
        },
        {
            id: 't_2',
            title: 'Algorithms: Divide & Conquer (Merge Sort & Binary Search)',
            deadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
            duration: 1.5,
            difficulty: 4,
            importance: 3,
            completed: false,
            priorityScore: 8.6
        },
        {
            id: 't_3',
            title: 'Web Tech: CSS Grid & Responsive Layouts',
            deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
            duration: 1.0,
            difficulty: 2,
            importance: 1,
            completed: true,
            priorityScore: 4.8
        }
    ],
    habits: [
        {
            id: 'h_1',
            name: 'Morning LeetCode / Coding Practice',
            cue: '7:30 AM right after morning tea',
            routine: 'Solve 2 problems on Arrays/Recursion for 45 mins',
            reward: '15 mins social media or relaxing walk',
            streak: 7,
            lastCompleted: new Date().toISOString().split('T')[0]
        },
        {
            id: 'h_2',
            name: 'Class Revision & Notes Polish',
            cue: '6:00 PM sitting at desk',
            routine: 'Summarize today lecture into handwritten notes',
            reward: 'Favorite podcast episode',
            streak: 4,
            lastCompleted: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0]
        }
    ],
    stats: {
        totalFocusMinutes: 180,
        weeklyLog: [3, 4, 2, 5, 4, 6, 3]
    }
};

const StorageService = {
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
            this.seedDemoData();
        }
    },
    seedDemoData() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_DEMO_DATA.tasks));
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(DEFAULT_DEMO_DATA.habits));
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(DEFAULT_DEMO_DATA.stats));
    },
    getTasks() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    },
    saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    },
    getHabits() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS)) || [];
    },
    saveHabits(habits) {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    },
    getStats() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || DEFAULT_DEMO_DATA.stats;
    },
    saveStats(stats) {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    }
};
