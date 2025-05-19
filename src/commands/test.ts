import { Command } from './command.js';
import * as DAPI from 'discord-api-types/v10';
import { getOptions } from '../utility.js';

export const test: Command = {
    data: {
        name: 'test',
        description: 'A test command! Use it to make sure all the functionality is working.',
        options: [
            {
                name: 'test_parameter',
                description: 'An optional parameter.',
                type: DAPI.ApplicationCommandOptionType.String,
                required: false,
            },
        ],
    },
    /**
     * Test optional params, deferred response, embeds.
     */
    execute: async (interaction, env, ctx) => {
        const { test } = getOptions<DAPI.APIApplicationCommandInteractionDataStringOption>(interaction);
        const testParameter = test ? JSON.stringify(test.value) : '`test` parameter was not provided.';
        ctx.waitUntil(
            (async () => {
                const result = await fetch(
                    `https://discord.com/api/v10/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`,
                    {
                        method: 'PATCH',
                        body: JSON.stringify(<DAPI.APIMessage>{
                            embeds: [
                                {
                                    title: 'Test command result',
                                    description: `Test successful! Test parameter: ${testParameter}`,
                                    color: 0xff0000,
                                },
                            ],
                        }),
                        headers: {
                            Authorization: `Bot ${env.DISCORD_TOKEN}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );
                if (result.status !== 200) {
                    console.error('error: ' + result.status + ' ' + result.statusText);
                }
            })(),
        );
        return {
            type: DAPI.InteractionResponseType.DeferredChannelMessageWithSource,
        };
    },
};

export default [test];
