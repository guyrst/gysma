(async function(){
try {
    var bus             = require('./event');
    const mongo         = require('./mongo');
    const f             = require('./functions');
    const { v4: uuidv4 }= require('uuid');
    var CronJob         = require('cron').CronJob;
    var cronstrue       = require('cronstrue');
    var SolarCalc       = require('solar-calc');
    var cronJobs        = [];
    var params;
    params = { "collection": "cronjobs", "filter": {} , "sort" : {"job_name" : -1}, "limit" : 5} ;
    let docs = await mongo.read(params);
    if (docs.length == 0) {
        bus.emit('log', new Error('[warning] there are no cron job to start'));
        return;
    }
    for (let i = 0; i< docs.length; i++) {
        var thisjob = docs[i];
        bus.emit('log', new Error('[info] job friendly_name is: ' +thisjob.job_friendly_name + 
                                    ', string is: ' + thisjob.job_string + 
                                    ', string description is: ' + cronstrue.toString(thisjob.job_string))); 
        //console.log(cronstrue.toString(thisjob.job_string));
        cronJobs[thisjob.job_name] = new CronJob(thisjob.job_string, async function() {
            //console.log(this);
            params = { "collection": "cronjobs", "filter": {"job_name" : this.toString()} , "sort" : {"job_name" : -1}, "limit" : 5} ;
            let doc = await mongo.read(params);
            if (doc.length == 0 ){
                console.log('EEEE');
                return;
            }
            if (!doc[0].job_starts == true) {
                bus.emit('log', new Error('[info] this job is disabled: ' + doc[0].job_friendly_name));
                return;
            }
            bus.emit('log', new Error('[info] cron job fired: ' + JSON.stringify(doc[0])));
            //let scenes = doc[0].job_scenes;
        },null,thisjob.job_starts,'Europe/Paris',thisjob.job_name);
    }


    




} catch(e) {
    console.log(e)}
})();


/*
var cron = require('node-cron');

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
  });

  var cron1 = require('node-cron');
  cron1.schedule('* * * * *', () => {
    console.log('running a task1 every minute');
  },{"scene" : "test"});






var job = new CronJob('* * * * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'Europe/Paris');
job.start();

var something = 42;
var varname = "something";
console.log(global[varname]);


var myVariables = {};
var variableName = 'foo';

myVariables[variableName] = 42;
console.log(myVariables.foo); // = 42


var listjobs = [
    {
        "job_name" : "job1",
        "job_friendly_name" : "starting warm water system",
        "job_string" : "* * * * * *",
        "job_starts" : "true",
        "job_scenes" : "turn_on_warm_water"
    },
    {
        "job_name" : "job2",
        "job_friendly_name" : "starting warm water system",
        "job_string" : "* * * * * *",
        "job_starts" : "false",
        "job_scenes" : "turn_off_warm_water"
    }
]




var cronJobs = {};

for (let i = 0 ; i< listjobs.length; i++) {
    var thisjob = listjobs[i];
    cronJobs[thisjob.job_name] = new CronJob(thisjob.job_string, function() {
        console.log(this);

    },null,thisjob.job_starts,'Europe/Paris',thisjob.job_name);
    
    
    if (thisjob.job_starts == true) {
        cronJobs[thisjob.job_name].starts;
    } else {
        cronJobs[thisjob.job_name].stop;
    }
    
}

*/