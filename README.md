[![Build Status](https://travis-ci.org/kaelzhang/node-hum.png?branch=master)](https://travis-ci.org/kaelzhang/node-hum)

# hum


```
var hum = require('hum');

hum({
	path: '</path/to/search>'
})
.run('../Gruntfile.js')  // or .run(require('../gruntfile.js'))
.npmTasks('grunt-contrib-less')
.task('haha', ['less'])
.config({
	less: {}
})
.multiTasks('haha', 'haha', function(){ ... })

.done(function(){
})
```