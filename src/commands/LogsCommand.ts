import * as Discord from 'discord.js';

import BaseCommand from './BaseCommand';

/**
 * Asks someone to submit logs.
 */
class LogsCommand extends BaseCommand {
    /**
     * The pattern to match against. If the message matches this pattern then we will respond to it with the action
     * method.
     */
    pattern = /^!logs\s/;

    /**
     * The function that should be called when the event is fired.
     */
    async execute(message: Discord.Message) {
        const user = message.mentions.users.first() || '';

        const userPre = user ? ' ' : '';

        const sentMessage = await message.channel.send(
            `In order to help you${userPre}${user}, we need some logs. Please see ` +
                'https://enderman.atlcdn.net/UploadLogs.gif on how to generate the link. Please make sure that you ' +
                'press the button after the error/issue occurs.  Once done please paste the link here. If the logs ' +
                "don't upload or this is an issue with a server, please upload your logs to https://pastebin.com/ " +
                'and give us the link.',
        );

        message.delete();

        // delete message after 24 hours
        sentMessage.delete({ timeout: 60 * 60 * 24 * 1000 });

        await sentMessage.react('🇱');
        await sentMessage.react('🇴');
        await sentMessage.react('🇬');
        sentMessage.react('🇸');
    }
}

export default LogsCommand;
