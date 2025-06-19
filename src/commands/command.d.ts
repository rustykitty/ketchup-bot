import * as DAPI from 'discord-api-types/v10';

interface Command {
    /**
     * If set, the command is only registered in the given guilds.
     */
    onlyGuilds?: string[];
    /**
     * Overrides `onlyGuilds` if true.
     * Makes the command only available to the bot owner, and only in testing guilds.
     */
    botOwnerOnly?: boolean;
    execute: CommandExecute;
    data: DAPI.RESTPostAPIApplicationCommandsJSONBody;
}

type CommandExecute = (
    interaction: DAPI.APIApplicationCommandInteraction,
    env: Env,
    ctx: ExecutionContext,
) => Promise<DAPI.APIInteractionResponse>;
