
let registrationObj
const serverUrl = 'http://localhost:3333'

//Update UI
function setSubscribed(state){
  if(state){
    document.getElementById("subscribe").className = 'hidden';
    document.getElementById("unsubscribe").className = '';
  } else {
    document.getElementById("subscribe").className = '';
    document.getElementById("unsubscribe").className = 'hidden';
  }
}

//Register service worker
if(navigator.serviceWorker){
  navigator.serviceWorker.register('client_sw.js').then(registration => {
    registrationObj = registration;
    registrationObj.pushManager.getSubscription().then(setSubscribed);

  }).catch(e=> console.log('Error'))
}

//Get public key from server
const getApplicationKey = ()=> {
  return fetch(`${serverUrl}/key`)
  //Parse response body as arraybuffer
  .then(res=> res.arrayBuffer()).then(key => new Uint8Array(key));
}
//Unsubscribe from push service
function unSubscribed () {
  registrationObj.pushManager.getSubscription().then((subscription)=> {
    
    subscription.unsubscribe().then(()=> {
      setSubscribed(false);
    }).catch(e=> console.log)
  })
}

function subscribeClicked() {

  //Check service worker registration 
  if(!registrationObj) return console.error('Service worker registration failed');

  getApplicationKey().then((key)=> {
    //Subscribe to push server
    registrationObj.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: key})
    .then(serverResponse=> serverResponse.toJSON())
    .then((subscription)=> {

        //Pass subscription to server
        fetch(`${serverUrl}/subscribe`, {method: 'POST', body: JSON.stringify(subscription)
          }).then(setSubscribed)
            .catch(e => console.log);
    
    }).catch(unSubscribed);
  });

}