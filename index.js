'use strict';

module.exports = hum;
hum.Hum = Hum;

var grunt       = require('grunt');
var util        = require('./lib/util');
var deferrer    = require('deferrer');

var node_path = require('path');


function hum (options){
    return new Hum(options || {});
};

// @param {Object} options
// - path: {Array.<path>} paths to search the grunt tasks from
function Hum (options) {
    var NODE_PATH = process.env.NODE_PATH;

    this.path = util.makeArray(options.path);

    if ( NODE_PATH ) {
        this.path = this.path.concat( NODE_PATH.split(':').filter(Boolean) );
    }

    this.cwd = options.cwd || process.cwd();

    this._config = [];
    this._options = [];
    this._tasks = [];
};


var fake_gruntfile = node_path.join(__dirname, 'lib', 'fake-gruntfile.js');

Hum.prototype._run_grunt = function(err, done) {
    if ( err ) {
        return done(err);
    }

    var cli = grunt.cli;

    this._apply_config();
    this._apply_options();
    
    cli.options.gruntfile = fake_gruntfile;

    grunt.tasks(this._tasks, cli.options, done);
};


Hum.prototype._collect_tasks = function(args) {
    this._tasks = this._tasks.concat(args);
};


Hum.prototype._collect_config = function(args) {
    this._config = this._config.concat(args);
};


Hum.prototype._apply_config = function() {
    var config = grunt.config.data || {};

    grunt.config.data = this._config
        .map(this._add_cwd, this)
        .reduce(function (prev, current) {
            return util.mix(prev, current);
        }, config);
};


Hum.prototype._add_cwd = function(config) {
    var cwd = this.cwd;

    util.each(config, function (task_config) {
        util.each(task_config, function (target_config) {
            if ( !target_config.cwd ) {
                target_config.cwd = cwd;
            } 
        });
    });

    return config;
};


Hum.prototype._collect_options = function(options) {
    this._options = this._options.concat(options);
};


Hum.prototype._apply_options = function() {
    var grunt_options = grunt.cli.options;

    this._options.forEach(function (options) {
        util.mix(grunt_options, options)
    });
};


Hum.prototype._load_npm_tasks = function(names) {
    names.forEach(this._load_npm_task, this);
};


Hum.prototype._load_npm_task = function(name) {
    this.path.some(function (path) {
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


Hum.prototype._register_multi_task = function(tasks) {
    grunt.registerMultiTask.apply(null, tasks);
};


deferrer({
    host: Hum.prototype,
    type: 'parallel'
})
.promise('init', '_collect_config')
.promise('npmTasks', '_load_npm_tasks')
.promise('task', '_collect_tasks')
.promise('multiTask', '_register_multi_task')
.promise('options', '_collect_options')
.done('_run_grunt');

