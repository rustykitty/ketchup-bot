import { Command } from './command.js';
import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import { JsonResponse } from "../response.js";
import * as DAPI from "discord-api-types/v10";
// import * as workers_types from "@cloudflare/workers-types";
import { getOptions } from './options.js';

let query = `SELECT ketchup FROM user_data WHERE id = ?`;

/**
 * Get the balance of a user
 * @returns null if the user is not in the DB, their ketchup balance otherwise
 */
async function get_balance(db: D1Database, user_id: string): Promise<number | null> {
    const res: D1Result<{ketchup: number}> = await db.prepare(`SELECT ketchup FROM user_data WHERE id = ?`).bind(user_id).run();
    if (res.results === undefined) return null;
    return res.results[0] ? res.results[0].ketchup : 0;
}

export const balance: Command = {
    data: {
        name: 'balance',
        description: 'Check your balance!'
    },
    /**
     * Get the balance of the user, inserting if it doesn't exist
     */
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

export const get_ketchup: Command = {
    data: {
        name: 'get-ketchup',
        description: "Give yourself ketchup",
        options: [
            {
                name: 'amount',
                description: 'how much ketchup to give',
                type: DAPI.ApplicationCommandOptionType.Integer,
                required: true,
            },
        ]
    },
    execute: async (interaction, env) => {
        let db: D1Database = env.DB;
        let user_id: string = interaction.member.user.id;

        let { amount } = getOptions(interaction);

        await db.prepare(`INSERT INTO user_data (id, ketchup) VALUES (?, 0)
            ON CONFLICT (id) DO UPDATE SET ketchup = ketchup + ?`).bind(user_id, amount).run();
        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Added ${amount} ketchup packets to self, for a total of ${await get_balance(db, user_id)} packets!`,
            },
        });
    }
};
