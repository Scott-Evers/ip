const fs = require('fs')
const awsIot = require('aws-iot-device-sdk')
const conf = require('./config.json')
const http = require('http');


const url = "http://ipinfo.io";






const cid = Math.random().toString(36)
var cwd = process.cwd()

const update = (my_ip) => {
var shadow = awsIot.thingShadow({
   keyPath: `${cwd}/creds/device.key`,
  certPath: `${cwd}/creds/device.crt`,
    caPath: `${cwd}/creds/AmazonRootCA1.pem`,
  clientId: conf.DeviceId,
      host: conf.Endpoint
});

shadow.on('connect', () => {
  shadow.register(conf.DeviceId, () => {
    shadow.get(conf.DeviceId, cid)
  })
})
shadow.on('status',  function(name, stat, clientToken, stateObject) {
  console.log(name,stat,clientToken,stateObject.state.reported)
  if (clientToken == cid && (!stateObject || !stateObject.state || !stateObject.state.reported || !stateObject.state.reported.ip || stateObject.state.reported.ip != my_ip)) {
    console.log('needs update')
    let reported = {
      state: {
        reported: {
          ip: my_ip
        }
      }
    }
    shadow.update(conf.DeviceId,reported)
  }
  shadow.unregister(conf.DeviceId)
  shadow.end()
});
}




http.get(url,(res) => {
    let body = "";

    res.on("data", (chunk) => {
        body += chunk;
    });

    res.on("end", () => {
        try {
            let json = JSON.parse(body);
            update(json.ip)
            // do something with JSON
        } catch (error) {
            console.error(error.message);
        };
    });

}).on("error", (error) => {
    console.error(error.message);
});