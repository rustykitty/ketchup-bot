import { Command } from './command.js';
import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import { JsonResponse } from "../response.js";
import * as DAPI from "discord-api-types/v10";
// import * as workers_types from "@cloudflare/workers-types";

let query = `SELECT ketchup FROM user_data WHERE id = ?`;

export const balance: Command = {
    data: {
        name: 'balance',
        description: 'Check your balance!'
    },
    execute: async (interaction, env) => {
        let db: D1Database = env.DB;
        let user_id = interaction.member.user.id;
        await db.prepare(`INSERT OR IGNORE INTO user_data (id, ketchup) VALUES (?, 0)`).bind(user_id).run();
        let result: D1Result<{ketchup: number}> = await db.prepare(query).bind(user_id).run();
        // @ts-ignore
        let user_bal = result.results[0];
        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `You have ${user_bal.ketchup} ketchup packets!`,
            },
        });
    }
};
