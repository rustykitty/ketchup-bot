import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
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
}
