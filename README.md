# hum [![NPM version](https://badge.fury.io/js/hum.png)](http://badge.fury.io/js/hum) [![Build Status](https://travis-ci.org/kaelzhang/node-hum.png?branch=master)](https://travis-ci.org/kaelzhang/node-hum) [![Dependency Status](https://gemnasium.com/kaelzhang/node-hum.png)](https://gemnasium.com/kaelzhang/node-hum)

Play with grunt.

## Features

- **hum** could run [grunt](http://gruntjs.com) inside a specified cwd and search tasks from the given paths.
- **hum** instances will be executed in series to prevent grunt (_which is composed of global variables and singletons_) fucking up with himself.
- **hum** provides a programmatical way to run [grunt](http://gruntjs.com) tasks.

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
	path: '</path/to/search>',
	cwd: 
})
.npmTasks('my-task')
.task('blah') // blah is defined in my-task
.init({
	// task name
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

##### options.path 

type `path` 

The path(s) to search tasks from.

##### options.cwd

type `path`, default to the `process.cwd`.

It will be added to every target of each task configuration and will affect all configurations related to `files`, `src`, and `dest`.

##### options.strict_path

type `Boolean`, default to `false`

By default, hum will concat the `NODE_PATH` to the end of the path list.

### .npmTasks(moduleName)

Similar to `grunt.loadNpmTasks(moduleName)`


### .task(taskname)

Specifies the tasks to run, if no task is specified, hum will try to run the `'default'` task.

### .init(config)

Similar to `grunt.initConfig(config)`

### .options(options)

Sets options for grunt cli.

`.options({verbose: true})` is equivalent to `grunt --verbose`.


### .done(callback)

The promised callback.



