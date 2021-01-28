import type { Context, ServerState, ServerContext } from '..';

import * as database from '../../utils/db';
import { getGuild, getMember } from '../utils';

import Router from '@koa/router';
const userRouter = new Router<ServerState, ServerContext>({ prefix: '/user' });

userRouter.get('/', async (ctx, next) => {
    ctx.status = 200;
});

userRouter.get('/:user', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    ctx.body = member;
});

userRouter.get('/:user/roles', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    ctx.body = member.roles.cache.toJSON();
});

userRouter.post('/:user/roles', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    const { role } = ctx.request.body;

    if (member.roles.cache.has(role)) {
        ctx.status = 204;
        return;
    }

    await member.roles.add(role);

    ctx.status = 201;
});

userRouter.delete('/:user/roles/:role', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    if (!member.roles.cache.has(ctx.params.role)) {
        ctx.status = 204;
        return;
    }

    await member.roles.remove(ctx.params.role);

    ctx.status = 204;
});

userRouter.get('/:user/messages', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    ctx.body = await database.databases.messages.find({ userID: member.user.id }).sort({ createdAt: -1 });
});

userRouter.post('/:user/kick', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    if (!member.kickable) {
        ctx.throw(406, 'user is not kickable');
    }

    await member.kick(ctx.request.body.reason);

    ctx.status = 204;
});

userRouter.post('/:user/ban', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    if (!member.bannable) {
        ctx.throw(406, 'user is not bannable');
    }

    await member.ban({
        days: ctx.request.body.days || 1,
        reason: ctx.request.body.reason,
    });

    ctx.status = 204;
});

userRouter.post('/:user/send', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    const member = await getMember(guild, ctx.params.user);

    if (!member) {
        ctx.throw(404, 'no user found');
    }

    const { message, embed } = ctx.request.body;

    if (message) {
        await member.send(message, { embed });
    } else {
        await member.send({ embed });
    }

    ctx.status = 201;
});

export default userRouter;
