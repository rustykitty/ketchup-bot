import { InteractionResponseType, InteractionType, InteractionResponseFlags } from 'discord-interactions';
import * as DAPI from 'discord-api-types/v10';

interface Command {
    onlyGuilds?: string[];
    /**
     * If true, overrides `onlyGuilds`
     */
    botOwnerOnly?: boolean;
    options?: any[];
    execute: (interaction: DAPI.APIApplicationCommandGuildInteraction, env: Env) => Promise<Response>;
    data: DAPI.RESTPostAPIApplicationCommandsJSONBody;
}

export { Command };
