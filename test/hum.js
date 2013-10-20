'use strict';

var expect = require('chai').expect;
var hum = require('../');

var node_path = require('path');

describe("hum", function(){
    it("all features", function(done){
        hum({
            path: node_path.join(__dirname, 'task-path'),
            cwd: 'test/fixtures'
        })
        .npmTasks('some-task')
        // 'blah' is inside 'some-task'
        .task('blah')
        .options({
            
        })
        .init({
            blah: {
                options: {
                    aa: 1,
                    cc: 4,
                },
                test: {
                    a: 1,
                    b: 2,

                    // this `options` will mix into `blah.options`
                    options: {
                        aa: 2,
                        bb: 3,
                    },

                    src: ['**/*.js']
                }
            }
        })
        .done(function(err){
            expect(!err).to.equal(true);
            done();
        })
    });
});
