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
    execute: (interaction: DAPI.APIApplicationCommandInteraction, env: any) => Response;
}

function getOptions(interaction: DAPI.APIApplicationCommandInteraction): DAPI.APIApplicationCommandInteractionDataOption[] {
    if ('options' in interaction.data && interaction.data.options) {
        return interaction.data.options;
    } else {
        return [];
    }
}

export { Command, getOptions };