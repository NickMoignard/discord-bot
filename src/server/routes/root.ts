import Router from '@koa/router';

import type { Context, ServerState, ServerContext } from '..';

import * as database from '../../utils/db';
import { getGuild } from '../utils';

import clientRouter from './clients';
import channelRouter from './channels';
import userRouter from './users';

const rootRouter = new Router<ServerState, ServerContext>({ prefix: '/api' });

rootRouter.get('/', (ctx: Context) => {
    ctx.body = { ok: true };
});

rootRouter.get('/stats', async (ctx: Context) => {
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

rootRouter.get('/db/users', async (ctx: Context) => {
    ctx.body = await database.databases.users.find({}).sort({ updatedAt: -1 });
});

rootRouter.get('/db/messages', async (ctx: Context) => {
    ctx.body = await database.databases.messages.find({}).sort({ updatedAt: -1 }).limit(100);
});

rootRouter.use(clientRouter.routes());
rootRouter.use(clientRouter.allowedMethods());
rootRouter.use(channelRouter.routes());
rootRouter.use(channelRouter.allowedMethods());
rootRouter.use(userRouter.routes());
rootRouter.use(userRouter.allowedMethods());

export default rootRouter;
