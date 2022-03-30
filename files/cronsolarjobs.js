var bus             = require('./event');

var bus             = require('./event');
const mongo         = require('./mongo');
var path            = require('path');
var thismodule      = (path.basename(__filename)).replace('.js','');
const f             = require('./functions');
const { v4: uuidv4 }= require('uuid');
var CronJob         = require('cron').CronJob;
const Cron          = require("croner");        // https://github.com/Hexagon/croner
var cronstrue       = require('cronstrue');
var SolarCalc       = require('solar-calc');
var SunCalc         = require('suncalc');
var moment          = require('moment');
var cronJobs        = [];
var solarevents     = [];
var params;
var phase;
const msg_UUID = uuidv4();

bus.on('zzzzzzz', function (msg_uuid,topic,payload) {
    if (topic == 'restart') {
        start_sun_jobs();
    } else if (topic == 'jobs_infos'){
        let resparray = [];
        for (let i = 0; i < cronJobs.length; i++) {
            let valcron = cronJobs[i];
            let val1 = cronJobs[i].options.context;
            let val2 = cronJobs[i].next();
            var date = val2.toString();
            //let valcron = cronJobs[i][1];
            resparray.push([val1, date ]);
            let un = 'un';
        }
        console.table(resparray);
        bus.emit('message_response', thismodule, msg_uuid, topic,null,null)
    }
});

bus.on('message_request',function(msg_module_from, msg_module_to, msg_uuid,msg_topic,msg_payload,msg_options){
    if (msg_module_to !== thismodule) {return;}
    if (msg_topic == 'restart') { start_sun_jobs(); }
    if (msg_topic == 'jobs_infos') { 
        let response = cronJob_infos();
        bus.emit('message_response',thismodule,thismodule,msg_uuid,response);
    }
});




async function start_sun_jobs(){
    try {
        bus.emit('log', new Error('[info] module is starting'));    

        var td_times    = SunCalc.getTimes(new Date(), 0,0);
        var allkeys = Object.keys(td_times);

        var solar_events = Object.keys(SunCalc.getTimes(new Date(), 0,0));

        for (let i = 0; i< solar_events.length;i++) {
            var event_name = solar_events[i];
            var next_date = f.nextSolarEvent(event_name);
            var thisJob  = new Cron(next_date ,{ "context": event_name }, (_self, context) => {
                console.log('job fired ' + context); 
                next_date = f.nextSolarEvent(context);
                thisJob.setTime(next_date);
            });
            cronJobs.push(thisJob);
            //cronJobs.push([event_name,thisJob]);
            //let nextr = cronJobs[event_name,0][1].next();
            //var date = new Date(nextr);
            console.log(event_name.padEnd(14,' ')   + ' ==> next_run: ' + thisJob.next());
        }




 } catch(e) {
        console.log(e)}
};
//start_sun_jobs()

bus.emit('message_request', thismodule, thismodule, msg_UUID,"restart");
bus.emit('message_request', thismodule, thismodule, msg_UUID,"jobs_infos");



bus.emit(thismodule, msg_UUID,"restart");


bus.emit(thismodule, msg_UUID,"jobs_infos"); 

/**
 * message topic : "command",
 *          payload  : {
 *              "context" : "context_name",
 *              "command_value" : "value",
 * }
 * 
 * 
 * 
 */
/** 
 * payload : {"cron_id" : "cron_id", "cron_pattern" : "pattern"}
*/
function cronJob_append(payload) {

};
function cronJob_pause(payload) {

};
function cronJob_restart(payload) {

};

function cronJob_infos() {
    let resparray = [];
    for (let i = 0; i < cronJobs.length; i++) {
        let valcron = cronJobs[i];
        let val1 = cronJobs[i].options.context;
        let val2 = cronJobs[i].next();
        var date = val2.toString();
        resparray.push([val1, date ]);    
    };
    return resparray;  
}