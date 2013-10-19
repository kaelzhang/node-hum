# hum [![NPM version](https://badge.fury.io/js/hum.png)](http://badge.fury.io/js/hum) [![Build Status](https://travis-ci.org/kaelzhang/node-hum.png?branch=master)](https://travis-ci.org/kaelzhang/node-hum) [![Dependency Status](https://gemnasium.com/kaelzhang/node-hum.png)](https://gemnasium.com/kaelzhang/node-hum)

**hum** could run global grunt tasks which searched from specified paths.

## Installation

```sh
npm install hum --save
```

## Usage

Actually, `hum` is an alternative of **Gruntfile.js** and supplies a bunch of promise-style APIs.

With `hum`, you could replace the code inside 'Gruntfile.js' with hum methods, and search available tasks only from your specified paths, as well as the `PATH` and `NODE_PATH` do.

So, it becomes possible for you to run a same tier of tasks for severial different projects.

```js
var hum = require('hum');

hum({
	path: '</path/to/search>'
})
.npmTasks('my-task')
.task('blah') // blah is defined in my-task
.init({
	blah: {
		// target must be defined
		test: {
		}
	}
})
.options({
	verbose: true
})
.done(function(err){
})
```

### Constructor: hum(options)

Creates a hum instance.

- options.path `path` the path(s) to search tasks from
- options.cwd `path` `options.cwd` will be added to every target of each task configuration.

### .npmTasks(moduleName)

Similar as `grunt.loadNpmTasks()`


### .task(taskname)

Specifies the tasks to run, if no task is specified, hum will try to run the `'default'` task.

### .init(config)

Similar to `grunt.initConfig()`

### .options(options)

Sets options for grunt cli.


### .done(callback)

The promised callback.



