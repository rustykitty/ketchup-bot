import { Command } from './command.js';
import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import { JsonResponse } from "../response.js";

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
