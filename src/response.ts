import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

export class JsonResponse extends Response {
    constructor(
        body: {
            type?: InteractionResponseType;
            data?: { content: string } | { content: string; flags: InteractionResponseFlags };
            error?: string;
        },
        init?: ResponseInit,
    ) {
        const jsonBody = JSON.stringify(body);
        init = init ?? {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        };
        super(jsonBody, init);
    }
}
