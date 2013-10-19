'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask(
        'some-task',
        'test task',
        function () {
            console.log('');
        }
    );
};