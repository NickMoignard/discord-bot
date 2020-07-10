import * as Discord from 'discord.js';

import BaseCommand from './BaseCommand';
import { COLOURS, PERMISSIONS } from '../constants/discord';

/**
 * This will clean the last x messages from the current channel.
 *
 * @class CleanCommand
 * @extends {BaseCommand}
 */
class CleanCommand extends BaseCommand {
    /**
     * The pattern to match against. If the message matches this pattern then we will respond to it with the action
     * method.
     */
    pattern = /^!clean/;

    /**
     * The permissions the user requires in order to use this command.
     */
    permissions = [PERMISSIONS.MANAGE_MESSAGES];

    /**
     * The function that should be called when the event is fired.
     */
    async execute(message: Discord.Message) {
        await message.delete();

        const input = message.cleanContent.substr(7);

        if (input.length) {
            const linesToClean = parseInt(input, 10);

            if (linesToClean > 0 && linesToClean <= 100) {
                await message.channel.bulkDelete(linesToClean);

                let user = 'Unknown';

                if (message.author) {
                    user = `${message.author} (${message.author.username}#${message.author.discriminator})`;
                }

                const embed = new Discord.MessageEmbed()
                    .setTitle('Clean command run')
                    .setColor(COLOURS.YELLOW)
                    .setTimestamp(new Date())
                    .addField('User', user, true)
                    .addField('Channel', message.channel, true)
                    .addField('Lines', linesToClean, true);

                this.sendEmbedToModeratorLogsChannel(embed);
            }
        }
    }
}

export default CleanCommand;