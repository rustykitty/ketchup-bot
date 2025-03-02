import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';

import * as DAPI from "discord-api-types/v10";

export function getOptions(interaction: DAPI.APIApplicationCommandInteraction): Record<string, DAPI.APIApplicationCommandInteractionDataOption> {
    if (!('options' in interaction.data) || interaction.data.options === undefined) return {};
    
    let res: Record<string, DAPI.APIApplicationCommandInteractionDataOption> = {};

    for (let option of interaction.data.options) {
        res[option.name] = option;
    }

    return res;
}
