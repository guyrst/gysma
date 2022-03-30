var bus             = require('./event');
const mongo         = require('./mongo');
const f             = require('./functions');
const { v4: uuidv4 }= require('uuid');
var CronJob         = require('cron').CronJob;
var cronstrue       = require('cronstrue');
var SolarCalc       = require('solar-calc');
var SunCalc         = require('suncalc');
var moment          = require('moment');
var cronJobs        = [];
var solarevents     = [];
var params;


var w = f.nextSolarEvent(f.solar_events);



var lat = '43.95809377687287';
var long = '4.429087084657054';

var td          = new Date();
var tm          = new Date();tm.setDate(tm.getDate()+1);
var td_times    = SunCalc.getTimes(td, lat,long);


var allkeys = Object.keys(td_times);
var tm_times    = SunCalc.getTimes(tm, lat,long);

var phase = 'sunrise';
console.log(td_times[phase]);
console.log(tm_times[phase]);
if (td_times[phase] < td) {
    console.log(tm_times[phase]);
} else {
    console.log(td_times[phase]);
}




var ee;