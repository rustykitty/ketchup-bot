import * as DAPI from 'discord-api-types/v10';

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

interface Subcommand {
    execute: (
        interaction: DAPI.APIApplicationCommandGuildInteraction,
        env: Env,
        ctx: ExecutionContext,
    ) => Promise<DAPI.APIInteractionResponse>;
}
