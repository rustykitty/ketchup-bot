import { Command } from './command';
import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import { JsonResponse } from "../response";

// case 'ping': {
//     return new JsonResponse({
//         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//         data: {
//             content: 'Pong!',
//         },
//     });
// }
// case 'ping-ephemeral':
// return new JsonResponse({
//     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
//     data: {
//         content: 'Pong!',
//         flags: InteractionResponseFlags.EPHEMERAL
//     }
// });
const ping: Command = {
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

const pingEphemeral: Command = {
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
