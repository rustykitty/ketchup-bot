import { Command } from './command.js';

import { ping } from './ping.js';
import { echo } from './echo.js'
import { balance } from "./balance.js";

const commands: Record<string, Command> = {
    ping: ping,
    echo: echo,
    balance: balance
};

export default commands;