/**
 * Model
 */

/*地图节点模型*/
MapNodeModel = anra.gef.NodeModel.extend({
    constructor: function () {
        anra.gef.NodeModel.prototype.constructor.call(this);
        this.init();
    },
    init: function () {
        this.set('width', WIDTH);
    },
    setAbsolutePosition: function (x, y) {
        this.set('x', Math.floor(x / WIDTH));
        this.set('y', Math.floor(y / WIDTH));
    },
    setRelativePosition: function (x, y) {
        this.set('x', y);
        this.set('y', x);
    }
});

/*起点模型*/
SourceNodeModel = MapNodeModel.extend({
    constructor: function () {
        MapNodeModel.prototype.constructor.call(this);
    },
    init: function () {
        this.set('width', WIDTH);
        this.set('type', _SOURCE);
        this.set('color', 'red');
        this.setRelativePosition(1, 1);
        this.id = 'source';
    },
    refresh: function() {
        this.set('width', WIDTH);
    }
});
source = new SourceNodeModel();

/*终点模型*/
TargetNodeModel = MapNodeModel.extend({
    constructor: function () {
        MapNodeModel.prototype.constructor.call(this);
    },
    init: function () {
        this.set('width', WIDTH);
        this.set('type', _TARGET);
        this.set('color', 'blue');
        this.setRelativePosition(10, 10);
        this.id = 'target';
    },
    refresh: function() {
        this.set('width', WIDTH);
    }
});
target = new TargetNodeModel();

/*障碍模型*/
WallNodeModel = MapNodeModel.extend({
    constructor: function (x, y) {
        MapNodeModel.prototype.constructor.call(this);
        this.setAbsolutePosition(x, y);
        this.id = this.get('x') + '_' + this.get('y');
    },
    init: function () {
        this.set('width', WIDTH);
        this.set('type', _MAP);
        this.set('color', 'gray');
    }
});

/*寻路线Model*/
RouterLineModel = anra.gef.LineModel.extend({
    constructor: function () {
        anra.gef.LineModel.prototype.constructor.call(this);
        this.initRouterLine();
    },
    initRouterLine: function () {
        this.id = RouterLineModel.id;
        this.exit = 'source';
        this.entr = 'target';
    }
});
RouterLineModel.id = 'routerLine';
