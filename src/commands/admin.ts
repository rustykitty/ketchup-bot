import {Command} from './command.js';
import {InteractionResponseType,} from 'discord-interactions';
import {JsonResponse} from "../response.js";
import * as DAPI from "discord-api-types/v10";
import { getOptions } from './options.js';

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
    onlyGuilds: ['1055606556386922526'],
    execute: async (interaction: DAPI.APIApplicationCommandGuildInteraction, env) => {
        if (interaction.member.user.id !== '971226149659246632') {
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'You are not the bot owner!',
                }
            })
        }
        let db: D1Database = env.DB;
        const { query } = getOptions(interaction);
        const result = await db.prepare((query as unknown as DAPI.APIApplicationCommandInteractionDataStringOption).value).run();

        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `\`\`\`json
${JSON.stringify(result, null, 2)}
                \`\`\``,
            },
        });
    }
}
