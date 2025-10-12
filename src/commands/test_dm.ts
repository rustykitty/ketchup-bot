import * as DAPI from 'discord-api-types/v10';

import { Command, CommandExecute } from './command.js';
import { getUser } from '../utility.js';

export const testDM: Command = {
    data: {
        name: 'test-dm-permissions',
        description: 'Make sure DM permissions are properly set up',
    },
    execute: async (interaction, env, ctx) => {
        const userId = getUser(interaction).id;
        const response = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
            method: 'POST',
            body: JSON.stringify({ recipient_id: userId }),
            headers: {
                Authorization: `Bot ${env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.status === 401) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: 'You need to allow me permission to send you DMs by adding me as a user app!',
                },
            };
        }
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: "I can send you DMs. You're all good to go!",
            },
        };
    },
};
