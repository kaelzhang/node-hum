'use strict';

var expect = require('chai').expect;
var node_path = require('path');

module.exports = function (grunt) {
    grunt.registerMultiTask(
        'blah',
        'test task',
        function () {
            var options = this.options({dd: 10});

            var cwd = node_path.join(__dirname, '..', '..', '..', 'fixtures');

            var js_files = grunt.file.expand( node_path.join(cwd, '**/*.js') ).sort();

            // expect(options.cwd).to.equal( cwd );
            expect(options.aa).to.equal(2);
            expect(options.cc).to.equal(4);
            expect(options.bb).to.equal(3);
            expect(options.dd).to.equal(10);
            
            expect(
                this.files.map(function (f) {
                    return f.src[0]

                }).sort()
                
            ).to.deep.equal(js_files);

            var done = this.async();
            done();
        }
    );
};