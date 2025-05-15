interface UserDataRow {
    id: string;
    ketchup: number;
    last_daily: number;
}

interface RemindersRow {
    id: number;
    user_id: string;
    message: string;
    timestamp: number;
}
