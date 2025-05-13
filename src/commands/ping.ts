import { Command } from './command.js';
import * as DAPI from 'discord-api-types/v10';

export const ping: Command = {
    data: {
        name: 'ping',
        description: 'Replies with pong!',
    },
    execute: async (interaction) => {
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: 'Pong!',
            },
        };
    },
};
