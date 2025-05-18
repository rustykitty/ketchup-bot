import { Command } from './command.js';
import * as DAPI from 'discord-api-types/v10';
import { getOptions } from '../utility.js';

export const echo: Command = {
    data: {
        name: 'echo',
        description: 'Replies with the same text!',
        options: [
            {
                name: 'text',
                description: 'The text to echo.',
                type: DAPI.ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    execute: async (interaction, env) => {
        const { text } = getOptions<DAPI.APIApplicationCommandInteractionDataStringOption>(interaction);
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: text.value,
            },
        };
    },
};

export default [echo];
