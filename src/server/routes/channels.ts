import type { TextChannel } from 'discord.js';

import type { Context, ServerState, ServerContext } from '..';

import { getGuild, getChannel } from '../utils';

import Router from '@koa/router';
const channelRouter = new Router<ServerState, ServerContext>({ prefix: '/channel' });

channelRouter.get('/', async (ctx, next) => {
    ctx.status = 200;
});

channelRouter.get('/:channel', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const channel = await getChannel(guild, ctx.params.channel);

    if (!channel) {
        ctx.throw(404, 'no channel found');
    }

    ctx.body = channel;
});

channelRouter.post('/:channel/send', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const channel = (await getChannel(guild, ctx.params.channel)) as TextChannel;

    if (!channel) {
        ctx.throw(404, 'no channel found');
    }

    const { message, embed } = ctx.request.body;

    if (message) {
        await channel.send(message, { embed });
    } else if (embed) {
        await channel.send({ embed });
    } else {
        await channel.send('send message route used but no message sent');
    }

    ctx.status = 201;
});

export default channelRouter;
