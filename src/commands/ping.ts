import { Command } from './command.js';
import { InteractionResponseType, InteractionType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from '../response.js';

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
