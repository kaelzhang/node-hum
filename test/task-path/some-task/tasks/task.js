'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask(
        'blah',
        'test task',
        function () {
            var done = this.async();
            done(null);
        }
    );
};