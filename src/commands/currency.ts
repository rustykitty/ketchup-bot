import { Command } from './command.js';
import * as DAPI from '@/types/dapi.js';
import { getOptions, getUser } from '../utility.js';

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
        const user_id = getUser(interaction).id;
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
        if (recipientId === getUser(interaction).id) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You can't give ketchup to yourself! Use /get-ketchup to materialize ketchup packets.`,
                },
            };
        }
        const db: D1Database = env.DB;
        const senderId: string = getUser(interaction).id;
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
            const results: D1Result<undefined>[] = await db.batch([
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
                    content: `You gave ${amountValue} ketchup packets to <@${recipientId}>! `,
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
        const kv: KVNamespace = env.KV;
        const db: D1Database = env.DB;
        const user_id: string = getUser(interaction).id;

        const workAmount = (await kv.get('DAILY_AMOUNT')) ?? 100;

        const lastDailyResult = (
            await db.batch([
                db.prepare(`SELECT last_daily FROM user_data WHERE id = ?`).bind(user_id),
                db
                    .prepare(
                        `INSERT INTO user_data (id, last_daily) VALUES (?1, ?2)
                        ON CONFLICT (id) DO UPDATE SET last_daily = ?2`,
                    )
                    .bind(user_id, Date.now()),
            ])
        )[0] as D1Result<UserDataRow>;
        const last_daily: number = lastDailyResult.results[0]?.last_daily ?? 0;

        if (Math.trunc(Date.now() / 86400000) <= Math.trunc(last_daily / 86400000)) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You've already claimed your daily ketchup! Your next daily will be available <t:${Math.trunc(last_daily / 86400000) * 86400 + 86400}:R>.`,
                },
            };
        }

        const newKetchupAmountResult = (
            await db.batch([
                db
                    .prepare(
                        `INSERT INTO user_data (id, ketchup) VALUES (?1, ?2)
                        ON CONFLICT (id) DO UPDATE SET ketchup = ketchup + ?2`,
                    )
                    .bind(user_id, workAmount),
                db.prepare(`SELECT ketchup FROM user_data WHERE id = ?`).bind(user_id),
            ])
        )[1] as D1Result<UserDataRow>;

        const newKetchupAmount = newKetchupAmountResult.results[0].ketchup;

        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `Meow! You've claimed your daily ketchup and now have ${newKetchupAmount} packets!`,
            },
        };
    },
};

export const work: Command = {
    data: {
        name: 'work',
        description: 'Work for ketchup!',
    },
    execute: async (interaction, env) => {
        const kv: KVNamespace = env.KV;
        const db: D1Database = env.DB;
        const user_id: string = getUser(interaction).id;

        const workAmount = (await kv.get('WORK_AMOUNT')) ?? 10;

        const lastDailyResult = (
            await db.batch([
                db.prepare(`SELECT last_work FROM user_data WHERE id = ?`).bind(user_id),
                db
                    .prepare(
                        `INSERT INTO user_data (id, last_work) VALUES (?1, ?2)
                        ON CONFLICT (id) DO UPDATE SET last_work = ?2`,
                    )
                    .bind(user_id, Date.now()),
            ])
        )[0] as D1Result<UserDataRow>;
        const last_work: number = lastDailyResult.results[0]?.last_work ?? 0;

        if (Math.trunc(Date.now() / 3600000) <= Math.trunc(last_work / 3600000)) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You've already worked this hour! You can work again at <t:${Math.trunc(last_work / 3600000) * 3600 + 3600}:R>.`,
                },
            };
        }

        const newKetchupAmountResult = (
            await db.batch([
                db
                    .prepare(
                        `INSERT INTO user_data (id, ketchup) VALUES (?1, ?2)
        ON CONFLICT (id) DO UPDATE SET ketchup = ketchup + ?2`,
                    )
                    .bind(user_id, workAmount),
                db.prepare(`SELECT ketchup FROM user_data WHERE id = ?`).bind(user_id),
            ])
        )[1] as D1Result<UserDataRow>;

        const newKetchupAmount = newKetchupAmountResult.results[0].ketchup;

        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `After working, you now have ${newKetchupAmount} ketchup packets!`,
            },
        };
    },
};

export default [balance, give_ketchup, daily, work];
