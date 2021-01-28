import * as Discord from 'discord.js';

import BaseCommand from './BaseCommand';

/**
 * Simple command to simply test if the bot is working or not.
 */
class SubmitCommand extends BaseCommand {
    /**
     * The pattern to match against. If the message matches this pattern then we will respond to it with the action
     * method.
     */
    pattern = /^!submit/;

    /**
     * The description of what the command does.
     */
    description = 'This will post a message in response with the universal designer submit form.';

    /**
     * The function that should be called when the event is fired.
     */
    async execute(message: Discord.Message) {
        if (this.hasDesignerRole(message)) {
            await message.reply(`submit link: https://airtable.com/shrCq2HWeq7gLTVhq`);
        }
    }
}

export default SubmitCommand;
