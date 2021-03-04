const express = require('express');
const protobuf = require('protobufjs');
const debug=require('debug')('xpress');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.raw({type: 'application/octet-stream'}))

run().catch(err => {
    debug('run error')
    console.log(err)
});

async function run() {

    const protoFile=__dirname+'/user.proto';
    debug('protofile: %s',protoFile)
    //async load of protobuf file
    const root = await protobuf.load(protoFile);
    const User = root.lookupType('userpackage.User');

    const user = { name: 'Bill', age: 30, temperature: 36.3 };
    debug('user: %s',JSON.stringify(user))
    const userEncoded=User.encode(user).finish();
    debug('userEncoded len: %s',userEncoded.length)

    app.get('/user', function(req, res) {
	debug('req.url %s',req.url)
	debug('req.method %s',req.method)
	debug('req.headers %s',JSON.stringify(req.headers))
//TODO ?	res.send(userEncoded);
	res.type('application/octet-stream').send(userEncoded);
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ might not be necessary
    });
  
    app.post(
	'/user',
	express.text({ type: '*/*' }),
	function(req, res) {
	debug('req.url %s',req.url)
	debug('req.method %s',req.method)
	debug('req.headers %s',JSON.stringify(req.headers))
	// Assume `req.body` contains the protobuf as a utf8-encoded string
	debug('req.body len: %s',req.body.length)
	//debug('req.body len: %s',req.body.length)


	    const dataBuffered=Buffer.from(req.body,'binary');
	debug('dataBufferd len: %s',dataBuffered.length)

	const dataDecoded=User.decode(dataBuffered);
	//next line triggers: Error: illegal buffer
	//const dataDecoded=User.decode(req.body);
	debug('dataDecoded len: %s',dataDecoded.length)
	debug('decoded data in JSON: %s', JSON.stringify(dataDecoded)) 

	res.end();
    });
    
    await app.listen(3001);
  
} 
