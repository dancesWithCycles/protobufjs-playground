const protobuf = require('protobufjs');
const debug=require('debug')('usr');

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

    const dataPost = { name: 'Joe', age: 27, temperature: 36.7 };
    debug('data for POST: %s',JSON.stringify(dataPost))
    const encodedPost = User.encode(dataPost).finish();

    // Assume `req.body` contains the protobuf as a utf8-encoded string
    const user = User.decode(Buffer.from(encodedPost));
    debug('req.body decoded: %s',JSON.stringify(user));

} 
