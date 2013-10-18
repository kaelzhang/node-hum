'use strict';

module.exports = hum;
hum.Hum = Hum;

var grunt       = require('grunt');
var util        = require('./lib/util');
var promiselize = require('./lib/promiselize');

var node_path = require('path');


function NOOP () {};

function hum (options){
    return new Hum(options || {});
};

// @param {Object} options
// - path: {Array.<path>} paths to search the grunt tasks from
function Hum (options) {
    this.path = util.makeArray(options.path)
        .concat(
            process.env.NODE_PATH.split(':').filter(Boolean)
        );
};


var ATOM = {};

promiselize({
    host: Hum.prototype
})
.promise('config')
.promise('run', true, function () {
    this._config.push(ATOM);
})
.promise('npmTasks')
.promise('task')
.promise('multiTasks');


Hum.prototype.done = function(done) {
    this._applyConfig();
    this._loadNpmTasks();
    this._registerMultiTasks();
    this._registerTasks();

    var cli = grunt.cli;

    grunt.tasks(cli.tasks, cli.options, done);
};


Hum.prototype._runTasks = function() {
    this._run.forEach(function (task) {
        task = task[0];

        if ( typeof task === 'string' ) {
            require(task)(grunt);

        } else if ( typeof task === 'function' ) {
            task(grunt)
        }
    });
};


Hum.prototype._applyConfig = function() {
    var config = grunt.config.data;

    grunt.config.data = util.flatten(this._config).reduce(function (prev, current) {
        if ( current === ATOM ) {
            current = config;
        }

        return util.mix(prev, current);
    }, {});
};


Hum.prototype._loadNpmTasks = function() {
    this._npmTasks.forEach(this._loadNpmTask, this);
};

Hum.prototype._loadNpmTask = function(name) {
    this.path.some(function (path) {
        path = path[0];

        if ( !path ) {
            return;
        }

        path = node_path.join(path, name, 'tasks');

        if ( util.isDir(path) ) {
            grunt.task.loadTasks(path);
            return true;
        }
    });
};


Hum.prototype._registerMultiTasks = function() {
    this._multiTasks.forEach(this._registerMultiTask, this);
};

Hum.prototype._registerMultiTask = function(args) {
    grunt.registerMultiTask.apply(null, args);
};


Hum.prototype._registerTasks = function() {
    this._tasks.forEach(function (args) {
        grunt.registerTask.apply(null, args);  
    });
};



