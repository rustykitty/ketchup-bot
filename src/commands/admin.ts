import { Command } from './command.js';
import * as DAPI from 'discord-api-types/v10';
import { getOptions } from '../utility.js';

export const exec_sql: Command = {
    data: {
        name: 'exec-sql',
        description: 'Execute a SQL query. Only available to the bot owner.',
        options: [
            {
                name: 'query',
                description: 'The query to execute.',
                type: DAPI.ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
    botOwnerOnly: true,
    execute: async (
        interaction: DAPI.APIApplicationCommandGuildInteraction,
        env,
    ) => {
        if (
            interaction.member.user.id !==
            (await env.KV.get('DISCORD_ADMIN_SERVER_ID'))
        ) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: 'You are not the bot owner!',
                },
            };
        }
        const db: D1Database = env.DB;
        const { query } = getOptions(interaction);
        const result = await db
            .prepare(
                (
                    query as unknown as DAPI.APIApplicationCommandInteractionDataStringOption
                ).value,
            )
            .run();

        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `\`\`\`json
${JSON.stringify(result, null, 2)}
                \`\`\``,
            },
        };
    },
};
