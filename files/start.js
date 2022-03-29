//
// this module 



(async function(){
    try {
        var bus         = require('./event');
        var thismodule  = 'start';
        require('./messages_tracker');
        require('./mongo');

        bus.on('mongo_is_ready', function () {
            const   mqtt        = require('./mqtt'); 
            //require('./mqtt_v1');   
        });

        bus.on('mqtt_is_ready', function (return_key,mqtt_client,params) {
            if (return_key == 'start_up') {
                require('./z2m_devices_discovery');               
            } 
        });


        bus.on('z2m_devices_discovery_success', function(){
            require('./route_state_bulb');
            require('./route_state_smart_plug');
            require('./z2m_devices_states_messages');
            require('./scenes_resolver'); 
            require('./route_tuya_sensors');
            require('./route_ikea_sensors');
            require('./cronjobs.js');
            require('./cronsolarjobs');
            require('./sandbox');
        });
    } catch (e) {console.log(e);}
    
})();



