//Node server

var http = require('http');
var push = require('./push');

http.createServer((request, response)=> {

  //Enable COS
  response.setHeader('Access-Control-Allow-Origin', '*')

  //Request
  const {url, method} = request;

  //Subscribe
  if(method === 'POST' && url.match(/^\/subscribe\/?/)){

    //GET POST Body
    let body = [];

    //Read body stream
    request.on('data', chunck => body.push(chunck)).on('end', ()=> {

      //Parse the body back to an object
      let objJSON = JSON.parse(body.toString());
      
      //Store the client subscriptions
      push.addSubscription(objJSON);
      response.end('Subscribed');
    })
  }
  else if (url.match(/^\/key\/?/)){ //Responding to a public key request from client

    //Get vapid key
    //Response with public key
    response.end(push.getKey());
  }
  else if(method === 'POST' && url.match(/^\/push\/?/)){
        //GET POST Body
        let body = [];
        
        //Read body stream
        request.on('data', chunck => body.push(chunck)).on('end', ()=> {
          push.send(body.toString());
          response.end('Push send');
        })
  } else {
    response.statusCode = 404;
    response.end('Error');
  }
}).listen(3333, ()=> {console.log('Server running ........')}) //Start server