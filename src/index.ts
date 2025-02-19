import {AutoRouter} from 'itty-router';
// import commands from './commandData.js';
import {InteractionResponseFlags, InteractionResponseType, InteractionType, verifyKey,} from 'discord-interactions';
import {JsonResponse} from "./response";

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
        // Most user commands will come as `APPLICATION_COMMAND`.
        switch (interaction.data.name.toLowerCase()) {
            case 'ping': {
                return new JsonResponse({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'Pong!',
                    },
                });
            }
            case 'ping-ephemeral':
                return new JsonResponse({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content: 'Pong!',
                        flags: InteractionResponseFlags.EPHEMERAL
                    }
                });
            default:
                return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
        }
    }

    console.error('Unknown Type');
    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});

router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request: Request, env) : Promise<{ interaction?: any, isValid: boolean }> {
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

