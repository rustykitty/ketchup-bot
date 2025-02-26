import commands from './commands/commands.js';
import dotenv from 'dotenv';
import process from 'node:process';
/**
 * This file is meant to be run from the command line, and is not used by the
 * application server.  It's allowed to use node.js primitives, and only needs
 * to be run once.
 */
dotenv.config({ path: './.dev.vars' });
const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
if (!token) {
    throw new Error('The DISCORD_TOKEN environment variable is required.');
}
if (!applicationId) {
    throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
}
let commandList = Object.values(commands);
let globalCommands = [];
/**
 * @type {Object.<string, Array<import('./commands/command.js').Command>>}
 */
let guildCommands = {};
commandList.forEach((command) => {
    if (command.onlyGuilds !== undefined && command.onlyGuilds.length > 0) {
        command.onlyGuilds.forEach((guild) => {
            if (!guildCommands[guild]) {
                guildCommands[guild] = [];
            }
            guildCommands[guild].push(command.data);
        });
    }
    else {
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
}
else {
    console.error('Error registering commands');
    let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`;
    try {
        const error = await response.text();
        if (error) {
            errorText = `${errorText} \n\n ${error}`;
        }
    }
    catch (err) {
        console.error('Error reading body from request:', err);
    }
    console.error(errorText);
}
/**
 * Register guild commands
 */
if (guildCommands.size === 0) {
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
    }
    else {
        console.error(`Error registering guild commands for guild ID ${guildId}: HTTP ${response.status}`);
    }
}
