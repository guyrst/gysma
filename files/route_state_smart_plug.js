(async function(){
    try {
        var bus             = require('./event');
        const mongo         = require('./mongo');
        const f             = require('./functions');
        const mqtt          = require('./mqtt');
        const { v4: uuidv4 }= require('uuid');

        var params;
    
        bus.on('state_smart_plug', function (topic,payload,tp) {
            bus.emit('log', new Error('[info] processing topic: ' + topic));    
 
            

            (async function(){
                params = { "collection": "devices", "filter": { "alias": tp.alias_value } , "sort" : {"alias" : -1}, "limit" : 5} ;
                let doc = await mongo.read(params);
                let current_states  = {"states" : {"state" : "nil"}};
                let new_states      = {"states" : {"state" : "nil"}};
                current_states = doc[0].states;
                if (!current_states) {current_states  = {"states" : {"state" : "nil"}};}
                new_states = JSON.parse(payload);
                if (current_states.state !== new_states.state) {
                    
                    params = {"db":"gysma",
                                "collection":"devices",
                                "filter":{"alias":tp.alias_value},
                                "values": {"states" : new_states},
                                "options":{"upsert" : true}
                            };  
                    let results = await mongo.updateOne(params);
                    bus.emit('log', new Error('[info] updateOne report: ' + JSON.stringify(results)));
                    params = {"db":"gysma",
                        "collection":"events_log",
                        "filter"    : {"device_fn" : "test"},
                        "values": {"_id"            : uuidv4(), 
                                    "timestamp"     : new Date().toISOString(),
                                    "change_path"   : "states.state",
                                    "device_fn"     : tp.fn_value, 
                                    "from_value"    : current_states, 
                                    "to_value"      : new_states
                                },
                        "options":{"upsert" : true}
                    };  
                    results = await mongo.updateOne(params);
                    bus.emit('log', new Error('[info] updateOne report: ' + JSON.stringify(results)));



                } else {
                    bus.emit('log', new Error('[info] states.state does not changed: ' + topic));

                }
            
            
           
            })();


        }); 
    
    
    } catch(e) {
        console.log(e)}
    
    })();