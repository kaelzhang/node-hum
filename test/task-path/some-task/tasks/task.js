'use strict';

var expect = require('chai').expect;
var node_path = require('path');

module.exports = function (grunt) {
    grunt.registerMultiTask(
        'blah',
        'test task',
        function () {
            var options = this.options();

            var cwd = node_path.join(__dirname, '..', '..', '..', 'fixtures');

            var js_files = grunt.file.expand( node_path.join(cwd, '**/*.js') );


            expect(options.cwd).to.equal( cwd );
            expect(this.files[0].src).to.deep.equal(js_files);

            var done = this.async();
            done();
        }
    );
};