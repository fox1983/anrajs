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
        this.setValue('width', WIDTH);
    },
    setAbsolutePosition: function (x, y) {
        this.setValue('x', Math.floor(x / WIDTH));
        this.setValue('y', Math.floor(y / WIDTH));
    },
    setRelativePosition: function (x, y) {
        this.setValue('x', y);
        this.setValue('y', x);
    },
    refresh: function () {
        this.setValue('width', WIDTH);
    },
    equals: function (o) {
        return (this == o || this.id == o.id);
    }
});

/*起点模型*/
SourceNodeModel = MapNodeModel.extend({
    constructor: function () {
        MapNodeModel.prototype.constructor.call(this);
    },
    init: function () {
        this.setValue('width', WIDTH);
        this.setValue('type', _SOURCE);
        this.setValue('color', 'red');
        this.setRelativePosition(1, 1);
        this.id = 'source';
    },
    refresh: function () {
        this.setValue('width', WIDTH);
    }
});
source = new SourceNodeModel();

/*终点模型*/
TargetNodeModel = MapNodeModel.extend({
    constructor: function () {
        MapNodeModel.prototype.constructor.call(this);
    },
    init: function () {
        this.setValue('width', WIDTH);
        this.setValue('type', _TARGET);
        this.setValue('color', 'blue');
        this.setRelativePosition(10, 10);
        this.id = 'target';
    },
    refresh: function () {
        this.setValue('width', WIDTH);
    }
});
target = new TargetNodeModel();

/*障碍模型*/
WallNodeModel = MapNodeModel.extend({
    constructor: function (x, y) {
        MapNodeModel.prototype.constructor.call(this);
        this.setAbsolutePosition(x, y);
        this.id = this.getValue('x') + '_' + this.getValue('y');
    },
    init: function () {
        this.setValue('width', WIDTH);
        this.setValue('type', _MAP);
        this.setValue('color', 'gray');
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
        this.sourceTerminal = 'source';
        this.targetTerminal = 'target';
    }
});
RouterLineModel.id = 'routerLine';
