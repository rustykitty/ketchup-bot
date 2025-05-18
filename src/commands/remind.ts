import * as DAPI from 'discord-api-types/v10';
import * as chrono from 'chrono-node';

import { Command, SubcommandExecute } from './command.js';
import { getSubcommandOptions, getSubcommand, getUser } from '../utility.js';

const remind_set: SubcommandExecute = async (interaction, env, ctx) => {
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
    const ts = +date;
    if (ts <= Date.now()) {
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `You can't set a reminder in the past!`,
            },
        };
    }
    db.prepare(`INSERT INTO reminders (user_id, message, timestamp) VALUES (?, ?, ?)`)
        .bind(user_id, message.value, ts)
        .run();
    return {
        type: DAPI.InteractionResponseType.ChannelMessageWithSource,
        data: {
            content: `I will remind you about "${message.value}" <t:${ts}:R>.`,
        },
    };
};

const remind_list: SubcommandExecute = async (interaction, env, ctx) => {
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
};
const remind_remove: SubcommandExecute = async (interaction, env, ctx) => {
    const db: D1Database = env.DB;
    const user_id = getUser(interaction);
    const { id } = getSubcommandOptions(interaction, 'remove');
    const results = await db.batch([
        db.prepare(`SELECT * FROM reminders WHERE user_id = ? AND id = ?`).bind(user_id, id.value),
        db.prepare(`DELETE FROM reminders WHERE user_id = ? AND id = ?`).bind(user_id, id.value),
    ]);
    const reminder: RemindersRow = (results[0] as D1Result<RemindersRow>).results[0];
    if (reminder) {
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource as any,
            data: {
                content: `Removed reminder with ID \`${id.value}\` (was "${reminder.message}", set for <t:${reminder.timestamp}:F>)`,
            },
        };
    } else {
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource as any,
            data: {
                content: `No reminder found with ID \`${id.value}\`. It may have already triggered or been removed.`,
            },
        };
    }
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
                        description: 'The ID of the reminder to remove (gotten from /reminder list)',
                        required: true,
                    },
                ],
            },
        ],
    },
    execute(interaction, env, ctx) {
        const subcommands: Record<string, SubcommandExecute> = {
            set: remind_set,
            list: remind_list,
            remove: remind_remove,
        };
        const subcommand = getSubcommand(interaction);
        if (!subcommand) {
            throw new Error('No subcommand found');
        } else {
            const func = subcommands[subcommand];
            if (!func) {
                throw new Error(`No such subcommand ${subcommand}`);
            } else {
                return func(interaction, env, ctx);
            }
        }
    },
};

export default [remind];
