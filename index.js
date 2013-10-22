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

    this.cwd = options.cwd ? node_path.resolve(options.cwd) : process.cwd();

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

    grunt.initConfig(
        this._config
            .map(this._process_config, this)
            .reduce(function (prev, current) {
                return util.mix(prev, current);
            }, config)
    );
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

        util.each(task_config, function (target_config) {
            // add `this.cwd` to grunt `this.options()`
            var options = target_config.options || (
                    target_config.options = {}
                );

            if ( !options.cwd ) {
                options.cwd = self.cwd;
            }

            self._normalize_target_files(target_config);
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
    //     files: [ file ]
    // }

    // 4.
    // {
    //     files: [{src: [], dest: ...}]
    // }

    // all these types will be converted to {4}

    if ( 'src' in data || 'dest' in data ) {
        // we copy necessary properties of `data` to `data.files`,
        // including other configurations for grunt.file.expandMapping 
        data.files = util.mix({}, data);
        delete data.src;
        delete data.dest;

        // remove extra data
        delete data.files.options;
    }

    // undefined -> []
    if ( data.files ) {
        data.files = util.makeArray(data.files).map(this._normalize_file_config, this);   
    }
};

// resolve {src: [], dest: xxx } 
Hum.prototype._normalize_file_config = function(data) {
    // 'abc' -> { src: ['<cwd>/abc'] }
    if ( typeof data === 'string' ) {
        data = {
            src: [ this._resolve_path(data) ]
        };
        
    } else {
        if ( 'src' in data ) {
            data.src = util.makeArray(data.src).map(this._resolve_path, this);
        }

        if ( 'dest' in data ) {
            data.dest = this._resolve_path(data.dest);
        }

        delete data.cwd;
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
.promise('init', '_collect_configs')
.promise('npmTasks', '_load_npm_tasks')
.promise('task', '_collect_tasks')
.promise('multiTask', '_register_multi_task')
.promise('options', '_collect_options')
.done('_run_grunt');

