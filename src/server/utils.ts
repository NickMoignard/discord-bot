import type { Guild, GuildMember, GuildChannel, Permissions, Channel } from 'discord.js';

import type { Context } from '.';

export const getGuild = async (ctx: Context): Promise<Guild | undefined> => {
    let guild = ctx.bot.client.guilds.cache.first();

    if (!guild) {
        return;
    }

    if (!guild.available) {
        guild = await guild.fetch();
    }

    return guild;
};

export const getMember = (guild: Guild, user: string): GuildMember | undefined => {
    let member;

    if (user.includes('#')) {
        const [username, discriminator] = user.split('#');

        member = guild.members.cache.find(
            (member) => member.user.username === username && member.user.discriminator === discriminator,
        );
    } else {
        member = guild.members.cache.find((member) => member.id === user);
    }

    return member;
};

export const getChannel = (guild: Guild, channel: string): GuildChannel | undefined => {
    return guild.channels.cache.find(({ id }) => id === channel);
};

// export const compute_base_permissions = (member: GuildMember, guild: Guild): Permissions => {
//     return new Permissions;
// };

// export const compute_overwrites = (
//     base_permissions: Permissions,
//     member: GuildMember,
//     channel: GuildChannel,
// ): Permissions | undefined => {
//     return;
// };

// export const compute_permissions = (member: GuildMember, channel: GuildChannel): Permissions | undefined => {
//     var base_permissions = compute_base_permissions(member, channel.guild);
//     return compute_overwrites(base_permissions, member, channel);
// };
