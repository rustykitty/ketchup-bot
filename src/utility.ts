import * as DAPI from 'discord-api-types/v10';

export function getOptionsFromArray<
    T extends
        DAPI.APIApplicationCommandInteractionDataBasicOption['value'] = DAPI.APIApplicationCommandInteractionDataBasicOption['value'],
>(options: DAPI.APIApplicationCommandInteractionDataOption[] | undefined) {
    return (options ?? []).reduce(
        (acc, curr: DAPI.APIApplicationCommandInteractionDataOption) => {
            acc[curr.name] = (curr as DAPI.APIApplicationCommandInteractionDataBasicOption).value as T;
            return acc;
        },
        {} as Record<string, T>,
    );
}

/**
 * Get the basic options from an interaction. You will have to use getSubcommand()/getSubcommandOptions() for subcommands.
 */
export function getOptions<
    T extends
        DAPI.APIApplicationCommandInteractionDataBasicOption['value'] = DAPI.APIApplicationCommandInteractionDataBasicOption['value'],
>(interaction: DAPI.APIApplicationCommandInteraction): Record<string, T> {
    if (!('options' in interaction.data) || interaction.data.options === undefined) return {};

    return getOptionsFromArray(interaction.data.options);
}

/**
 * Get subcommands. Currently only supports a single subcommand (no groups).
 */
export function getSubcommand(interaction: DAPI.APIApplicationCommandInteraction): string | null {
    const options = 'options' in interaction.data ? (interaction.data.options ?? []) : [];
    const subcommandObj = Object.values(options).find(
        (option) => option.type === DAPI.ApplicationCommandOptionType.Subcommand,
    );
    if (!subcommandObj) {
        return null;
    }
    return subcommandObj.name;
}

export function getSubcommandOptions<T = DAPI.APIApplicationCommandInteractionDataBasicOption['value']>(
    interaction: DAPI.APIApplicationCommandInteraction,
) {
    const baseOptions = 'options' in interaction.data ? (interaction.data.options ?? []) : [];
    const subcommandOption = (baseOptions ?? {}).find(
        (option) => option.type === DAPI.ApplicationCommandOptionType.Subcommand,
    );
    if (!subcommandOption) {
        throw new Error('subcommand not found');
    }
    return getOptionsFromArray(
        (subcommandOption as DAPI.APIApplicationCommandSubcommandOption)
            .options as unknown[] as DAPI.APIApplicationCommandInteractionDataOption[],
    ) as Record<string, T>;
}

export function getUser(interaction: DAPI.APIInteraction): DAPI.APIUser {
    return interaction.guild ?
            (interaction as DAPI.APIGuildInteraction).member.user
        :   (interaction as DAPI.APIDMInteraction).user;
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
