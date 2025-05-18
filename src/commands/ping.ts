import { Command } from './command.js';
import * as DAPI from 'discord-api-types/v10';

export const ping: Command = {
    data: {
        name: 'ping',
        description: 'Replies with pong!',
    },
    execute: async (interaction) => {
        // Parse timestamp from snowflake
        const ts: number = Number(
            (BigInt(interaction.id) >> 22n) + 1420070400000n,
        );
        const now = Date.now();
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `Pong!
One-way latency: ${now - ts}ms`,
            },
        };
    },
};
