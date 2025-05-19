
CREATE TABLE IF NOT EXISTS user_data (
    id VARCHAR(20) PRIMARY KEY,
    ketchup INT NOT NULL DEFAULT 0,
    last_daily INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_data_old (
    id VARCHAR(20) PRIMARY KEY,
    ketchup INT NOT NULL DEFAULT 0,
    last_daily INT NOT NULL DEFAULT 0
);

INSERT INTO user_data_old (id, ketchup, last_daily) 
SELECT id, ketchup, last_daily FROM user_data;

DROP TABLE user_data;

CREATE TABLE IF NOT EXISTS user_data (
    id VARCHAR(20) PRIMARY KEY,
    ketchup INT NOT NULL DEFAULT 0,
    last_daily INT NOT NULL DEFAULT 0,
    last_work INT NOT NULL DEFAULT 0
);

INSERT INTO user_data (id, ketchup, last_daily, last_work)
SELECT id, ketchup, last_daily, 0 FROM user_data_old;

DROP TABLE user_data_old;



CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    timestamp INTEGER NOT NULL
);
