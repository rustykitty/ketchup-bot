import * as DAPI from '@/types/dapi.js';
import { LRUCache } from 'lru-cache';
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

import { sleep } from './utility.js';

const channelIdCache = new LRUCache<string, string>({
    max: 32,
});

async function openDM(userId: string, env: Env): Promise<string> {
    if (channelIdCache.has(userId)) return channelIdCache.get(userId)!;
    while (true) {
        const response = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
            method: 'POST',
            body: JSON.stringify({ recipient_id: userId }),
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
            console.error(`Failed to open DM with user ${userId}: ${response} ${response.statusText}`);
            console.error(await response.text());
            throw new Error(`Failed to open DM with user ${userId}`);
        }
        const channel = (await response.json<DAPI.APIChannel>()).id;
        channelIdCache.set(userId, channel);
        return channel;
    }
}

async function sendReminderDM(reminder: Reminder, env: Env): Promise<void> {
    const db: D1Database = env.DB;
    const { user_id, message, timestamp } = reminder;
    const channelId = await openDM(user_id, env);
    while (true) {
        const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                content: `You asked me to remind you about "${message}" at <t:${Math.trunc(timestamp / 1000)}:F>.`,
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
        const { id, user_id, message, timestamp } = params;
        step.do('add reminder to db', async () => {
            const db: D1Database = this.env.DB;
            await db
                .prepare(`INSERT INTO reminders (id, user_id, message, timestamp) VALUES (?, ?, ?, ?)`)
                .bind(id, user_id, message, timestamp)
                .run();
        });
        await step.sleep('sleep until time for reminder', timestamp - Date.now());
        // currently, sendDM handled retry logic but I'd like to move it here
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
        step.do('remove reminder from db', async () => {
            const db: D1Database = this.env.DB;
            await db.prepare(`DELETE FROM reminders WHERE id = ?`).bind(id).run();
        });
    }
}
