import * as DAPI from 'discord-api-types/v10';
import * as chrono from 'chrono-node';

import { Command, Subcommand } from './command.js';
import { getSubcommandOptions, getSubcommand, getUser } from '../utility.js';

export const remind_set: Subcommand = {
    execute: async (interaction, env, ctx) => {
        const db: D1Database = env.DB;
        const user_id = getUser(interaction);
        const { time, message } = getSubcommandOptions(interaction, 'set');
        const date: Date | null = chrono.parseDate(time.value as string, {
            timezone: 'PDT',
        });
        if (date === null) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `Invalid date format.`,
                },
            };
        }
        const ts = Math.floor(+date / 1000);
        if (ts <= Math.floor(+new Date() / 1000)) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You can't set a reminder in the past!`,
                },
            };
        }
        db.prepare(
            `INSERT INTO reminders (user_id, message, timestamp) VALUES (?, ?, ?)`,
        )
            .bind(user_id, message.value, ts)
            .run();
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `I will remind you about "${message.value}" <t:${ts}:R>.`,
            },
        };
    },
};

export const remind_list: Subcommand = {
    execute: async (interaction, env, ctx) => {
        const db: D1Database = env.DB;
        const user_id = getUser(interaction);
        const result: D1Result<RemindersRow> = await db
            .prepare(`SELECT * FROM reminders WHERE user_id = ?`)
            .bind(user_id)
            .run();
        if (result.results.length === 0) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You do not have any reminders set.`,
                },
            };
        }
        const remindersText = result.results.map((element, index, array) => {
            const { id, message, timestamp } = element;
            const date = new Date(timestamp * 1000);
            return `- ${message} <t:${timestamp}:F> (ID: \`${id}\`)`;
        });
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource as any,
            data: {
                content: `You have the following reminders:\n${remindersText.join('\n')}`,
            },
        };
    },
};

export const remind_remove: Subcommand = {
    execute: async (interaction, env, ctx) => {
        const db: D1Database = env.DB;
        const user_id = getUser(interaction);
        const { id } = getSubcommandOptions(interaction, 'remove');
        const results = await db.batch([
            db
                .prepare(`SELECT * FROM reminders WHERE user_id = ? AND id = ?`)
                .bind(user_id, id.value),
            db
                .prepare(`DELETE FROM reminders WHERE user_id = ? AND id = ?`)
                .bind(user_id, id.value),
        ]);
        const reminder: RemindersRow = (results[0] as D1Result<RemindersRow>)
            .results[0];
        if (reminder) {
            return {
                type: DAPI.InteractionResponseType
                    .ChannelMessageWithSource as any,
                data: {
                    content: `Removed reminder with ID \`${id.value}\` (was "${reminder.message}", set for <t:${reminder.timestamp}:F>)`,
                },
            };
        } else {
            return {
                type: DAPI.InteractionResponseType
                    .ChannelMessageWithSource as any,
                data: {
                    content: `No reminder found with ID \`${id.value}\`. It may have already triggered or been removed.`,
                },
            };
        }
    },
};

export const remind: Command = {
    data: {
        name: 'remind',
        description: 'Manage your reminders',
        options: [
            {
                type: DAPI.ApplicationCommandOptionType.Subcommand,
                name: 'set',
                description: 'Set a reminder.',
                options: [
                    {
                        type: DAPI.ApplicationCommandOptionType.String,
                        name: 'time',
                        description: 'When do you want to be reminded?',
                        required: true,
                    },
                    {
                        type: DAPI.ApplicationCommandOptionType.String,
                        name: 'message',
                        description: 'What do you want to be reminded about?',
                        required: true,
                    },
                ],
            },
            {
                type: DAPI.ApplicationCommandOptionType.Subcommand,
                name: 'list',
                description: 'List your reminders.',
            },
            {
                type: DAPI.ApplicationCommandOptionType.Subcommand,
                name: 'remove',
                description: 'Remove a reminder.',
                options: [
                    {
                        type: DAPI.ApplicationCommandOptionType.Integer,
                        name: 'id',
                        description:
                            'The ID of the reminder to remove (gotten from /list-reminders)',
                        required: true,
                    },
                ],
            },
        ],
    },
    execute(interaction, env, ctx) {
        const subcommand = getSubcommand(interaction);
        if (!subcommand) {
            throw new Error('No subcommand found');
        } else if (subcommand === 'list') {
            return remind_list.execute(interaction, env, ctx);
        } else if (subcommand === 'set') {
            return remind_set.execute(interaction, env, ctx);
        } else if (subcommand === 'remove') {
            return remind_remove.execute(interaction, env, ctx);
        } else {
            throw new Error(`subcommand ${subcommand} not found`);
        }
    },
};
