import config from 'config';
import * as Discord from 'discord.js';

import BaseWatcher from './BaseWatcher';
import logger from '../utils/logger';
import { isProductionEnvironment } from '../utils/env';

/**
 * This watcher checks for people using bad tags such as @here, @all and @everyone.
 */
class JoinWatcher extends BaseWatcher {
    /**
     * The methods this watcher should listen on.
     */
    methods: Array<keyof Discord.ClientEvents> = ['guildMemberAdd'];

    /**
     * Only enable this on production so that users are not getting double messages on join while testing the bot.
     */
    enabled = isProductionEnvironment();

    /**
     * The function that should be called when the event is fired.
     */
    async action(method: keyof Discord.ClientEvents, ...args: Discord.ClientEvents['guildMemberAdd']) {
        const member = args[0];

        if (!(await this.hasUserBeenSentJoinMessage(member))) {
            logger.debug(`Member ${member.displayName} (${member.id}) joined for the first time`);
            this.addHasBeenSentJoinMessage(member);

            await member.send(
                `Welcome to the Revolt Discord server. My name is ${this.bot.client.user?.username}, I'm here to help run the server.

Below are some links that you can look over to become familiar with the server.`,
            );

            const rulesChannel = this.bot.client.channels.cache.find(
                (channel) => channel.id === config.get('channels.rules'),
            );

            await member.send(
                new Discord.MessageEmbed({
                    title: 'Read The Rules',
                    description:
                        "First things first, reading the rules is important to making sure everything is running smoothly. We will warn you if you break any of the rules, and if you get too many warnings, I'll automatically ban you in order to keep the order within the server. If you do end up getting banned, please feel free to [appeal the ban here](https://atl.pw/discord-ban-appeal).",
                    color: 16711680,
                    fields: [
                        {
                            name: 'Find the rules here',
                            value: `[#rules](https://discord.com/channels/${member.guild.id}/${rulesChannel?.id})`,
                        },
                    ],
                }),
            );

            const announcementsChannel = this.bot.client.channels.cache.find(
                (channel) => channel.id === config.get('channels.announcements'),
            );

            await member.send(
                new Discord.MessageEmbed({
                    title: 'Announcements',
                    description: 'Check the Announcement channel for Revolt updates and info.',
                    color: 65280,
                    fields: [
                        {
                            name: 'Check it out',
                            value: `[#announcements](https://discord.com/channels/${member.guild.id}/${announcementsChannel?.id})`,
                        },
                    ],
                }),
            );

            const launcherSupportChannel = this.bot.client.channels.cache.find(
                (channel) => channel.id === config.get('channels.launcherSupport'),
            );
        }
    }
}

export default JoinWatcher;
