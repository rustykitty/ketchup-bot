import {Command} from './command.js';
import {InteractionResponseType,} from 'discord-interactions';
import {JsonResponse} from "../response.js";
import * as DAPI from "discord-api-types/v10";

export const exec_sql: Command = {
    name: 'exec-sql',
    description: 'Execute a SQL query. Only available to the bot owner.',
    // @ts-ignore
    options: [
        {
            name: 'query',
            description: 'The query to execute.',
            type: DAPI.ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    // @ts-ignore
    execute: async (interaction: DAPI.APIChatInputApplicationCommandGuildInteraction, env) => {
        if (interaction.member.user.id !== '971226149659246632') {
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'You are not the bot owner!',
                }
            })
        }
        let db: D1Database = env.DB;
        if (interaction.data === undefined) {
            // @ts-ignore
            interaction.data.options[0]; // intentionally throw an error which will be caught
        }
        // @ts-expect-error : see above
        const opt = (interaction.data.options[0] as DAPI.APIApplicationCommandInteractionDataStringOption).value;
        const result = await db.prepare(opt).run();

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
