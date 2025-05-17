import * as DAPI from 'discord-api-types/v10';

interface Subcommand {
    execute: (
        interaction: DAPI.APIApplicationCommandGuildInteraction,
        env: Env,
        ctx: ExecutionContext,
    ) => Promise<DAPI.APIInteractionResponse>;
}

interface Command {
    onlyGuilds?: string[];
    /**
     * If true, overrides `onlyGuilds`!
     */
    botOwnerOnly?: boolean;
    execute: (
        interaction: DAPI.APIApplicationCommandGuildInteraction,
        env: Env,
        ctx: ExecutionContext,
    ) => Promise<DAPI.APIInteractionResponse>;
    data: DAPI.RESTPostAPIApplicationCommandsJSONBody;
    subcommands?: Subcommand[];
}
