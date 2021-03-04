const axios = require('axios');
const express = require('express');
const protobuf = require('protobufjs');
const debug=require('debug')('httppost');

const app = express();

run().catch(err => {
    debug('run error')
    console.log(err)
});

async function run() {

    const protoFile=__dirname+'/user.proto';
    debug('protofile: %s',protoFile)

    //async load of protobuf file
  const root = await protobuf.load(protoFile);
  
    const doc = { name: 'Bill', age: 30 };
    debug('doc: %s',JSON.stringify(doc))
  const User = root.lookupType('userpackage.User');
  
  app.get('/user', function(req, res) {
    debug('req.url %s',req.url)
    debug('req.method %s',req.method)
    debug('req.headers %s',JSON.stringify(req.headers))
    res.send(User.encode(doc).finish());
  });
  
  app.post('/user', express.text({ type: '*/*' }), function(req, res) {
    debug('req.url %s',req.url)
    debug('req.method %s',req.method)
    debug('req.headers %s',JSON.stringify(req.headers))
    // Assume `req.body` contains the protobuf as a utf8-encoded string
      const user = User.decode(Buffer.from(req.body));
      debug('req.body decoded: %s',JSON.stringify(user));

    res.end();
  });
    
    await app.listen(3000);
  
    let data = await axios.get('http://localhost:3000/user')
	.then(res => res.data);
    debug('data received via GET');
    debug('decoded data', User.decode(Buffer.from(data)));

    const docNext = { name: 'Joe', age: 27 };
    debug('docNext: %s',JSON.stringify(docNext))
    const postBody = User.encode(docNext).finish();
    debug('docNext encoded');
    await axios.post('http://localhost:3000/user', postBody).
    then(res => res.data);
    debug('docNext send via POST');
  
    data = await axios.get('http://localhost:3000/user').then(res => res.data);
    debug('data received via GET');
    debug('decoded data', User.decode(Buffer.from(data)));
} 
