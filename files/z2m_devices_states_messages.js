(async function(){
try {
    var bus             = require('./event');
    const mongo         = require('./mongo');
    const f             = require('./functions');
    const mqtt          = require('./mqtt');
    const { v4: uuidv4 }= require('uuid');
    const topic_exclusion_list = f.config.z2m_state_topics_exclusion_list;
    const topic_inclusion_list = f.config.z2m_state_topics_inclusion_list;
    var params;

    bus.on('mqtt_is_ready', function (return_key,mqtt_client,params) {
        if (return_key !== 'z2m_devices_states_messages') {return;}
        mqtt_client.subscribe('zigbee2mqtt/#');
        mqtt_client.on('message', async function (topic, payload, packet) { 
            if (!f.isJsonObject(payload)) {return;}
            let excluded = f.ismatching(topic,topic_exclusion_list);
            let included = f.ismatching(topic,topic_inclusion_list); 
            if (excluded == false || included == true) { 
                bus.emit('log', new Error('[verbose] state info for: ' + topic + ', payload is: ' + JSON.stringify(JSON.parse(payload))));
                var tp = f.topic_parser(topic);
                if (!tp.alias) { return; }
                if (tp.suffix) { return; }
                // device document
                params = { "collection": "devices", "filter": { "alias": tp.alias_value } , "sort" : {"alias" : -1}, "limit" : 5} ;
                let doc = await mongo.read(params);
                if (doc.length == 0) {
                    bus.emit('log', new Error('[verbose] did not find parasite device infos for: ' + JSON.stringify(params) ));
                    return;
                }
                bus.emit('log', new Error('[important] find device infos for: ' + JSON.stringify(params) ));
                let dev_doc = doc[0];                
 
                params = { "collection": "routes", "filter": { "model": dev_doc.model , "route_type" : "state"} , "sort" : {"model" : -1}, "limit" : 5} ;
                let routes = await mongo.read(params);
                if (routes.length == 0) {
                    bus.emit('log', new Error('[warning] there is no for: ' + dev_doc.fn + ', (' + dev_doc.model +')'));
                    bus.emit('log', new Error('[warning] routing to default route: ' + topic + ' ==> ' + dev_doc.model));
                    f.busListeners(dev_doc.model);
                    bus.emit(dev_doc.model,topic,payload,tp);
                } else {
                
                    let route_doc = routes[0];
                    bus.emit('log', new Error('[verbose] state changed route for: ' + dev_doc.fn + ', (' + dev_doc.model +') is: ' + route_doc.route));
                    f.busListeners(route_doc.route);
                    bus.emit(route_doc.route,topic,payload,tp);
                }


            }else {
                bus.emit('log', new Error('[silly] exclude info for: ' + topic));
            };


        });
        
        
        /*
        var tp = f.topic_parser(topic);
        if (!tp.alias) { return; }
        if (tp.suffix) { return; }

        let smartplugs;
        let params;
        var dev_doc;
        var previus_state;
        var new_state;
        var states = {};
        (async function () {
            try {
                params = { "collection": "config", "filter": { "device_type": "smart_plug" } };
                smartplugs = await mongo.read(params);
                dev_list = smartplugs[0].device_items;

                if (!f.ismatching(dev_model, dev_list)) {
                    bus.emit('log', new Error('[warning] not member of "smart_plug" list: ' + dev_model + ', topic is: ' + topic));
                    return;
                }
                bus.emit('log', new Error('[verbose] processing topic: ' + topic + ', payload: ' + payload.toString()));
                //bus.emit('log', new Error('[info] reading device info for: ' + tp.alias_value));    

                // device document
                params = { "collection": "devices", "filter": { "alias": tp.alias_value } };
                let doc = await mongo.read(params);
                let dev_doc = doc[0];
                try {
                    previus_state = dev_doc.states.state.toLowerCase();
                    new_state = JSON.parse(payload).state.toLowerCase();
                } catch (e) {
                    previus_state = null;
                    new_state = JSON.parse(payload).state.toLowerCase();
                }
                if (previus_state == new_state) {
                    bus.emit('log', new Error('[verbose] no state changes ' + topic));

                } else {
                    //
                    // device collection updating device document
                    //
                    states = { "state": JSON.parse(payload).state.toLowerCase() };
                    params = { 
                        "collection"    : "devices", 
                        "filter"        : { "alias": tp.alias_value }, 
                        "values"        : { "states": states }, 
                        "options"       : { "upsert": true } 
                    };
                    let r = await mongo.updateOne(params);
                    //
                    // event_log collection insert one document
                    //
                    let eventdoc = {};
                    eventdoc.event          = 'state.change';
                    eventdoc.ts             = new Date().toJSON();
                    eventdoc.alias          = tp.alias_value;
                    eventdoc.fn             = tp.fn_value;
                    eventdoc.from_state     = previus_state;
                    eventdoc.to_state       = new_state;
                    params = { 
                        "collection"    : "events_log", 
                        "values"        : eventdoc, 
                        "options"       : { "upsert": true } 
                    };
                    mongo.insertOne(params);
                    bus.emit('log', new Error('[info] device state and events_log updated for: ' + tp.fn_value));

                    let scenario = tp.alias_value + '/state_change_to/' + new_state;
                    bus.emit('log', new Error('[info] "state_change_message" ==> : ' + scenario));
                    bus.emit('state_change_scene',scenario, topic, payload);
    
                }

            } catch (e) { console.log(e); }

        })();
        */
    }); 


    mqtt.getClient('z2m_devices_states_messages');
} catch(e) {
    console.log(e)}

})();