import Router from '@koa/router';
import type { TextChannel } from 'discord.js';
import * as Discord from 'discord.js';

import type { Context, ServerState, ServerContext } from '..';
import config from 'config';

import * as database from '../../utils/db';
import { getGuild, getMember, getChannel } from '../utils';

const router = new Router<ServerState, ServerContext>({ prefix: '/api' });

router.get('/', (ctx: Context) => {
    ctx.body = { ok: true };
});

router.get('/stats', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    ctx.body = {
        uptime: ctx.bot.client.uptime,
        members: guild.members,
        partnered: guild.partnered,
        premiumTier: guild.premiumTier,
        premiumSubscriptionCount: guild.premiumSubscriptionCount,
    };
});

router.get('/db/users', async (ctx: Context) => {
    ctx.body = await database.databases.users.find({}).sort({ updatedAt: -1 });
});

router.get('/db/messages', async (ctx: Context) => {
    ctx.body = await database.databases.messages.find({}).sort({ updatedAt: -1 }).limit(100);
});

export default router;
