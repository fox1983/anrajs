/**
 * 数据模型
 */
MapNodeModel = anra.gef.NodeModel.extend({
    constructor: function () {
        anra.gef.NodeModel.prototype.constructor.call(this);
    },
    setRelativePosition: function (point) {
        var b = this.get('bounds');

        b[0] = point.x * DEFAULT_WIDTH;
        b[1] = point.y * DEFAULT_HEIGHT;

        this.set('bounds', b);
    },
    setSize: function(width, height) {
        var b = this.get('bounds');
        
        b[2] = width;
        b[3] = height;
        
        this.set('bounds', b);
        this.set('width', width);
        this.set('height', height);
    },
    getPoint: function () {
        //TODO
    }
});

/**
 * 起点模型
 * 1.长宽完全确定不允许改动
 */
StartModel = MapNodeModel.extend({
    constructor: function () {
        MapNodeModel.prototype.constructor.call(this);
        this.init();
    },
    init: function () {
        this.set('width', DEFAULT_WIDTH);
        this.set('height', DEFAULT_HEIGHT);
        this.set('type', START);
        this.set('color', 'red');
        this.set('bounds', [0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT]);
    },
    setToEnd: function (end) {
        this.end = end;
        this.id = Util.createId();
        this.end.id = Util.createId();
    },
    getEnd: function () {
        return this.end;
    }
});

/**
 * 终点模型
 */
EndModel = MapNodeModel.extend({
    constructor: function () {
        MapNodeModel.prototype.constructor.call(this);
        this.init();
    },
    init: function () {
        this.set('width', DEFAULT_WIDTH);
        this.set('height', DEFAULT_HEIGHT);
        this.set('type', END);
        this.set('color', 'blue');
        this.set('bounds', [0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT]);
    }
});

WallModel = MapNodeModel.extend({
    constructor: function () {
        MapNodeModel.prototype.constructor.call(this);
        this.init();
    },
    init: function () {
        this.set('width', DEFAULT_WIDTH);
        this.set('height', DEFAULT_HEIGHT);
        this.set('type', WALL);
        this.set('color', 'gray');
        this.set('bounds', [0, 0,
            DEFAULT_WIDTH,
            DEFAULT_HEIGHT]);
    },
    setAbsolutePosition: function (x, y) {
        var b = this.get('bounds');
        
        b[0] = x;
        b[1] = y;
        this.set('bounds', b);
        this.id = this.calRelativePosition(x, b[2]) + '_' + this.calRelativePosition(y, b[3]);
    },
    calRelativePosition : function(absolute, off) {
        return Math.floor(absolute/off);
    }
});

//起点与终点的默认长宽确定长度(不允许改动)
DEFAULT_WIDTH = 25;
DEFAULT_HEIGHT = 25;
