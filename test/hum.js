'use strict';

var expect = require('chai').expect;
var hum = require('../');

var node_path = require('path');

hum({
    path: node_path.join(__dirname, 'tasks')
})
.npmTasks('some-task')
.task('default', ['some-task'])
.done(function(){
    console.log('done');
})
