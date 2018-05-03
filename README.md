# RingCentral Messages Sync API demo

A demo show how to sync messages from ringcentral

## Prerequisites

* Install Node.js with version >= 8
* Install NPM or Yarn
* Create a [RingCentral developer free account](https://developer.ringcentral.com) to create a private app with platform type - "Server-only"

## Start

### Create a `.env` file in project root path

```
RINGCENTRAL_SERVER_URL=your_ringcentral_app_server, eg: https://platform.devtest.ringcentral.com
RINGCENTRAL_CLIENT_ID=your_ringcentral_app_client_id
RINGCENTRAL_CLIENT_SECRET=your_ringcentral_app_client_secret
RINGCENTRAL_USERNAME=your_ringcentral_phone_number
RINGCENTRAL_EXTENSION=your_ringcentral_extension, eg: 101
RINGCENTRAL_PASSWORD=your_ringcentral_password
```

### Start the process

```
yarn start
```

Messages data will be saved on `data` folder.
