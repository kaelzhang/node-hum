'use strict';

var util = module.exports = {};

var node_fs = require('fs');

util.makeArray = function (subject) {
    if ( subject === undefined || subject === null ) {
        return [];
    
    } else if ( Array.isArray(subject) ) {
        return subject;

    } else if ( util.isArguments(subject) ) {
        return Array.prototype.slice.call(subject);
    
    } else {
        return [subject];
    }
};


util.mix = function (receiver, supplier, override){
    var key;

    if(arguments.length === 2){
        override = true;
    }

    for(key in supplier){
        if(override || !(key in receiver)){
            receiver[key] = supplier[key]
        }
    }

    return receiver;
};


util.flatten = function (array) {
    return array.reduce(function (prev, current) {
        return prev.concat(current);

    }, []);
};


var toString = Object.prototype.toString;

util.isArguments = function (subject) {
    return toString.call(subject) === '[object Arguments]';
};


util.isDir = function (name) {
    try {
        // in node.js 0.6 there's no fs.exists() or fs.existsSync() method
        return node_fs.statSync(name).isDirectory();
    } catch(e) {
        return false;
    }
};


util.each = function(obj, callback) {
    var key;

    if(obj){
        for(key in obj){
            callback(obj[key], key);
        }
    }
};

