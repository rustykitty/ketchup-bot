import * as DAPI from 'discord-api-types/v10';
import { send } from 'node:process';
import { sleep } from './utility.js';

// user ID to DM channel ID
const cache: Record<string, string> = {};

async function openDM(userId: string, env: Env): Promise<string> {
    if (cache[userId]) return cache[userId];
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
        // eslint-disable-next-line require-atomic-updates
        cache[userId] = channel;
        return channel;
    }
}

async function sendDM(reminder: RemindersRow, env: Env): Promise<void> {
    const db: D1Database = env.DB;
    const { id, user_id, message, timestamp } = reminder;
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
    await db.prepare('DELETE FROM reminders WHERE id = ?').bind(id).run();
}

export async function scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const db: D1Database = env.DB;
    const reminders: RemindersRow[] = (
        (await db
            .prepare('SELECT * FROM reminders WHERE timestamp <= ? ORDER BY timestamp ASC')
            .bind(controller.scheduledTime / 1000)
            .run()) as D1Result<RemindersRow>
    ).results;

    for (const reminder of reminders) {
        await sendDM(reminder, env);
    }
}

export default { scheduled };
