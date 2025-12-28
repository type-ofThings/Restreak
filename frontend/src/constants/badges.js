// Badge Definitions with conditions

export const BADGES = [
    { id: 'first_habit', name: 'First Step', description: 'Created your first habit', icon: 'Zap', condition: (streak) => streak >= 1 },
    { id: '3_day_streak', name: 'Momentum', description: 'Reached a 3-day streak', icon: 'Flame', condition: (streak) => streak >= 3 },
    { id: 'recovery_master', name: 'Recovery Master', description: 'Came back after a missed day', icon: 'Activity', condition: () => false }, // Placeholder logic
    { id: '7_day_consistency', name: 'Consistent', description: '7 days of activity', icon: 'CalendarIcon', condition: (streak) => streak >= 7 },
    { id: 'habit_scholar', name: 'Scholar', description: 'Completed 10 study sessions', icon: 'BookOpen', condition: (streak) => streak >= 10 },
    { id: 'early_riser', name: 'Early Riser', description: 'Completed a habit before 8am', icon: 'check', condition: () => false },
];

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
