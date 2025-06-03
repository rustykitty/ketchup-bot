import * as DAPI from 'discord-api-types/v10';
import * as chrono from 'chrono-node';
import * as uuid from 'uuid';

import { Command, SubcommandExecute } from './command.js';
import { getSubcommandOptions, getSubcommand, getUser } from '../utility.js';

const subcommands: Record<string, SubcommandExecute> = {
    set: async (interaction, env, ctx) => {
        const db: D1Database = env.DB;
        const user_id = getUser(interaction).id;
        const { time, message } = getSubcommandOptions(interaction);
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
        const timestamp = +date;
        if (timestamp <= Date.now()) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You can't set a reminder in the past!`,
                },
            };
        }
        const id = uuid.v4();
        ctx.waitUntil(
            env.REMINDERS_WORKFLOW.create({
                id: id,
                params: {
                    id,
                    user_id,
                    message: message.value as string,
                    timestamp,
                },
            }),
        );
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `I will remind you about "${message.value}" <t:${Math.trunc(timestamp / 1000)}:R>.`,
            },
        };
    },
    list: async (interaction, env, ctx) => {
        const db: D1Database = env.DB;
        const user_id = getUser(interaction).id;
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
            return `- ${message} <t:${Math.trunc(timestamp / 1000)}:F> (ID: \`${id}\`)`;
        });
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `You have the following reminders:\n${remindersText.join('\n')}`,
            },
        };
    },
    remove: async (interaction, env, ctx) => {
        const db: D1Database = env.DB;
        const user_id = getUser(interaction).id;
        const { id } = getSubcommandOptions<DAPI.APIApplicationCommandInteractionDataStringOption>(interaction);
        const results = await db.batch([
            db.prepare(`SELECT * FROM reminders WHERE user_id = ? AND id = ?`).bind(user_id, id.value),
            db.prepare(`DELETE FROM reminders WHERE user_id = ? AND id = ?`).bind(user_id, id.value),
        ]);
        const reminder: RemindersRow | undefined = (results[0] as D1Result<RemindersRow>).results[0];
        if (reminder) {
            (await env.REMINDERS_WORKFLOW.get(reminder.id)).terminate();
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `Removed reminder with ID \`${id.value}\` (was "${reminder.message}", set for <t:${Math.trunc(reminder.timestamp / 1000)}:F>)`,
                },
            };
        } else {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
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
                        type: DAPI.ApplicationCommandOptionType.String,
                        name: 'id',
                        description: 'The ID of the reminder to remove (gotten from /reminder list)',
                        required: true,
                    },
                ],
            },
        ],
    },
    execute: async (interaction, env, ctx) => {
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
