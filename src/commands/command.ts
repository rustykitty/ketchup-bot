import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import * as DAPI from "discord-api-types/v10";

interface Command {
    name: string;
    description: string;
    options?: any[];
    execute: (interaction: DAPI.APIApplicationCommandGuildInteraction, env: Env) => Promise<Response>;
}

export { Command };