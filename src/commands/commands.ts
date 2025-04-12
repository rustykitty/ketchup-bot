import { Command } from './command.js';
import { ping } from './ping.js';
import { echo } from './echo.js';
import { balance, daily, get_ketchup, give_ketchup } from './currency.js';
import { exec_sql } from './admin.js';

const commands: Record<string, Command> = {
    ping: ping,
    echo: echo,
    balance: balance,
    'exec-sql': exec_sql,
    'get-ketchup': get_ketchup,
    'daily': daily,
    'give-ketchup': give_ketchup,
};

export default commands;
