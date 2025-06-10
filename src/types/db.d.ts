/**
 * Typings for D1 tables
 */

// user_data
interface UserDataRow {
    id: string;
    ketchup: number;
    last_daily: number;
    last_work: number;
}

// reminders
interface RemindersRow {
    // UUID v4
    id: string;
    user_id: string;
    message: string;
    timestamp: number;
}
