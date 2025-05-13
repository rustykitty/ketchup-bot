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
    options?: DAPI.APIApplicationCommandOption[];
    execute: (
        interaction: DAPI.APIApplicationCommandGuildInteraction,
        env: Env,
    ) => Promise<DAPI.APIInteractionResponse>;
    data: DAPI.RESTPostAPIApplicationCommandsJSONBody;
}
