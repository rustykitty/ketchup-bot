import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import * as DAPI from "discord-api-types/v10";

interface Command {
    name: string;
    /**
	 * If specified, the command will be a guild command and only work in these guilds
	 */
	onlyGuilds?: string[];
    description: string;
    options?: any[];
    execute: (interaction: DAPI.APIApplicationCommandGuildInteraction, env: Env) => Promise<Response>;
}

export { Command };
