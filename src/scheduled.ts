import * as DAPI from 'discord-api-types/v10';

async function sendDM(reminder: RemindersRow, env: Env): Promise<void> {
    const db: D1Database = env.DB;
    const { id, user_id, message, timestamp } = reminder;
    const getChannelResponse = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
        method: 'POST',
        body: JSON.stringify({ recipient_id: user_id }),
        headers: {
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
    if (getChannelResponse.status !== 200) {
        console.error(`Failed to open DM with user ${user_id}: ${getChannelResponse} ${getChannelResponse.statusText}`);
        console.error(await getChannelResponse.text());
        return;
    }
    const channel_id = ((await getChannelResponse.json()) as DAPI.APIChannel).id;
    const sendDMResponse = await fetch(`https://discord.com/api/v10/channels/${channel_id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
            content: `You asked me to remind you about "${message}" at <t:${timestamp}:F>.`,
        }),
        headers: {
            Authorization: `Bot ${env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    if (sendDMResponse.status !== 200) {
        console.error(`Failed to send DM to user ${user_id}: ${sendDMResponse} ${sendDMResponse.statusText}`);
        console.error(await sendDMResponse.text());
        return;
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

    await Promise.all(
        reminders.map((val, ind, arr) => {
            console.log('Test');
            return sendDM(val, env);
        }),
    );
}

export default { scheduled };
