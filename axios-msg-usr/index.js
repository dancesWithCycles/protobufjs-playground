const axios = require('axios');
const protobuf = require('protobufjs');
const debug=require('debug')('axios');

run().catch(err => {
    debug('run: error')
    console.log(err)
});

async function run() {
    debug('run:...')

    const protoFile=__dirname+'/user.proto';
    debug('protofile: %s',protoFile)

    //async load of protobuf file
    const root = await protobuf.load(protoFile);
    const User = root.lookupType('userpackage.User');

    //HTTP GET
    let dataGet = await axios.get(
	'http://localhost:3001/user',
	{
	    headers:{
		'accept':'application/octet-stream'}
	}
    )
	.then(res => res.data);
    debug('data received via GET');
    debug('dataGet len: %s',dataGet.length)

    const dataBuffered=Buffer.from(dataGet,'binary');
    debug('dataBufferd len: %s',dataBuffered.length)

    //next line triggers: Error: illegal buffer
    //const dataDecoded=User.decode(dataGet);
    const dataDecoded=User.decode(dataBuffered);
    debug('dataDecoded len: %s',dataDecoded.length)
    debug('decoded data in JSON: %s', JSON.stringify(dataDecoded)) 

    //HTTP POST
    const dataPost = { name: 'Joe', age: 27, temperature: 36.7 };
    debug('data for POST: %s',JSON.stringify(dataPost))
    const encodedPost = User.encode(dataPost).finish();
    debug('encodedPost len: %s',encodedPost.length)
    debug('POST encoded');
    await axios.post('http://localhost:3001/user',
		     encodedPost,
		     {
			 headers:{
			     'content-type':'application/octet-stream'}
			 //'content-type':'application/x-protobuf'}
			 //'transformRequest':[]
		     }
		    ).
    then(res => res.data);
    debug('POST sent');
} 

/*
//asynch axios GET example
const axios = require("axios");

async function getCatFacts() {
	const response = await axios.get("https://cat-fact.herokuapp.com/facts")

console.log(`{response.data.all.length} cat facts were returned.`)
}

getCatFacts()
*/
