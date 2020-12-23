const l = console.log;
const fs = require('fs');
const http = require('http');
const AWS = require('aws-sdk');






const read_local = () => {
    l('checking for ip change');
    let file_ip = '';
    try { file_ip = fs.readFileSync('./ip').toString(); } catch(err) {}
    const options = {
        hostname: 'ipinfo.io'
    };
    let res_data = '';
    const req = http.request(options, (res) => {
        res.on('data', (chunk) => { res_data += chunk; });
        res.on('end', () => {
            let live_ip = JSON.parse(res_data).ip;
            if (!(file_ip == live_ip)) {
                l('updating ip...');
                fs.writeFileSync('./ip',live_ip);
                let route53 = new AWS.Route53();
                var params = {
                    ChangeBatch: {
                     Changes: [
                        {
                       Action: "UPSERT", 
                       ResourceRecordSet: {
                        Name: "gate.thoughtcriminal.info", 
                        ResourceRecords: [
                           {
                          Value: live_ip
                         }
                        ], 
                        TTL: 300, 
                        Type: "A"
                       }
                      }
                     ], 
                     Comment: "SSH gateway"
                    }, 
                    HostedZoneId: "Z1MIMEMSBJS7ZZ"
                   };
                   route53.changeResourceRecordSets(params, function(err, data) {
                     if (err) l(err); // an error occurred
                     else     l('successfully updated Route53');
                   });            
                }
        });
    });
    req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
    req.end();
};






if (!process.env.AWS_PROFILE) process.env['AWS_PROFILE'] = 'tc';
setInterval(read_local,3600000);