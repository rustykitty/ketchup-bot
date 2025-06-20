CREATE TABLE IF NOT EXISTS user_data (
    id VARCHAR(20) PRIMARY KEY,
    ketchup INT NOT NULL DEFAULT 0,
    last_daily INT NOT NULL DEFAULT 0,
    last_work INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reminders (
    id INT PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    timestamp INTEGER NOT NULL
);

DROP TABLE reminders;

CREATE TABLE reminders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    timestamp INTEGER NOT NULL
);
