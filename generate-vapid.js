/* eslint-disable @typescript-eslint/no-require-imports */
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();

const envLocalContent = `
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

const fastapiEnvContent = `
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT='mailto:admin@example.com'
`;

fs.appendFileSync(path.join(__dirname, '.env.local'), envLocalContent);
fs.appendFileSync(path.join(__dirname, 'fastapi', '.env'), fastapiEnvContent);

console.log('VAPID keys generated and saved to .env.local and fastapi/.env');
