import type { TextChannel } from 'discord.js';
import * as Discord from 'discord.js';

import type { Context, ServerState, ServerContext } from '..';
import config from 'config';

import * as database from '../../utils/db';
import { getGuild, getMember, getChannel } from '../utils';

import Router from '@koa/router';
const router = new Router<ServerState, ServerContext>({ prefix: '/client' });

router.get('/', async (ctx, next) => {
    ctx.status = 200;
});

router.delete('/:category_channel_id', async (ctx: Context) => {
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

router.post('/new', async (ctx: Context) => {
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

export default router;
