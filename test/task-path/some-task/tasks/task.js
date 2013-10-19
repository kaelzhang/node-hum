'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask(
        'blah',
        'test task',
        function () {
            var done = this.async();

            var options = this.options();

            if ( options.cwd !== 'abc' ) {
                grunt.fail.fatal('"cwd" should be "abc"')
            }

            done(null);
        }
    );
};