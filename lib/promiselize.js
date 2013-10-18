'use strict';

module.exports = promiselize;

var util = require('./util');


function promiselize (options) {
    return new Promiselize(options || {});
}


function Promiselize (options) {
    this._host = options.host;
};


function CHAIN () {
    return this;
};


Promiselize.prototype.promise = function(method_name, once, extra) {
    var props = {};
    var _method_name = '_' + method_name;

    props[method_name] = function () {
        this[_method_name].push( util.makeArray(arguments) );

        if ( once ) {
            this[method_name] = CHAIN;
        }

        if ( extra ) {
            extra.apply(this, arguments);
        }

        return this;
    };

    props[_method_name] = {
        get function () {
            if ( !this.hasOwnProperty(_method_name) ) {
                // create the real value
                this[_method_name] = [];
            }

            return this[_method_name];
        }
    };

    this._args.push(_method_name);

    Object.defineProperties(this._host, prop);

    return this;
};