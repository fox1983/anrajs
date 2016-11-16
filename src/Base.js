/*
 Base.js, version 1.1a
 Copyright 2006-2009, Dean Edwards
 License: http://www.opensource.org/licenses/mit-license.php
 */

var Base = function () {
    // dummy
};
Base.extend = function (_instance, _static) { // subclass
    var extend = Base.prototype.extend;

    // build the prototype
    Base._prototyping = true;
    var proto = new this;
    extend.call(proto, _instance);
    proto.base = function () {
        // call this method from any other method to invoke that method's ancestor
    };
    delete Base._prototyping;

    // create the wrapper for the constructor function
    //var constructor = proto.constructor.valueOf(); //-dean
    var constructor = proto.constructor;
    var klass = proto.constructor = function () {
        if (!Base._prototyping) {
            if (this._constructing || this.constructor == klass) { // instantiation
                this._constructing = true;
                constructor.apply(this, arguments);
                delete this._constructing;
            } else if (arguments[0] != null) { // casting
                return (arguments[0].extend || extend).call(arguments[0], proto);
            }
        }
    };

    // build the class interface
    klass.ancestor = this;
    klass.extend = this.extend;
    klass.forEach = this.forEach;
    klass.implement = this.implement;
    klass.prototype = proto;
    klass.toString = this.toString;
    klass.valueOf = function (type) {
        //return (type == "object") ? klass : constructor; //-dean
        return (type == "object") ? klass : constructor.valueOf();
    };
    extend.call(klass, _static);
    // class initialisation
    if (typeof klass.init == "function") klass.init();
    return klass;
};

Base.prototype = {
    extend:function (source, value) {
        if (arguments.length > 1) { // extending with a name/value pair
            var ancestor = this[source];
            if (ancestor && (typeof value == "function") && // overriding a method?
                // the valueOf() comparison is to avoid circular references
                (!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
                /\bbase\b/.test(value)) {
                // get the underlying method
                var method = value.valueOf();
                // override
                value = function () {
                    var previous = this.base || Base.prototype.base;
                    this.base = ancestor;
                    var returnValue = method.apply(this, arguments);
                    this.base = previous;
                    return returnValue;
                };
                // point to the underlying method
                value.valueOf = function (type) {
                    return (type == "object") ? value : method;
                };
                value.toString = Base.toString;
            }
            this[source] = value;
        } else if (source) { // extending with an object literal
            var extend = Base.prototype.extend;
            // if this object has a customised extend method then use it
            if (!Base._prototyping && typeof this != "function") {
                extend = this.extend || extend;
            }
            var proto = {toSource:null};
            // do the "toString" and other methods manually
            var hidden = ["constructor", "toString", "valueOf"];
            // if we are prototyping then include the constructor
            var i = Base._prototyping ? 0 : 1;
            while (key = hidden[i++]) {
                if (source[key] != proto[key]) {
                    extend.call(this, key, source[key]);

                }
            }
            // copy each of the source object's properties to this object
            for (var key in source) {
                if (!proto[key]) extend.call(this, key, source[key]);
            }
        }
        return this;
    }
};

// initialise
Base = Base.extend({
    constructor:function () {
        this.extend(arguments[0]);
    }
}, {
    ancestor:Object,
    version:"1.1",

    forEach:function (object, block, context) {
        for (var key in object) {
            if (this.prototype[key] === undefined) {
                block.call(context, object[key], key, object);
            }
        }
    },

    implement:function () {
        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] == "function") {
                // if it's a function, call it
                arguments[i](this.prototype);
            } else {
                // add the interface using the extend method
                this.prototype.extend(arguments[i]);
            }
        }
        return this;
    },

    toString:function () {
        return String(this.valueOf());
    }
});

/**
 * HashMap - HashMap Class for JavaScript
 * @author Ariel Flesler <aflesler@gmail.com>
 * @version 2.0.6
 * Homepage: https://github.com/flesler/hashmap
 */

