import * as DAPI from 'discord-api-types/v10';
import { Command } from './commands/command.js';

export function getOptionsFromOptionsObject(
    options: DAPI.APIApplicationCommandInteractionDataOption[] | undefined,
): Record<string, DAPI.APIApplicationCommandInteractionDataOption> {
    return (options ?? []).reduce(
        (acc, curr) => {
            acc[curr.name] = curr;
            return acc;
        },
        {} as Record<string, DAPI.APIApplicationCommandInteractionDataOption>,
    );
}

/**
 * Get the options from an interaction. Does not currently support subcommands/subcommand groups.
 */
export function getOptions(
    interaction: DAPI.APIApplicationCommandInteraction,
): Record<string, DAPI.APIApplicationCommandInteractionDataOption> {
    if (
        !('options' in interaction.data) ||
        interaction.data.options === undefined
    )
        return {};

    return getOptionsFromOptionsObject(interaction.data.options);
}

export function getOptionsFromSubcommand(
    subcommand: DAPI.APIApplicationCommandSubcommandOption,
) {
    return getOptionsFromOptionsObject(
        subcommand.options as unknown as DAPI.APIApplicationCommandInteractionDataOption[],
    );
}

export function getSubcommandOptions(
    interaction: DAPI.APIApplicationCommandInteraction,
    name: string,
) {
    const baseOptions = getOptions(interaction);
    if (!(name in baseOptions)) {
        throw new Error(`${name} not in baseOptions`);
    }
    return getOptionsFromOptionsObject(
        (baseOptions[name] as DAPI.APIApplicationCommandSubcommandOption)
            .options as unknown as DAPI.APIApplicationCommandInteractionDataOption[],
    ) as Record<string, DAPI.APIApplicationCommandInteractionDataBasicOption>;
}

export function getUser(interaction: DAPI.APIInteraction): string {
    // @ts-expect-error
    return interaction.guild ? interaction.member.user.id : interaction.user.id;
}

/**
 * Get subcommands. Currently only supports a single subcommand (no groups).
 */
export function getSubcommand(
    interaction: DAPI.APIApplicationCommandInteraction,
): string | null {
    const options = getOptions(interaction);
    const subcommandObj = Object.values(options).find(
        (option) =>
            option.type === DAPI.ApplicationCommandOptionType.Subcommand,
    );
    if (!subcommandObj) {
        return null;
    }
    return subcommandObj.name;
}
