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
    name: 'balance',
    description: 'Check your balance!',
    execute: (interaction, env) => {
        let db: D1Database = env.DB;
        let user_id = interaction.member.user.id;
        if (!db.prepare(`SELECT 1 FROM user_data WHERE id = ?`).bind(user_id).run()) {
            db.prepare(`INSERT INTO user_data (id, ketchup) VALUES (?, 0)`).bind(user_id).run();
        }
        let result = db.prepare(query).bind(user_id).run();
        let user_bal = result;
        console.log(user_bal);
        return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `You have ${user_bal} ketchup packets!`,
            },
        });
    }
}
