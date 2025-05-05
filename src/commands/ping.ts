import { Command } from './command.js';
import { InteractionResponseType, InteractionType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from '../response.js';

export const ping: Command = {
    data: {
        name: 'ping',
        description: 'Replies with pong!',
    },
    execute: async (interaction) => {
        return {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as any,
            data: {
                content: 'Pong!',
            },
        };
    },
};
