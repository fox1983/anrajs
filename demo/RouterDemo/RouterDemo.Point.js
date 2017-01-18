/**
 * Point
 */

/*点对象*/
Point = Base.extend({
    x: null,
    y: null,
    parent: null,
    state: null,
    _extraAttribute: null,
    constructor: function (x, y) {
        this.x = x;
        this.y = y;
        this.state = Point.notFound;
        this._extraAttribute = new Map();
    },
    setPosition: function (x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
    },
    setParent: function (point) {
        if (point instanceof Point) {
            this.parent = point;
        }
    },
    setValue: function (key, value) {
        this._extraAttribute.put(key, value);
    },
    getValue: function (key) {
        if (!this._extraAttribute.has(key))
            return null;

        return this._extraAttribute.get(key);
    },
    toString: function () {
        return this.x + '_' + this.y;
    }
});

wallPoint = Point.extend({
    constructor : function() {
        Point.prototype.constructor.call(this);
    }
});

/*基本状态*/
Point.notFound = 1 << 1;
Point.inOpen = 1 << 2;
Point.inClosed = 1 << 3;

/*方向*/
Point.forward = 1 << 4;
Point.backward = 1 << 5;