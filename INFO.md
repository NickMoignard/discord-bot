[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FATLauncher%2Fdiscord-bot.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FATLauncher%2Fdiscord-bot?ref=badge_shield)
[![Discord](https://discordapp.com/api/guilds/117047818136322057/embed.png?style=shield)](https://atl.pw/discordfromgithub)
![Build and Deploy](https://github.com/ATLauncher/discord-bot/workflows/Build%20and%20Deploy/badge.svg?branch=master)
![Test and Build](https://github.com/ATLauncher/discord-bot/workflows/Test%20and%20Build/badge.svg?branch=master)


## OLD DEPLOYMENT
- [Terraform](https://www.terraform.io) to create and maintain the droplets in Digital Ocean
- [PM2](https://pm2.keymetrics.io/) to keep the application up and running

First install Terraform on your machine. Once done, setup some environment variables as follows:

- `TF_VAR_do_token`: your DigitalOcean token
- `TF_VAR_ssh_fingerprint`: a SSH key fingerprint from your DigitalOcean account
- `TF_VAR_ssh_private_key`: private key contents matching the above fingerprint

If you don't set these environment variables, you'll have to enter them everytime you make your
Terraform plan.

**NOTE**: We use [Terraform Cloud](https://app.terraform.io/) to manage state and locking. If you do not wish to use
that, you'll need to remove the `backend.tf` file before running the below commands.

Now you can deploy the droplet with:

```sh
cd deploy/terraform
terraform init
terraform plan -out tf.plan
terraform apply tf.plan
```

Now you can run `pm2 deploy production setup` to setup the droplet ready for deployments.

Once done, you'll also need to copy over a `production.json` file with your config in it to
`/home/node/discord-bot/source/config/production.json`. You can do this easily with the following command:

`scp path/to/production.json node@${BOX_IP}:/home/node/discord-bot/source/config/production.json`

And then to deploy new changes to the code, run `pm2 deploy production`. Note that you will need to change the
`ecosystem.config.js` file in order to point to the correct repository, if it's not this one.

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FATLauncher%2Fdiscord-bot.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FATLauncher%2Fdiscord-bot?ref=badge_large)