const webpush = require('web-push');
const vapid = require('./vapid.json');
const urlsafeBase64 = require('urlsafe-base64');
const Storage = require('node-storage');

const storage = new Storage(`${__dirname}/db`);
const clientSubs = storage.get('subscriptions') || [];

//Configure web-push
webpush.setVapidDetails(
  'mailto: smakunzva@gmail.com',
  vapid.publicKey,
  vapid.privateKey
)

module.exports.getKey = ()=> urlsafeBase64.decode(vapid.publicKey);

//Store new subscription
module.exports.addSubscription = (subscription)=> {
  clientSubs.push(subscription);
  storage.put('subscription', clientSubs);
  console.log(subscription)
}

//Send push notifications
module.exports.send = (message)=> {

  let activeSubs = [];

  //Loop through the subscribed clients
  let a  = clientSubs.forEach((clientSub, i)=> {
    webpush.sendNotification(clientSub, message)
    .catch((status)=> {
      
      //Check for 410 status and mark for deletion
      if(status.status === 410) clientSubs[i]['delete'] = true;

      //Since promise add all will reject all promises if one fails to mitigate return null
      return null;
    })
  })
  activeSubs.push(a);

  Promise.all(activeSubs).then(()=> {
    activeSubs = activeSubs.filter(sub=> !sub.delete);
    storage.put('subscription', activeSubs);
  })
}