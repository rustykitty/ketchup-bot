import * as DAPI from 'discord-api-types/v10';

export function getOptionsFromOptionsObject<T = DAPI.APIApplicationCommandInteractionDataOption>(
    options: DAPI.APIApplicationCommandInteractionDataOption[] | undefined,
): Record<string, T> {
    return (options ?? []).reduce(
        (acc: Record<string, T>, curr: DAPI.APIApplicationCommandInteractionDataOption) => {
            acc[curr.name] = curr as T;
            return acc;
        },
        {} as Record<string, T>,
    );
}

/**
 * Get the options from an interaction. Does not currently support subcommands/subcommand groups.
 */
export function getOptions<T = DAPI.APIApplicationCommandInteractionDataOption>(
    interaction: DAPI.APIApplicationCommandInteraction,
): Record<string, T> {
    if (!('options' in interaction.data) || interaction.data.options === undefined) return {};

    return getOptionsFromOptionsObject(interaction.data.options);
}

export function getOptionsFromSubcommand(subcommand: DAPI.APIApplicationCommandSubcommandOption) {
    return getOptionsFromOptionsObject(
        subcommand.options as unknown as DAPI.APIApplicationCommandInteractionDataOption[],
    );
}

export function getSubcommandOptions(interaction: DAPI.APIApplicationCommandInteraction, name: string) {
    const baseOptions = getOptions(interaction);
    if (!(name in baseOptions)) {
        throw new Error(`${name} not in baseOptions`);
    }
    return getOptionsFromOptionsObject(
        (baseOptions[name] as DAPI.APIApplicationCommandSubcommandOption)
            .options as unknown as DAPI.APIApplicationCommandInteractionDataOption[],
    ) as Record<string, DAPI.APIApplicationCommandInteractionDataBasicOption>;
}

export function getUser(interaction: DAPI.APIInteraction): DAPI.APIUser {
    return interaction.guild ?
            (interaction as DAPI.APIGuildInteraction).member.user
        :   (interaction as DAPI.APIDMInteraction).user;
}

/**
 * Get subcommands. Currently only supports a single subcommand (no groups).
 */
export function getSubcommand(interaction: DAPI.APIApplicationCommandInteraction): string | null {
    const options = getOptions(interaction);
    const subcommandObj = Object.values(options).find(
        (option) => option.type === DAPI.ApplicationCommandOptionType.Subcommand,
    );
    if (!subcommandObj) {
        return null;
    }
    return subcommandObj.name;
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
