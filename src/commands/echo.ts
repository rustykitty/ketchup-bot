import { Command } from './command.js';
import { InteractionResponseType, InteractionType, InteractionResponseFlags } from 'discord-interactions';
import { JsonResponse } from '../response.js';
import * as DAPI from 'discord-api-types/v10';
import { getOptions } from '../utility.js';

let test: DAPI.APIApplicationCommandInteractionDataOption;

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
        if ('options' in interaction.data && interaction.data.options) {
            const { text } = getOptions(interaction) as Record<
                string,
                DAPI.APIApplicationCommandInteractionDataStringOption
            >;
            const data = text.value;
            return {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as any,
                data: {
                    content: data,
                },
            };
        } else {
            return {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'interaction.data.options is undefined',
                },
            };
        }
    },
};
