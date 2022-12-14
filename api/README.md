# Satoshi Server

## Prerequisites
1. Node installed locally and sui cli
1. Move inside the *scripts* folder and run `npm install`
## Get started
1. Move into the *api* folder and run `cd api`
1. Run `npm install`
1. Run the api with `npm run dev` (this command will also set the .env file if semi-complete and will create it if it doesn't exist)

## General Debugging notes
- If the API does not start, ensure that all the .env values have been properly set by the `setEnv.js` script. Dotenv schema can be found in the `.env.template` file.
- The `setEnv.js` script can be manually invoked by running `npm run set-up-dev-env` within the API folder or via the scripts folder (further instructions can be found there)