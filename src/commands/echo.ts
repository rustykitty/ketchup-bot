import { Command } from './command.js';
import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import { JsonResponse } from "../response.js";
import * as DAPI from "discord-api-types/v10";

export const echo: Command = {
    name: 'echo',
    description: 'Replies with the same message!',
    options: [
        {
            name: 'message',
            description: 'The message to echo.',
            type: DAPI.ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    execute: (interaction, env) => {
        if ('options' in interaction.data && interaction.data.options) {
            const opt = interaction.data.options[0] as DAPI.APIApplicationCommandInteractionDataStringOption;
            const message = opt.value;
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: message,
                },
            });
        } else {
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'interaction.data.options is undefined',
                },
            });
        }
    }
}