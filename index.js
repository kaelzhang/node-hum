'use strict';

module.exports = hum;
hum.Hum = Hum;

var util        = require('./lib/util');

var grunt       = require('grunt');
var deferrer    = require('deferrer');
var async       = require('async');

var node_path   = require('path');

function hum (options){
    return new Hum(options || {});
};


hum._queue = async.queue(function (instance, callback) {
    instance._done(callback);
});


// @param {Object} options
// - path: {Array.<path>} paths to search the grunt tasks from
// - cwd: {path} the cwd
// - strict_path: {boolean} 
function Hum (options) {
    this.path = util.makeArray(options.path);

    if ( !options.strict_path ) {
        var NODE_PATH = process.env.NODE_PATH;
        if ( NODE_PATH ) {
            this.path = this.path.concat( NODE_PATH.split(':').filter(Boolean) );
        }
    }
    
    this.cwd = options.cwd ? node_path.resolve(options.cwd) : process.cwd();

    this._config = [];
    this._options = [];
    this._tasks = [];
};


var fake_gruntfile = node_path.join(__dirname, 'lib', 'fake-gruntfile.js');

Hum.prototype.done = function(callback) {
    hum._queue.push(this, function (err) {

        // make sure, if no errors, `err` === `null`
        callback(err || null);
    });
};

Hum.prototype._run_grunt = function(err, done) {
    if ( err ) {
        return done(err);
    }

    var cli = grunt.cli;

    this._apply_configs();
    this._apply_options();
    
    // Grunt will always load 'gruntfile.js' as a internal task.
    // We give it a fake task to make grunt do nothing
    cli.options.gruntfile = fake_gruntfile;

    grunt.tasks(this._tasks, cli.options, done);
};


Hum.prototype._collect_tasks = function(args) {
    this._tasks = this._tasks.concat(args);
};


Hum.prototype._collect_configs = function(args) {
    this._config = this._config.concat(args);
};


Hum.prototype._apply_configs = function() {
    var config = {};

    var grunt_config = this._config
        .map(this._process_config, this)
        .reduce(function (prev, current) {
            return util.mix(prev, current);
        }, config);

    grunt.initConfig(config);
};


// process and standardize configurations
// - manage cwd option
// - standardize files configurations and apply `this.cwd`
Hum.prototype._process_config = function(config) {
    var self = this;
    var tasks = this._tasks;

    util.each(config, function (task_config, task_name) {
        if ( ! ~ tasks.indexOf(task_name) ) {
            return;
        }

        util.each(task_config, function (target_config, target_name) {
            // add `this.cwd` to grunt `this.options()`
            var options = target_config.options || (
                    target_config.options = {}
                );

            if ( !options.cwd ) {
                options.cwd = self.cwd;
            }

            task_config[target_name] = self._normalize_target_files(target_config);
        });
    });

    return config;
};


// normalize {}
Hum.prototype._normalize_target_files = function (data) {
    // we only support only 4 types of configs

    // 1.
    // {
    //     src: []
    //     dest: ...
    // }

    // 2.
    // {
    //     files: {
    //         <dest>: <src>
    //     }
    // }

    // 3. 
    // {
    //     files: [ path ]
    // }

    // 4.
    // {
    //     files: [ {1} ]
    // }

    // all these types will be converted to {4}

    var files = data.files;

    if ( Array.isArray(data) ) {
        data = {
            files: data
        };

    // {1} -> {4}
    // {src: [], dest: ''} -> {files: {src: [], dest: ''}}
    } else if ( 'src' in data || 'dest' in data ) {
        // we copy necessary properties of `data` to `data.files`,
        // including other configurations for grunt.file.expandMapping 
        data.files = util.mix({}, data);
        delete data.src;
        delete data.dest;

        // remove extra data
        delete data.files.options;
    
    // {2} -> {4}
    } else if ( Object(files) === files && !Array.isArray(files) ) {
        data.files = Object.keys(files).map(function (dest) {
            var src = files[dest];

            return {
                src: util.makeArray(src),
                dest: dest
            };
        });
    }

    // -> {files: [{src: [], dest: ''}]}
    // undefined -> []
    if ( data.files ) {

        // if `data.files` already exists, 
        data.files = util.makeArray(data.files).map(this._normalize_file_config, this);   
    }

    return data;
};

// resolve {src: [], dest: xxx } 
Hum.prototype._normalize_file_config = function(data) {
    // 'abc' -> { src: ['<cwd>/abc'] }
    if ( typeof data === 'string' ) {
        data = {
            cwd: this.cwd,
            src: [ data ]
        };
        
    } else {
        if ( 'dest' in data ) {
            data.dest = this._resolve_path(data.dest);
        }

        // this.cwd: '/User/xxx/'
        // data.cwd: 'abc'
        // -> '/User/xxx/abc'
        if ( 'cwd' in data ) {
            data.cwd = this._resolve_path(data.cwd);

        // this.cwd: '/User/xxx',
        // -> '/User/xxx'
        } else {
            data.cwd = this.cwd;
        }
    }

    if ( !('expand' in data) ) {
        data.expand = true;
    }

    return data;
};


Hum.prototype._resolve_path = function(path) {
    // if `path` is already an absolute path, `this.cwd` will not append to the head
    return node_path.resolve(this.cwd, path);
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
    util.flatten(names).forEach(this._load_npm_task, this);
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
.promise('init', '_collect_configs')
.promise('npmTasks', '_load_npm_tasks')
.promise('task', '_collect_tasks')
.promise('multiTask', '_register_multi_task')
.promise('options', '_collect_options')
.done('_done', '_run_grunt');

