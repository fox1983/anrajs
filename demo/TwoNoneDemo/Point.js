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
    set: function (key, value) {
        this._extraAttribute.put(key, value);
    },
    get: function (key) {
        if (!this._extraAttribute.has(key))
            return null;

        return this._extraAttribute.get(key);
    },
    toString: function () {
        return this.x + '_' + this.y;
    }
});