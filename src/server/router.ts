import Router from '@koa/router';
import type { TextChannel } from 'discord.js';
import * as Discord from 'discord.js';

import type { Context, ServerState, ServerContext } from './';
import config from 'config';

import * as database from '../utils/db';
import { getGuild, getMember, getChannel } from './utils';

const router = new Router<ServerState, ServerContext>();

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

router.get('/channel/:channel', async (ctx: Context) => {
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

router.post('/channel/:channel/send', async (ctx: Context) => {
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

router.get('/user/:user', async (ctx: Context) => {
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

router.get('/user/:user/roles', async (ctx: Context) => {
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

router.post('/user/:user/roles', async (ctx: Context) => {
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

router.delete('/user/:user/roles/:role', async (ctx: Context) => {
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

router.get('/user/:user/messages', async (ctx: Context) => {
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

router.post('/user/:user/kick', async (ctx: Context) => {
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

router.post('/user/:user/ban', async (ctx: Context) => {
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

router.post('/user/:user/send', async (ctx: Context) => {
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

router.get('/db/users', async (ctx: Context) => {
    ctx.body = await database.databases.users.find({}).sort({ updatedAt: -1 });
});

router.get('/db/messages', async (ctx: Context) => {
    ctx.body = await database.databases.messages.find({}).sort({ updatedAt: -1 }).limit(100);
});
router.delete('/client/:category_channel_id', async (ctx: Context) => {
    try {
        const guild = await getGuild(ctx);

        if (!guild) {
            ctx.throw(500, 'failed to get the guild');
        }
        var category = guild.channels.cache.get(ctx.params.category_channel_id) as Discord.CategoryChannel;

        category.children.each((channel) => {
            channel.delete();
        });
        category.delete();
        ctx.status = 204;
    } catch (err) {
        ctx.status = 500;
    }
});

router.post('/new_client', async (ctx: Context) => {
    const guild = await getGuild(ctx);

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    var channel;
    var clientPerms = { VIEW_CHANNEL: true };

    var internalChannel = guild.channels.cache.get(config.get<string>('defaultInternal')) as Discord.GuildChannel;
    var infoChannel = guild.channels.cache.get(config.get<string>('defaultInfo')) as Discord.GuildChannel;

    var infoPMPerms = infoChannel
        .permissionsFor(config.get<string>('roles.pm'))
        ?.serialize() as Discord.PermissionOverwriteOption;

    var infoAdminPerms = infoChannel
        .permissionsFor(config.get<string>('roles.admin'))
        ?.serialize() as Discord.PermissionOverwriteOption;

    var internalCreativePerms = internalChannel
        .permissionsFor(config.get<string>('roles.creative'))
        ?.serialize() as Discord.PermissionOverwriteOption;

    var internalTeamPerms = internalChannel
        .permissionsFor(config.get<string>('roles.team'))
        ?.serialize() as Discord.PermissionOverwriteOption;
    try {
        await guild.channels
            .create(`${ctx.request.body.client_name}`, { reason: 'New Client', type: 'category' })
            .then((category) => {
                ctx.body = { category_id: `${category.id}` };
                ctx.status = 200;

                guild.channels
                    .create('info', {
                        type: 'text',
                    })
                    .then((channel) => {
                        channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: false });
                        channel.updateOverwrite(config.get<string>('roles.pm'), infoPMPerms);
                        channel.updateOverwrite(config.get<string>('roles.admin'), infoAdminPerms);
                        channel.updateOverwrite(ctx.request.body.client_id, clientPerms);
                        channel.setParent(category.id);
                    })
                    .catch(console.error);

                guild.channels
                    .create('general', {
                        type: 'text',
                    })
                    .then((channel) => {
                        channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: true });
                        channel.setParent(category.id);
                    })
                    .catch(console.error);

                guild.channels
                    .create('design', {
                        type: 'text',
                    })
                    .then((channel) => {
                        channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: false });
                        channel.updateOverwrite(config.get<string>('roles.creative'), internalCreativePerms);
                        channel.updateOverwrite(config.get<string>('roles.pm'), infoPMPerms);
                        channel.updateOverwrite(config.get<string>('roles.admin'), infoAdminPerms);
                        channel.updateOverwrite(config.get<string>('roles.team'), internalTeamPerms);
                        channel.setParent(category.id);
                    })
                    .catch(console.error);

                guild.channels
                    .create('code', {
                        type: 'text',
                    })
                    .then((channel) => {
                        channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: false });
                        channel.updateOverwrite(config.get<string>('roles.creative'), internalCreativePerms);
                        channel.updateOverwrite(config.get<string>('roles.pm'), infoPMPerms);
                        channel.updateOverwrite(config.get<string>('roles.admin'), infoAdminPerms);
                        channel.updateOverwrite(config.get<string>('roles.team'), internalTeamPerms);
                        channel.setParent(category.id);
                    })
                    .catch(console.error);

                guild.channels
                    .create('production-and-logistics', {
                        type: 'text',
                    })
                    .then((channel) => {
                        channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: false });
                        channel.updateOverwrite(config.get<string>('roles.creative'), internalCreativePerms);
                        channel.updateOverwrite(config.get<string>('roles.pm'), infoPMPerms);
                        channel.updateOverwrite(config.get<string>('roles.admin'), infoAdminPerms);
                        channel.updateOverwrite(config.get<string>('roles.team'), internalTeamPerms);
                        channel.setParent(category.id);
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    } catch (err) {
        ctx.status = 500;
    }
});

router.post('/new_campaign', async (ctx: Context) => {
    const guild = await getGuild(ctx);
    var categoryId = ctx.request.body.client_category;

    if (!guild) {
        ctx.throw(500, 'failed to get the guild');
    }

    // Permissions
    // Airtable
    // Embed

    guild.channels
        .create(`${ctx.request.body.campaign_name}`, {
            type: 'text',
            reason: 'New Campaign',
        })
        .then((channel) => {
            channel.setParent(categoryId);
        })
        .catch(console.error);
});

export { router };
