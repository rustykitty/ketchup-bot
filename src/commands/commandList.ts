import { Command } from './command';

import {
    ping,
    pingEphemeral
} from './ping';

const commands: Record<string, Command> = {
    ping: ping,
    'ping-ephemeral': pingEphemeral
};

export default commands;