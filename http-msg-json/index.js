const data=JSON.stringify({
    uuid:'uuid',
    lat:1,
    lon:2,
    ts:3,
    alias:'alias',
    vehicle:'vehicle',
})
const debug=require('debug')('httppost')
debug('data: %s',data)
const options={
    hostname: '127.0.0.1',
    port: 55555,
    path: '/postdata',
    method: 'POST',
    headers: {
	'Content-Type': 'application/json',
	'Content-Length': data.length
    }
}
const http=require('http')
const req = http.request(options, res => {
    debug(`statusCode: ${res.statusCode}`)
    res.on('data', d => {
	process.stdout.write(d)
    })
})
req.on('error', error => {
    console.error(error)
})
req.write(data)
req.end()

