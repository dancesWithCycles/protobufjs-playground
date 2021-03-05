const axios = require('axios');
const protobuf = require('protobufjs');
const debug=require('debug')('axios');

run().catch(err => {
    debug('run: error')
    console.log(err)
});

async function run() {
    debug('run:...')

    const protoFile=__dirname+'/gtfs-realtime.proto';
    debug('protofile: %s',protoFile)

    //async load of protobuf file
    const root = await protobuf.load(protoFile);
    //const User = root.lookupType('userpackage.User');
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
/*
    //HTTP GET
    let dataGet = await axios.get(
	'http://localhost:3000/user',
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
    const dataDecoded=FeedMessage.decode(dataBuffered);
    debug('dataDecoded len: %s',dataDecoded.length)
    debug('decoded data in JSON: %s', JSON.stringify(dataDecoded))
*/

    //HTTP POST
    const FeedHeader = root.lookupType("transit_realtime.FeedHeader");
    const FeedEntity = root.lookupType("transit_realtime.FeedEntity");
    const VehiclePosition = root.lookupType("transit_realtime.VehiclePosition");
    const Position = root.lookupType("transit_realtime.Position");
    const VehicleDescriptor = root.lookupType("transit_realtime.VehicleDescriptor");

    const vehDes=VehicleDescriptor.create(
	{
	    id:'id',
	    label:'label',
	    licensePlate:'license_plate'
	}
    )

    const pos = Position.create({latitude:37.79192,longitude:-122.39087});
    debug('pos created')
    debug("pos JSON: %s", JSON.stringify(pos));

    const ts=Date.now()
    debug('ts: %s',ts)
    const vehiclePosition = VehiclePosition.create(
	{
	    vehicle:vehDes,
	    position:pos,
	    timestamp:ts});
    debug('vehiclePosition created')

    var feedEntity=FeedEntity.create(
	{
	    vehicle:vehiclePosition
	}
    )
    debug('feedEntity created')

    var feedHeader = FeedHeader.create(
	{
	    gtfsRealtimeVersion:'2.0',
	    incrementality:0
	}
    )
    debug('feedHeader created')

    var feedMessage = FeedMessage.create(
	{
	    header:feedHeader,
	    entity:[feedEntity]
	}
    )
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

    const encodedPost=FeedMessage.encode(feedMessage).finish();
    debug('encodedPost len: %s',encodedPost.length)
    debug('POST encoded');
    //url as first,
    //request body as second and
    //options as third  POST argument
    //response is returned
    const res=await axios.post(
	'http://localhost:3000/user',
	//'https://dedriver.org/gtfs/realtime',
	//'http://127.0.0.1:42003/realtime',
	encodedPost,
	{
	    headers:{
		'content-type':'application/octet-stream'}
	    //		'content-type':'application/x-protobuf'}
	    //'transformRequest':[]
	}
    ).then(res => res.data);
    debug('POST sent');
    debug('res JSON: %s',JSON.stringify(res));
    //debug('res content-type: %s',res.data.headers['content-type']);

} 
