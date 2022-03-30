(async function(){
    try {
        var bus             = require('./event');
        const mongo         = require('./mongo');
        const f             = require('./functions');
        const mqtt          = require('./mqtt');
        const { v4: uuidv4 }= require('uuid');

        var params;
    
        bus.on('tuya(ts0044)', function (topic,payload,tp) {
            if (!f.isJsonObject(payload)) {
                return;
            }   
            bus.emit('log', new Error('[silly] receiving topic: ' + topic + ', payload is: ' + JSON.stringify(JSON.parse(payload))));    
            let msg = JSON.parse(payload);
            
            if (msg.action == '') {return;}
            if (msg.action == null) {return;}
            (async function(){

                let scene_id = tp.alias_value + '/' + msg.action;
                    
                params = { "collection": "scenes", "filter": { "scene_id": scene_id } , "sort" : {"scene_id" : -1}, "limit" : 5} ;
                let doc = await mongo.read(params);
                let scenes = doc[0].scene_items;
                if (scenes.length == 0) {
                    bus.emit('log', new Error('[warning] no items for scene: ' + scene_id));
                    return;
                }
                for (let i = 0; i< scenes.length; i++) {
                    let scene_item = scenes[i]
                    bus.emit('scenes_resolver',scene_item);

                }
                          
            })();

        }); 
    
    
    } catch(e) {
        console.log(e)}
    
    })();