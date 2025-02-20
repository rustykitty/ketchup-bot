import { Command } from './command.ts';
import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import { JsonResponse } from "../response.ts";

export const ping: Command = {
    name: 'ping',
    description: 'Replies with pong!',
    execute: interaction => {
        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Pong!'
            }
        });
    }
}

export const pingEphemeral: Command = {
    name: 'ping-ephemeral',
    description: 'Replies with pong, but only you can see it!',
    execute: interaction => {
        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: 'Pong!',
                flags: InteractionResponseFlags.EPHEMERAL
            },
        });
    }
}
