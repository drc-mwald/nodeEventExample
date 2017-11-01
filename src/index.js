"use strict";
var events = require('events');
var fs = require("fs");

var watchDir = '.\\watchDir';
var processedDir = '.\\doneDir';

// for creating the directories
function ensureDirectoryExistence(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname);
}

// Constructor
function Watcher(watchDir, processedDir) {
    var w = this;
    w.watchDir = watchDir;
    w.processedDir = processedDir;
}

// subclass
Watcher.prototype = new events.EventEmitter(); // make Watcher a sub type of EventEmitter

// add method
Watcher.prototype.watch = function() {
   var w = this;
   fs.readdir(w.watchDir, function(err, files) {
       if(err) throw err;
       for(var idx = 0; idx < files.length; idx++) {
           w.emit('process', files[idx]); // issue a 'process' event
       }
   })
};

// add method
Watcher.prototype.start = function() {
    var w = this;

    ensureDirectoryExistence(w.watchDir);
    ensureDirectoryExistence(w.processedDir);

    fs.watchFile(watchDir, function() {
        w.watch();
    })
};

//==================================================================================
// do something with the Watcher class
//==================================================================================

// get a new Watcher
var watcher = new Watcher(watchDir, processedDir);

// bind the on event processing
watcher.on('process', function process(file) {
    var watchedFile = this.watchDir +  '\\' + file;
    var now = new Date().getTime();
    var ts_seconds = Math.round(now/1000);
    var processedFile = this.processedDir + '\\' + file + '_PROCESSED_' + ts_seconds;

    fs.rename(watchedFile, processedFile, function(err) {
        if(err) {
            console.error(err);
        }
    })
});

// run it
watcher.start();

