-- CREATE TABLE user_data (
--     id VARCHAR(20) PRIMARY KEY,
--     ketchup INT NOT NULL DEFAULT 0,
--     last_daily DATE NOT NULL DEFAULT '1970-01-01',
-- );

-- migration
BEGIN TRANSACTION;

CREATE TABLE user_data_old AS SELECT * FROM user_data;
DROP TABLE user_data;
CREATE TABLE user_data (
    id VARCHAR(20) PRIMARY KEY,
    ketchup INT NOT NULL DEFAULT 0,
    last_daily INT NOT NULL DEFAULT 0
);
INSERT INTO user_data (id, ketchup, last_daily)
SELECT id, ketchup, 0 FROM user_data_old;

DROP TABLE user_data_old;

COMMIT;