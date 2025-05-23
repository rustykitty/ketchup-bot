import * as DAPI from 'discord-api-types/v10';
import * as chrono from 'chrono-node';

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
        const ts = Math.trunc(+date / 1000);
        if (ts <= Math.trunc(Date.now() / 1000)) {
            return {
                type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You can't set a reminder in the past!`,
                },
            };
        }
        // TODO: trigger workflow here
        await env.REMINDERS_WORKFLOW.create({
            params: {
                user_id,
                message: message.value as string,
                timestamp: ts,
            },
        });
        return {
            type: DAPI.InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `I will remind you about "${message.value}" <t:${ts}:R>.`,
            },
        };
    },
    list: async (interaction, env, ctx) => {
        // TODO: implement for workflow
        throw new Error('Not implemented');
    },
    remove: async (interaction, env, ctx) => {
        // TODO: implement for workflow
        throw new Error('Not implemented');
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
