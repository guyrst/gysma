try {
    var bus             = require('./event');
    const mongo         = require('./mongo');
    const f             = require('./functions');
    const mqtt          = require('./mqtt');
    const { v4: uuidv4 }= require('uuid');

    bus.on('mqtt_is_ready', function (return_key,mqtt_client,params) {
    if (return_key !== 'z2m_devices_discovery') {return;}
        mqtt_client.subscribe('zigbee2mqtt/bridge/devices');
        mqtt_client.on('message', async function (topic, payload, packet) { 
            let devices     = [];
            if (!f.isJsonObject(payload)){return;}
            let z2mdevices  = JSON.parse(payload);
            for (let i = 0; i <= z2mdevices.length; i++) {
                try {
                    let obj = z2mdevices[i];
                    let line = z2mdevices[i].friendly_name;
                    let alias = f.alias(line);
                    let ieee_address = obj.ieee_address;
                    if (alias) {
                        let vendor_model = (obj.definition.vendor + '(' + obj.definition.model + ')').toLowerCase();
                        if (!vendor_model) {
                            console.log('no vm');
                        }

                        let params = { 
                            "collection" : "devices", 
                            "filter" : { "alias" : alias }, 
                            "values" : { "fn"           : line, 
                                         "model"        : vendor_model,
                                         "mqtt_prefix"  : "zigbee2mqtt",
                                         "conf_id"      : f.conf_id,
                                         "ieee_address" : ieee_address,
                                         "time_out"     : {
                                             "edge"     : "state_on",
                                             "enabled"  : false,
                                             "value"    : 30,
                                             "scene"    : alias + '/turn_off'
                                            }  
                                    }, 
                            "options" : { "upsert": true } 
                        };

                        devices.push(params);
                    }
                } catch (e) { }
            }
            for (let i = 0; i < devices.length; i++) {
                let params = devices[i];
                let r = await mongo.updateOne(params);
            };
            bus.emit('log', new Error('[info] devices discovery sucess'));
            f.busListeners('z2m_devices_discovery_success');
            bus.emit('z2m_devices_discovery_success');  
        });
    });
    mqtt.getClient('z2m_devices_discovery');
} catch(e) {console.log(e)}