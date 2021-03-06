import config from 'config';
import * as Discord from 'discord.js';

import BaseWatcher from './BaseWatcher';

/**
 * This watcher checks for people saying bad words.
 */
class BadWordWatcher extends BaseWatcher {
    /**
     * The method this watcher should listen on.
     */
    methods: Array<keyof Discord.ClientEvents> = ['message', 'messageUpdate'];

    /**
     * Run the watcher with the given parameters.
     */
    async action(method: keyof Discord.ClientEvents, ...args: Discord.ClientEvents['message' | 'messageUpdate']) {
        const message = args[1] || args[0];

        if (message.cleanContent) {
            const cleanMessage = message.cleanContent.toLowerCase();
            const messageParts = cleanMessage.includes(' ') ? cleanMessage.split(' ') : [cleanMessage];

            if (messageParts.some((word) => config.get<string[]>('badWords').includes(word))) {
                const rulesChannel = this.bot.client.channels.cache.find(
                    (channel) => channel.id === config.get<string>('channels.rules'),
                );

                const warningMessage = await message.reply(
                    `Please use less inflamatory language here. See ${rulesChannel} for more info`,
                );

                this.addWarningToUser(message);

                message.delete({ reason: 'Being vulgar' });

                warningMessage.delete({ timeout: 60000 });
            }
        }
    }
}

export default BadWordWatcher;
