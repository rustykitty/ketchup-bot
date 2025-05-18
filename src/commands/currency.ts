import { Command } from './command.js';
import * as DAPI from 'discord-api-types/v10';
// import * as workers_types from "@cloudflare/workers-types";
import { getOptions } from '../utility.js';

export const balance: Command = {
    data: {
        name: 'balance',
        description: 'Check your balance!',
    },
    /**
     * Get the balance of the user, inserting if it doesn't exist
     */
    execute: async (interaction, env) => {
        const db: D1Database = env.DB;
        const user_id = interaction.member.user.id;
        await db.prepare(`INSERT OR IGNORE INTO user_data (id, ketchup) VALUES (?, 0)`).bind(user_id).run();
        const result: D1Result<UserDataRow> = await db
            .prepare(`SELECT ketchup FROM user_data WHERE id = ?`)
            .bind(user_id)
            .run();
        const user_bal = result.results[0];
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `You have ${user_bal.ketchup} ketchup packets!`,
            },
        };
    },
};

export const get_ketchup: Command = {
    data: {
        name: 'get-ketchup',
        description: 'Materialize ketchup packets for yourself out of thin air',
        options: [
            {
                name: 'amount',
                description: 'How much ketchup to give yourself. Can be a negative number.',
                type: DAPI.ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    execute: async (interaction, env) => {
        const db: D1Database = env.DB;
        const user_id: string = interaction.member.user.id;

        const { amount } = getOptions<DAPI.APIApplicationCommandInteractionDataIntegerOption>(interaction);

        const amt = amount.value;

        const results: D1Result<UserDataRow>[] = await db.batch([
            db
                .prepare(
                    `INSERT INTO user_data (id, ketchup) VALUES (?, 0)
            ON CONFLICT (id) DO UPDATE SET ketchup = ketchup + ?`,
                )
                .bind(user_id, amt),
            db.prepare(`SELECT ketchup FROM user_data WHERE id = ?`).bind(user_id),
        ]);
        const new_amt: number = results[1].results[0].ketchup;
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `You've materialized ${amt} ketchup packets! You now have a total of ${new_amt} packets!`,
            },
        };
    },
};

export const give_ketchup: Command = {
    data: {
        name: 'give-ketchup',
        description: 'Give someone else ketchup',
        options: [
            {
                name: 'user',
                description: 'The user to give ketchup to',
                type: DAPI.ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'amount',
                description: 'How much ketchup to give. Cannot be a negative number.',
                type: DAPI.ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    execute: async (interaction, env) => {
        const { user, amount } = getOptions<
            DAPI.APIApplicationCommandInteractionDataIntegerOption | DAPI.APIApplicationCommandInteractionDataUserOption
        >(interaction);
        const amountValue: number = (amount as DAPI.APIApplicationCommandInteractionDataIntegerOption).value as number;
        const recipientId: string = (user as DAPI.APIApplicationCommandInteractionDataUserOption).value;
        if (recipientId === interaction.member.user.id) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You can't give ketchup to yourself! Use /get-ketchup to materialize ketchup packets.`,
                },
            };
        }
        const db: D1Database = env.DB;
        const senderId: string = interaction.member.user.id;
        const results: D1Result<UserDataRow>[] = await db.batch([
            db.prepare(`SELECT ketchup FROM user_data WHERE id = ?`).bind(senderId),
        ]);
        const senderBalance = results[0].results[0]?.ketchup ?? 0;
        if (senderBalance < amountValue) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You don't have enough ketchup to give! You currently have ${senderBalance} packets.`,
                },
            };
        } else {
            const results: D1Result<UserDataRow>[] = await db.batch([
                db
                    .prepare(
                        `INSERT INTO user_data (id, ketchup) VALUES (?, 0) 
                ON CONFLICT (id) DO UPDATE SET ketchup = ketchup - ?`,
                    )
                    .bind(senderId, amountValue),
                db
                    .prepare(
                        `INSERT INTO user_data (id, ketchup) VALUES (?, ?)
                ON CONFLICT (id) DO UPDATE SET ketchup = ketchup + ?`,
                    )
                    .bind(recipientId, amountValue, amountValue),
            ]);

            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You gave ${amountValue} ketchup packets to <@${recipientId}>!`,
                },
            };
        }
    },
};

export const daily: Command = {
    data: {
        name: 'daily',
        description: 'Get your daily ketchup!',
    },
    execute: async (interaction, env) => {
        const db: D1Database = env.DB;
        const user_id: string = interaction.member.user.id;

        const result: D1Result<UserDataRow> = await db
            .prepare(`SELECT last_daily FROM user_data WHERE id = ?`)
            .bind(user_id)
            .run();
        const last_daily: number = result.results[0]?.last_daily ?? 0;

        if (Math.floor(Date.now() / 86400000) <= Math.floor(last_daily / 86400000)) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You've already claimed your daily ketchup! Your next daily will be available <t:${Math.floor(last_daily / 86400000) * 86400 + 86400}:R>.`,
                },
            };
        }

        const results: D1Result[] = await db.batch([
            db
                .prepare(
                    `INSERT INTO user_data (id, ketchup) VALUES (?, ?)
        ON CONFLICT (id) DO UPDATE SET ketchup = ketchup + ?, last_daily = ?`,
                )
                .bind(user_id, 100, 100, Math.floor(Date.now())),
            db.prepare(`SELECT ketchup FROM user_data WHERE id = ?`).bind(user_id),
        ]);

        const new_ketchup_amount = (results[1] as D1Result<UserDataRow>).results[0].ketchup;

        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `Meow! You've claimed your daily ketchup and now have ${new_ketchup_amount} packets!`,
            },
        };
    },
};

export default [balance, get_ketchup, give_ketchup, daily];
