const Protobuf = require("protobufjs");
const ProtoFile=__dirname+'/gtfs-realtime.proto';
const debug = require('debug')('protobuf');

// or use Root#load
debug('proto file: %s',ProtoFile)
// var root = Protobuf.parse(ProtoFile, { keepCase: true }).root;
// const Root=Protobuf.load(ProtoFile);
// const FeedMsgType = Root.lookup("transit_realtime.FeedMessage");
// const FeedMsgType = Root.lookupType("transit_realtime.FeedMessage");
// TODO: How to load/parse proto file without callback function?

Protobuf.load(ProtoFile, function(err, root) {
    debug('%s loaded',ProtoFile)
    if (err)
        throw err;

    // Obtain a message type
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    const FeedHeader = root.lookupType("transit_realtime.FeedHeader");
    const FeedEntity = root.lookupType("transit_realtime.FeedEntity");
    const VehiclePosition = root.lookupType("transit_realtime.VehiclePosition");
    const Position = root.lookupType("transit_realtime.Position");

    var pos = Position.create({latitude:36,
    longitude:-79});
    debug('pos created')
    
    var vehiclePosition = VehiclePosition.create({position:pos});
    debug('vehiclePosition created')

    var feedEntity = FeedEntity.create({id:'uuid-foo-bar',
    vehicle:vehiclePosition});
    debug('feedEntity created')

    var feedHeader = FeedHeader.create({gtfsRealtimeVersion:'2.0',
    incrementality:0});
    debug('feedHeader created')

    var feedMessage = FeedMessage.create({header:feedHeader,
    entity:[feedEntity]});
    debug('feedMessage created')
    debug("JSON: %s", JSON.stringify(feedMessage));

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
    var decodedFeedMsg = FeedMessage.decode(encodedFeedMsg);
    debug('feedMessage decoded')
    debug("JSON: %s", JSON.stringify(decodedFeedMsg));
    // debug('toJSON: %s',decodedFeedMsg.toJSON())
    // debug('toObject: %s',FeedMessage.toObject(decodedFeedMsg, util.toJSONOptions))
});
