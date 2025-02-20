import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import { APIApplicationCommandInteraction } from "discord-api-types/v10";

interface Command {
    name: string;
    description: string;
    options?: any[];
    execute: (interaction: APIApplicationCommandInteraction, env: any) => Response;
}

export { Command };