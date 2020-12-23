const fs = require('fs')
const awsIot = require('aws-iot-device-sdk')






var cwd = process.cwd()
var fd = fs.openSync(process.env.OUTFILE,'w+')

var device = awsIot.device({
   keyPath: `${cwd}/creds/device.key`,
  certPath: `${cwd}/creds/device.crt`,
    caPath: `${cwd}/creds/ca1.pem`,
  clientId: conf.DeviceId,
      host: conf.Endpoint
});

device
  .on('connect', function() {
    console.log('connect')
    device.subscribe('board')
  })

  device
  .on('message', function(topic, payload) {
    console.log('message', topic, payload.toString())
    fs.write(fd, payload + "\n",(err,data) => {
        if (err) console.error(err)
    })
  })



  device
  .on('end', function(topic, payload) {
    console.log('end', topic, payload.toString());
  });



  device
  .on('error', function(topic, payload) {
    console.log('error', topic, payload);
  });



  device
  .on('offline', function() {
    console.log('offline');
  });


  device
  .on('close', function() {
    console.log('close');
  });


  device
  .on('reconnect', function() {
    console.log('reconnect');
  });
