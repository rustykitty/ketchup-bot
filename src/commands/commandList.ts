import { Command } from './command.ts';

import {
    ping,
    pingEphemeral
} from './ping.ts';
import { evalCommand } from './bot_admin_commands.ts';

const commands: Record<string, Command> = {
    ping: ping
};

export default commands;