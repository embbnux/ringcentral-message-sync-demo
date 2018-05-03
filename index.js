const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const RingCentral = require('ringcentral');

dotenv.config()

const authorizationFilePath = path.join(__dirname, 'data/authorizationData.json');
const syncInfoFilePath = path.join(__dirname, 'data/syncInfoData.json');
const messagesFilePath = path.join(__dirname, 'data/messagesData.json');
let rcsdk;

async function initSDK() {
  let authorizationData;
  if (fs.existsSync(authorizationFilePath)) {
    authorizationData = JSON.parse(fs.readFileSync(authorizationFilePath, 'utf-8'));
  }
  rcsdk = new RingCentral({
    appKey: process.env.RINGCENTRAL_CLIENT_ID,
    appSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
    server: process.env.RINGCENTRAL_SERVER_URL
  });
  // set authorization token to sdk
  if (authorizationData) {
    rcsdk.platform().auth().setData(authorizationData);
  } else {
    try {
      const response = await rcsdk.platform().login({
        username: process.env.RINGCENTRAL_USERNAME,
        extension: process.env.RINGCENTRAL_EXTENSION,
        password: process.env.RINGCENTRAL_PASSWORD,
      });
      fs.writeFileSync(authorizationFilePath, JSON.stringify(response.json(), null, 2));
    } catch (e) {
      console.error('loginFail:', e.message);
      throw e;
    }
  }
  rcsdk.platform().addListener('refreshSuccess', () => {
    const tokenData = rcsdk.platform().auth().data();
    fs.writeFileSync(authorizationFilePath, JSON.stringify(tokenData, null, 2));
  });
}

async function syncMessages() {
  let syncInfo;
  if (fs.existsSync(syncInfoFilePath)) {
    syncInfo = JSON.parse(fs.readFileSync(syncInfoFilePath, 'utf-8'));
  }
  let syncParams;
  if (!syncInfo) {
    // Full sync in first time without syncToken
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    syncParams = {
      syncType: 'FSync',
      dateFrom: dateFrom.toISOString(),
    };
  } else {
    syncParams = {
      syncToken: syncInfo.syncToken,
      syncType: 'ISync'
    };
  }
  try {
    const response = await rcsdk.platform().get('/restapi/v1.0/account/~/extension/~/message-sync', syncParams);
    const newData = response.json();
    syncInfo = newData.syncInfo;
    fs.writeFileSync(syncInfoFilePath, JSON.stringify(syncInfo, null, 2));
    let messages = [];
    if (fs.existsSync(messagesFilePath)) {
      messages = JSON.parse(fs.readFileSync(messagesFilePath, 'utf-8'));
    }
    if (newData.records && newData.records.length > 0) {
      messages = messages.concat(newData.records);
      fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
    }
  } catch (e) {
    console.error('syncFail:', e.message);
  }
}

let timeoutId;

function pullMessages() {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  // sync messages every 5 minutes
  setTimeout(async () => {
    console.log('syncing');
    await syncMessages();
    pullMessages()
  }, 5 * 1000 * 60);
}

async function initMessageSync() {
  await initSDK();
  await syncMessages();
  pullMessages();
}

initMessageSync();
