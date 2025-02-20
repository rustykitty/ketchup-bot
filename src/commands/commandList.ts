import { Command } from './command.js';

import { ping } from './ping.js';
import { echo } from './echo.js'

const commands: Record<string, Command> = {
    ping: ping,
    echo: echo

};

export default commands;