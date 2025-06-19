import commands from './commands/commands.js';
import dotenv from 'dotenv';
import process from 'node:process';
import * as DAPI from 'discord-api-types/v10';

dotenv.config();

const prod = process.env.PROD;

const token = prod ? process.env.PROD_DISCORD_TOKEN : process.env.DEV_DISCORD_TOKEN;
const applicationId = prod ? process.env.PROD_DISCORD_APPLICATION_ID : process.env.DEV_DISCORD_APPLICATION_ID;
const discordAdminServerId = process.env.DISCORD_ADMIN_SERVER_ID ?? '';

if (!token || !applicationId || !process.env.DISCORD_ADMIN_SERVER_ID) {
    console.error(`Missing environment variables. Ensure the following are set:
        When PROD is set:
            PROD_DISCORD_TOKEN
            PROD_DISCORD_APPLICATION_ID
        When PROD is not set:
            DEV_DISCORD_TOKEN
            DEV_DISCORD_APPLICATION_ID
        Regardless of PROD:
            DISCORD_ADMIN_SERVER_ID`);
    process.exit(1);
}

if (prod) {
    console.log('registering prod commands, unset PROD to register dev commands');
} else {
    console.log('registering dev commands, set PROD to register prod commands');
}

const globalCommands: DAPI.RESTPostAPIApplicationCommandsJSONBody[] = [];

// map guild ID to list of commands
const guildCommands: Record<string, DAPI.RESTPostAPIApplicationCommandsJSONBody[]> = {};

commands.forEach((command) => {
    if (command.botOwnerOnly) {
        command.onlyGuilds = [discordAdminServerId];
    }

    if (command.onlyGuilds !== undefined && command.onlyGuilds.length > 0) {
        command.onlyGuilds.forEach((guild) => {
            if (!guildCommands[guild]) {
                guildCommands[guild] = [];
            }
            guildCommands[guild].push(command.data);
        });
    } else {
        globalCommands.push(command.data);
    }
});

/**
 * Register all commands globally.  This can take o(minutes), so wait until
 * you're sure these are the commands you want.
 */
const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;
const response = await fetch(url, {
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
    },
    method: 'PUT',
    body: JSON.stringify(globalCommands),
});
if (response.ok) {
    console.log('Registered all commands');
} else {
    console.error('Error registering commands');
    let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`;
    try {
        const error = await response.text();
        if (error) {
            errorText = `${errorText} \n\n ${error}`;
        }
    } catch (err) {
        console.error('Error reading body from request:', err);
    }
    console.error(errorText);
}

/**
 * Register guild commands
 */
if (Object.keys(guildCommands).length === 0) {
    console.log('No guild commands to register.');
}

for (const guildId in guildCommands) {
    const commandsToRegister = guildCommands[guildId];
    const apiEndpoint = `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`;
    const response = await fetch(apiEndpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${token}`,
        },
        method: 'PUT',
        body: JSON.stringify(commandsToRegister),
    });
    if (response.ok) {
        console.log(`Successfully registered guild commands for guild ID ${guildId}.`);
    } else {
        console.error(`Error registering guild commands for guild ID ${guildId}: HTTP ${response.status}`);
    }
}
