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

    const protoFile=__dirname+'/gtfs-realtime.proto';
    debug('protofile: %s',protoFile)
    
    //async load of protobuf file
    const root = await protobuf.load(protoFile);

    // Obtain message types
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    const FeedHeader = root.lookupType("transit_realtime.FeedHeader");
    const FeedEntity = root.lookupType("transit_realtime.FeedEntity");
    const VehiclePosition = root.lookupType("transit_realtime.VehiclePosition");
    const Position = root.lookupType("transit_realtime.Position");

    var pos = Position.create({latitude:36.1,longitude:79.1});
    debug('pos created')
    
    //TODO Why does Position msg not work? Is it converted on transmission?
    var vehiclePosition = VehiclePosition.create({position:pos});
//    var vehiclePosition = VehiclePosition.create();
    debug('vehiclePosition created')

    var feedEntity = FeedEntity.create({id:'uuid-xpress',
    vehicle:vehiclePosition});
    debug('feedEntity created')

    var feedHeader = FeedHeader.create({gtfsRealtimeVersion:'2.0',
    incrementality:0});
    debug('feedHeader created')

    var feedMessage = FeedMessage.create({header:feedHeader,
    entity:[feedEntity]});
    debug('feedMessage created')
    debug("feedMessage JSON: %s", JSON.stringify(feedMessage));

    // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
    var errMsg = FeedMessage.verify(feedMessage);
    if (errMsg){
        debug('feedMessage invalid')
        throw Error(errMsg);
    }else{
        debug('feedMessage valid')
    }

    var encodedFeedMsg = FeedMessage.encode(feedMessage).finish();
    debug('feedMessage encoded')
    debug('encoded len: %s',encodedFeedMsg.length)

    app.get('/user', function(req, res) {
	debug('req.url %s',req.url)
	debug('req.method %s',req.method)
	debug('req.headers %s',JSON.stringify(req.headers))

	debug("feedMessage JSON: %s", JSON.stringify(feedMessage));
	debug('encoded len: %s',encodedFeedMsg.length)
	const bufferFeedMsg=Buffer.from(encodedFeedMsg,'binary');
	debug('bufferFeedMsg len: %s',bufferFeedMsg.length)
	//res.send(User.encode(user).finish());
//TODO ?	res.send(encodedFeedMsg);
	res.type('application/octet-stream').send(bufferFeedMsg);
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ might not be necessary
    });
  
//TODO ?    app.post('/user', function(req, res) {
    //app.post('/user', express.text({ type: '*/*' }), function(req, res) {
    app.post('/user', function(req, res) {
	debug('req.url %s',req.url)
	debug('req.method %s',req.method)
	debug('req.headers %s',JSON.stringify(req.headers))
	// Assume `req.body` contains the protobuf as a utf8-encoded string
	const user = FeedMessage.decode(Buffer.from(req.body,'binary'));
	debug('req.body decoded: %s',JSON.stringify(user));
	res.end();
    });
    
    await app.listen(3000);
  
} 
