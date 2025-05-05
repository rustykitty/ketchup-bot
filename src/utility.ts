import { InteractionResponseType, InteractionType, InteractionResponseFlags } from 'discord-interactions';

import * as DAPI from 'discord-api-types/v10';

/**
 * Get the options from an interaction. Does not currently support subcommands/subcommand groups.
 */
export function getOptions(
    interaction: DAPI.APIApplicationCommandInteraction,
): Record<string, DAPI.APIApplicationCommandInteractionDataOption> {
    if (!('options' in interaction.data) || interaction.data.options === undefined) return {};

    return interaction.data.options.reduce(
        (acc, curr) => {
            acc[curr.name] = curr;
            return acc;
        },
        {} as Record<string, DAPI.APIApplicationCommandInteractionDataOption>,
    );
}