(function (factory) {
    /* global define */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object') {
        // Node js environment
        var HashMap = module.exports = factory();
        // Keep it backwards compatible
        HashMap.HashMap = HashMap;
    } else {
        // Browser globals (this is window)
        this.HashMap = factory();
    }
}(function () {

    function HashMap(other) {
        this.clear();
        switch (arguments.length) {
            case 0:
                break;
            case 1:
                this.copy(other);
                break;
            default:
                multi(this, arguments);
                break;
        }
    }

    var proto = HashMap.prototype = {
        constructor:HashMap,

        get:function (key) {
            var data = this._data[this.hash(key)];
            return data && data[1];
        },

        set:function (key, value) {
            // Store original key as well (for iteration)
            var hash = this.hash(key);
            if (!(hash in this._data)) {
                this._count++;
            }
            this._data[hash] = [key, value];
        },

        multi:function () {
            multi(this, arguments);
        },

        copy:function (other) {
            for (var hash in other._data) {
                if (!(hash in this._data)) {
                    this._count++;
                }
                this._data[hash] = other._data[hash];
            }
        },

        has:function (key) {
            return this.hash(key) in this._data;
        },

        search:function (value) {
            for (var key in this._data) {
                if (this._data[key][1] === value) {
                    return this._data[key][0];
                }
            }

            return null;
        },

        remove:function (key) {
            var hash = this.hash(key);
            if (hash in this._data) {
                this._count--;
                delete this._data[hash];
            }
        },

        type:function (key) {
            var str = Object.prototype.toString.call(key);
            var type = str.slice(8, -1).toLowerCase();
            // Some browsers yield DOMWindow for null and undefined, works fine on Node
            if (type === 'domwindow' && !key) {
                return key + '';
            }
            return type;
        },

        keys:function () {
            var keys = [];
            this.forEach(function (_, key) {
                keys.push(key);
            });
            return keys;
        },

        values:function () {
            var values = [];
            this.forEach(function (value) {
                values.push(value);
            });
            return values;
        },

        count:function () {
            return this._count;
        },

        clear:function () {
            // TODO: Would Object.create(null) make any difference
            this._data = {};
            this._count = 0;
        },

        clone:function () {
            return new HashMap(this);
        },

        hash:function (key) {
            switch (this.type(key)) {
                case 'undefined':
                case 'null':
                case 'boolean':
                case 'number':
                case 'regexp':
                    return key + '';

                case 'date':
                    return '♣' + key.getTime();

                case 'string':
                    return '♠' + key;

                case 'array':
                    var hashes = [];
                    for (var i = 0; i < key.length; i++) {
                        hashes[i] = this.hash(key[i]);
                    }
                    return '♥' + hashes.join('⁞');

                default:

                    if (key.hashCode != null) {
                        return '♠' + key.hashCode();
                    }
                    // TODO: Don't use expandos when Object.defineProperty is not available?
                    if (!key.hasOwnProperty('_hmuid_')) {
                        key._hmuid_ = ++HashMap.uid;
                        hide(key, '_hmuid_');
                    }

                    return '♦' + key._hmuid_;
            }
        },

        forEach:function (func, ctx) {
            for (var key in this._data) {
                var data = this._data[key];
                func.call(ctx || this, data[1], data[0]);
            }
        }
    };

    HashMap.uid = 0;

    //- Add chaining to all methods that don't return something

    ['set', 'multi', 'copy', 'remove', 'clear', 'forEach'].forEach(function (method) {
        var fn = proto[method];
        proto[method] = function () {
            fn.apply(this, arguments);
            return this;
        };
    });

    //- Utils

    function multi(map, args) {
        for (var i = 0; i < args.length; i += 2) {
            map.set(args[i], args[i + 1]);
        }
    }

    function hide(obj, prop) {
        // Make non iterable if supported
        if (Object.defineProperty) {
            Object.defineProperty(obj, prop, {enumerable:false});
        }
    }

    return HashMap;
}));

function intersection(x0, y0, r0, x1, y1, r1) {
    var a, dx, dy, d, h, rx, ry;
    var x2, y2;

    /* dx and dy are the vertical and horizontal distances between
     * the circle centers.
     */
    dx = x1 - x0;
    dy = y1 - y0;

    /* Determine the straight-line distance between the centers. */
    d = Math.sqrt((dy * dy) + (dx * dx));

    /* Check for solvability. */
    if (d > (r0 + r1)) {
        /* no solution. circles do not intersect. */
        return false;
    }
    if (d < Math.abs(r0 - r1)) {
        /* no solution. one circle is contained in the other */
        return false;
    }

    /* 'point 2' is the point where the line through the circle
     * intersection points crosses the line between the circle
     * centers.
     */

    /* Determine the distance from point 0 to point 2. */
    a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d);

    /* Determine the coordinates of point 2. */
    x2 = x0 + (dx * a / d);
    y2 = y0 + (dy * a / d);

    /* Determine the distance from point 2 to either of the
     * intersection points.
     */
    h = Math.sqrt((r0 * r0) - (a * a));

    /* Now determine the offsets of the intersection points from
     * point 2.
     */
    rx = -dy * (h / d);
    ry = dx * (h / d);

    /* Determine the absolute intersection points. */
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;

    return [xi, xi_prime, yi, yi_prime];
}