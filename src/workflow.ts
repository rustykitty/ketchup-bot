import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

import { openDM } from './scheduled.js';
import { sleep } from './utility.js';

async function sendReminderDM(reminder: RemindersRow, env: Env): Promise<void> {
    const db: D1Database = env.DB;
    const { id } = reminder;
    const { user_id, message, timestamp } = reminder.reminder;
    const channelId = await openDM(user_id, env);
    while (true) {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                content: `You asked me to remind you about "${message}" at <t:${timestamp}:F>.`,
            }),
            headers: {
                Authorization: `Bot ${env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 429) {
            const { retry_after } = await response.json<{ retry_after: number }>();
            await sleep(Math.trunc(retry_after * 1000));
            continue;
        } else if (!response.ok) {
            console.error(`Failed to send DM to user ${user_id}: ${response} ${response.statusText}`);
            console.error(await response.text());
            return;
        }
        break;
    }
}


export class RemindersWorkflow extends WorkflowEntrypoint<Env, RemindersRow> {
    constructor(ctx: ExecutionContext, env: Env) {
        super(ctx, env);
    }

    async run(event: WorkflowEvent<RemindersRow>, step: WorkflowStep): Promise<void> {
        const params: RemindersRow = event.payload;
        const { timestamp } = params.reminder;
        step.sleep('sleep until time for reminder', timestamp - +event.timestamp);
        // currently, sendDM handled retry logic but we'd like to move it here
        step.do(
            'send reminder',
            {
                retries: {
                    limit: 5,
                    delay: 1000,
                },
            },
            async () => {
                await sendReminderDM(params, this.env);
            },
        );
    }
}
