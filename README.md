# Revolt Discord-Bot

This is the code for our Discord bot which will run on our internal Discord server.

## API
checkout the Postman workspace for easy testing / development of the api
https://app.getpostman.com/join-team?invite_code=8465252036eaa27887b225cf9e864798&ws=dd73095e-8f22-4ca3-ad5e-30d6c85f291f
## Development

To get setup you will need to make sure you have the following installed on your machine:

- [NodeJS 12](https://nodejs.org/en/download/)
  - check out [nvm](https://github.com/creationix/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows)

We'll assume you're a capable developer, so we won't tell you how to go about installing those on your machine :)

Next clone this repo to a directory and then run `npm install` to install all the dependencies needed to run the bot.

Lastly copy the `config/config.json.example` file to `config/config.json` and fill out as required.

Once installed you can run `npm run dev` to start the bot and auto reload when any changes are made to files.

## Building

To build this bot ready for running in production simply run `npm run build` which will compile all the files in the
`src/` directory with TypeScript and then spit it out in the `dist/` directory.

Once built simply run `npm run start` which will run the `index.js` file in the `dist/` folder.

## Docker

This repository contains support for Docker. Simply run `docker build` to build a Docker image ready to use.

## Deployment
Manual deployment using Docker.

This can be achieved by building the docker image and then pushing to a registry and running container. 
Current Deployment is using Azure Container Repository and Azure Container Instances.


The repository was set to deploy a Digital Ocean droplet & maintained with PM2 however this is too costly to maintain for an internal discord bot. Should we move hosting or setup CI, The Terraform deployment scripts will be continued.

## Config

Configuration is handled through a NPM package called `config`. You can see all the ways to change the configuration at
<https://github.com/lorenwest/node-config>.

Do not change the `default.json` file at all. When new configs are added with defaults, if you have a conflict here, it
may negate some changes and cause issues.

The best thing to do is to create a `local.json` file in the config folder and put your config in there. That file is
gitignored by default, so shouldn't get committed up.

Alternatively you can provide a `NODE_CONFIG` environment variable with a json string. The easiest way to get this, is
to create a `local.json` file in the config folder, and then run:

```sh
node utils/stringifyConfig.js
```

This will print out a json string of the generated config

## Database

This bot uses NEDB to provide a local json filesystem database. It will store all the data locally in the `db/`
directory.

## Logging

By default, all logging will be done to the console during development, and to a log file in the `logs` directory in
production.

By default the logging level is set to `error` level, but can be set to:

- error
- info
- debug

### Logz.io Logging

To log to a Logz.io account, simply add a config value in `logging.logzIoToken` with a string containing your api
token.

## Sentry error reporting

If you wish to enable sentry error reporting, simply add your DSN as config value `sentry.dsn`.

## Caveats

This bot was made for the [ATLauncher Discord server](https://atl.pw/discord) and then forked by Nick Moignard for use at Revolt. there are some caveats to note:

- Some things are hard coded to expect the layout and setup of the server in the same way as the ATLauncher one
  - This inncludes the notion of having a `rules` channel, a `moderation-logs` channel as well as the concept of support
    and non support channels
- The bot was made to be run only on one server, so if it's connected to multiple servers, it may not act correctly

## License

This code is licensed under the MIT license. For more details see the `LICENSE` file in the root of this repository.

