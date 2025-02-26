import { Command } from './command.js';

import { ping } from './ping.js';
import { echo } from './echo.js'
import { balance } from "./currency.js";
import {exec_sql} from "./admin.js";

const commands: Record<string, Command> = {
    ping: ping,
    echo: echo,
    balance: balance,
    'exec-sql': exec_sql
};

export default commands;