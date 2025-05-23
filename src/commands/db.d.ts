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

/**
 * `reminders` table
 */
interface RemindersRow {
    id: number;
    reminder: Reminder;
}
