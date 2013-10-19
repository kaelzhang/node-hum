'use strict';

var expect = require('chai').expect;
var hum = require('../');

var node_path = require('path');

hum({
    path: node_path.join(__dirname, 'task-path'),
    cwd: 'abc'
})
.npmTasks('some-task')
.task('blah')
.options({
    // verbose: true
})
.init({
    blah: {
        test: {
            a: 1,
            b: 2
        }
    }
})
.done(function(){
    console.log('done');
})
