import {AutoRouter} from 'itty-router';
import {InteractionResponseFlags, InteractionResponseType, InteractionType, verifyKey,} from 'discord-interactions';
import {JsonResponse} from "./response.js";
import commands from "./commands/commandList.js";

const router = AutoRouter();

router.get('/', (request: Request, env) => {
    return new Response(`Bot is running on user ID ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', async (request: Request, env): Promise<JsonResponse> => {
    const { isValid, interaction } = await index.verifyDiscordRequest(
        request,
        env,
    );
    if (!isValid || !interaction) {
        return new Response('Bad request signature.', { status: 401 });
    }

    if (interaction.type === InteractionType.PING) {
        // The `PING` message is used during the initial webhook handshake, and is
        // required to configure the webhook in the developer portal.
        return new JsonResponse({
            type: InteractionResponseType.PONG,
        });
    } else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        if (!interaction.guild) {
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'For now, Ketchup Bot only works in servers! Sorry!'
                },
            });
        }

        // Most user commands will come as `APPLICATION_COMMAND`.
        const command = interaction.data.name.toLowerCase();
        if (commands[command]) {
            return commands[command].execute(interaction, env);
        } else {
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `Unknown command ${interaction.data.name.toLowerCase()}.`,
                },
            });
        }
    }

    console.error('Unknown Type');
    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request: Request, env: { DISCORD_PUBLIC_KEY: string; }) : Promise<{ interaction?: any, isValid: boolean }> {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body: string = await request.text();
    const isValidRequest =
        signature &&
        timestamp &&
        (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
    if (!isValidRequest) {
        return { isValid: false };
    }

    return { interaction: JSON.parse(body), isValid: true };
}

const index = {
    verifyDiscordRequest,
    fetch: router.fetch,
};

export default index;