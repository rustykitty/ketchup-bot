import { AutoRouter } from 'itty-router';
import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from 'discord-interactions';
import { JsonResponse } from './response.js';
import commands from './commands/commands.js';
import { APIInteractionResponse } from 'discord-api-types/v10';

const router = AutoRouter();

async function verifyDiscordRequest(
    request: Request,
    env: Env,
): Promise<{ interaction?: any; isValid: boolean }> {
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

router.get('/', (request: Request, env: Env) => {
    void request; // avoid unused warning
    return new Response(
        `Bot is running on user ID ${env.DISCORD_APPLICATION_ID}`,
    );
});

router.post('/', async (request: Request, env: Env): Promise<JsonResponse<APIInteractionResponse>> => {
    const { isValid, interaction } = await verifyDiscordRequest(request, env);

    if (!isValid || !interaction) {
        return new Response('Bad request signature.', { status: 401 });
    }

    if (interaction.type === InteractionType.PING) {
        return new JsonResponse({
            type: InteractionResponseType.PONG,
        });
    } else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        if (!interaction.guild) {
            return new JsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content:
                        'For now, Ketchup Bot only works in servers! Sorry!',
                },
            });
        }

        const command: string = interaction.data.name.toLowerCase();
        const command_obj = commands.find((c) => c.data.name === command);
        if (command_obj) {
            try {
                return new JsonResponse(
                    await command_obj.execute(interaction, env),
                );
            } catch (e: any) {
                console.error(e);
                return new JsonResponse({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {
                        content:
                            'An error occurred: \n' +
                            ('stack' in e ? e.stack : e),
                    },
                });
            }
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

const index = {
    verifyDiscordRequest,
    fetch: router.fetch,
};

export default index;
