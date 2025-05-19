/**
 * Typings for D1 tables
 */

// user_Data
interface UserDataRow {
    id: string;
    ketchup: number;
    last_daily: number;
    last_work: number;
}

// reminders
interface RemindersRow {
    id: number;
    user_id: string;
    message: string;
    timestamp: number;
}
