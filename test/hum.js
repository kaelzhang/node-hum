'use strict';

var expect = require('chai').expect;
var hum = require('../');

var node_path = require('path');
var cwd = node_path.resolve('test/fixtures');


function run (done) {
    hum({
        path: node_path.join(__dirname, 'task-path'),
        cwd: cwd
    })
    .npmTasks('some-task')
    // 'blah' is inside 'some-task'
    .task('blah')
    .options({
        stack: true
    })
    .init({
        // with is not a task config
        pkg: {
            name: {
            }, 

            // #4
            // with will throw an error:
            // "TypeError: Cannot use 'in' operator to search for 'src' in abc"
            description: "abc"
        },
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

                src: ['**/*.js'],
                dest: 'abc'
            }
        }
    })
    .done(function(err){
        expect(!err).to.equal(true);
        done();
    })
}

describe("hum", function(){
    it("all features", function(done){
        run(done);
    });

    it("run several grunt task, but should not messed up", function(done){
        run(done);
    });
});
