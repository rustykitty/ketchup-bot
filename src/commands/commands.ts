import { Command } from './command.js';
import { ping } from './ping.js';
import { echo } from './echo.js';
import { balance, daily, get_ketchup, give_ketchup } from './currency.js';
import { exec_sql } from './admin.js';

const commands: Command[] = [
    ping,
    echo,
    balance,
    exec_sql,
    get_ketchup,
    daily,
    give_ketchup,
];

export default commands;
