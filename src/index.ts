import { AutoRouter } from 'itty-router';
import { verifyKey } from 'discord-interactions';
import { JsonResponse } from './response.js';
import commands from './commands/commands.js';
import * as DAPI from 'discord-api-types/v10';

const router = AutoRouter();

async function verifyDiscordRequest(
    request: Request,
    env: Env,
): Promise<{ interaction?: DAPI.APIInteraction; isValid: boolean }> {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body: string = await request.text();
    const isValidRequest =
        signature && timestamp && (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
    if (!isValidRequest) {
        return { isValid: false };
    }

    const interaction: DAPI.APIInteraction = JSON.parse(body);

    return { interaction, isValid: true };
}

router.get('/', (request: Request, env: Env) => {
    void request; // avoid unused warning
    return new Response(`Bot is running on user ID ${env.DISCORD_APPLICATION_ID}`);
});

router.post(
    '/',
    async (request: Request, env: Env, ctx: ExecutionContext): Promise<JsonResponse<DAPI.APIInteractionResponse>> => {
        const { isValid, interaction } = await verifyDiscordRequest(request, env);

        if (!isValid || !interaction) {
            return new Response('Bad request signature.', { status: 401 });
        }

        if (interaction.type === DAPI.InteractionType.Ping) {
            return new JsonResponse({
                type: DAPI.InteractionResponseType.Pong,
            });
        } else if (interaction.type === DAPI.InteractionType.ApplicationCommand) {
            const command: string = interaction.data.name.toLowerCase();
            const command_obj = commands.find((c) => c.data.name === command);
            if (command_obj) {
                try {
                    return new JsonResponse(
                        await command_obj.execute(interaction as DAPI.APIApplicationCommandInteraction, env, ctx),
                    );
                } catch (e: any) {
                    console.error(e);
                    return new JsonResponse({
                        type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                        data: {
                            content: 'An error occurred: \n' + ('stack' in e ? e.stack : e),
                        },
                    });
                }
            } else {
                return new JsonResponse({
                    type: DAPI.InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        content: `Unknown command ${interaction.data.name.toLowerCase()}.`,
                    },
                });
            }
        }

        console.error('Unknown Type');
        return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
    },
);

router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
    verifyDiscordRequest,
    fetch: router.fetch
};
