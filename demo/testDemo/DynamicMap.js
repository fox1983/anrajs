var SOURCE = 1;
var TARGET = 2;
var MAP = 3;

/*Editor*/
DynamicMapEditor = anra.gef.Editor.extend({
    background: '#FFFFFF',
    editorParts: null,

    input2model: function (input, rootModel) {
        MapNodeModel.setNodeAttribute(input.width, input.vnum, input.hnum);

        /*临时source与target*/
        nm = new anra.gef.NodeModel();
        nm.id = 'source';
        nm.set('width', MapNodeModel.width);
        nm.set('x', 5);
        nm.set('y', 5);
        nm.set('type', SOURCE);
        nm.set('color', 'red');
        nm.set('stroke', 'black');
        rootModel.addChild(nm);
        this.source = nm;
        //nm.editPartClass = EditPartRegistry[nm.type];
        nm = new anra.gef.NodeModel();
        nm.id = 'target';
        nm.set('width', MapNodeModel.width);
        nm.set('x', 10);
        nm.set('y', 10);
        nm.set('type', TARGET);
        nm.set('color', 'blue');
        nm.set('stroke', 'black');
        rootModel.addChild(nm);
        this.target = nm;
        
        var m = new Map();
        m.put(1,2);
        console.log(m.has(1));
    },
    createEditPart: function (context, model) {
        if (this.editorParts == null)
            this.editorParts = new Map();

        var part;
        var type = model.get('type');

        if (type == SOURCE)
            part = new SourcePart();
        else if (type == TARGET)
            part = new TargetPart();
        else if (type == MAP) {
            part = new MapEditPart();
        }
        part.model = model;
        this.editorParts.put(model.id, part);
        return part;
    },
    initRootEditPart: function (editPart) {

    },
    getCustomPolicies: function () {
        this.put('createWall', new CreateWallPolicy());
        //this.put('createWall', new TestPolicy());
    }
});

/*Map Struct*/
MapStruct = Base.extend({

});
MapStruct.struct = new Map();


/*Model*/
MapNodeModel = anra.gef.NodeModel.extend({
    constructor: function () {
        anra.gef.NodeModel.prototype.constructor.call(this);
        this.initMapModel();
    },
    initMapModel: function () {
        this.set('width', MapNodeModel.width);
        this.set('type', MAP);
        this.set('color', 'gray');
        this.set('stroke', 'black');
    },
    setPosition: function (x, y) {
        x = Math.floor(x / MapNodeModel.width);
        y = Math.floor(y / MapNodeModel.width);

        this.id = x + '_' + y;
        this.set('x', x);
        this.set('y', y);
    },
    conversion() {
        if (this.get('color') == 'gray') {
            this.set('color', 'white');
            this.set('stroke', 'white');
        } else {
            this.set('color', 'gray');
            this.set('stroke', 'black');
        }
    }
});
MapNodeModel.setNodeAttribute = function (width, vnum, hnum) {
    MapNodeModel.width = MapNodeModel.width || width;
    MapNodeModel.verticalValue = MapNodeModel.verticalValue || vnum;
    MapNodeModel.horizontalValue = MapNodeModel.horizontalValue || hnum;
};
MapNodeModel.horizontalValue = 60;
MapNodeModel.verticalValue = 60;
MapNodeModel.width = 40;

/*EditPart*/
CommonNodeEditPart = anra.gef.NodeEditPart.extend({
    refreshVisual: function () {
        var x = this.model.get('x');
        var y = this.model.get('y');
        var w = this.model.get('width');
        this.figure.setBounds({
            x: x * w,
            y: y * w,
            width: w,
            height: w
        });
        this.figure.setAttribute({
            fill: this.model.get('color'),
            stroke: this.model.get('stroke')
        });
        this.figure.paint();
    },

    createDragTracker: function () {
        return null;
    },

    createFigure: function () {
        return new RectFigure();
    }
});

CommonLineEditPart = anra.gef.LineEditPart.extend({
    routerProcessor: null,
    createFigure: function () {
        var line = new CommonLine();

        return line;
    }
});

MapEditPart = CommonNodeEditPart.extend({
    createEditPolicies: function () {
        this.installEditPolicy('clickDestroy', new ClickDestroyPolicy());
    },
    createFigure: function () {
        return new RectFigure();
    }
});

GridPart = CommonNodeEditPart.extend({

});

SourcePart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.DragTracker();
    },

    createEditPolicies: function () {
        this.installEditPolicy('drag', new DragPolicy());
        this.installEditPolicy('createPath', new CreatePathPolicy());
    },
    createLineEditPart: function () {
        return new CommonLineEditPart();
    }
});

TargetPart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.RootDragTracker();
    },

    createEditPolicies: function () {
        this.installEditPolicy('drag', new DragPolicy());
    },

    createLineEditPart: function () {
        return new CommonLineEditPart();
    }
});

/*Figure*/
RectFigure = anra.gef.Figure.extend({
    constructor: function () {
        anra.gef.Figure.prototype.constructor.call(this);
    },

    initProp: function () {
        this.setAttribute({
            fill: this.model.get('color'),
            stroke: this.model.get('stroke')
        });
    },

    getTargetAnchor: function (line) {
        return {
            x: this.fattr('x') + this.fattr('width') / 2,
            y: this.fattr('y') + this.fattr('height') / 2
        };
    },

    getSourceAnchor: function (line) {
        return {
            x: this.fattr('x') + this.fattr('width') / 2,
            y: this.fattr('y') + this.fattr('height') / 2
        };
    }
});

CommonLine = anra.gef.Line.extend({
    routerProcessor: null,
    init: function (model) {
        anra.gef.Line.prototype.init.call(this, model);
    },
    initProp: function () {
        this.setAttribute({
            fill: 'none',
            'stroke-width': 2,
            stroke: 'yellow'
        });
    },
    router: function (line) {
        if (!this.isLine(line))
            return null;

        var sp = line.getStartPoint(),
            ep = line.getEndPoint();

        var mid = (sp.x + ep.x) / 2;
        var p1 = {
            x: mid,
            y: sp.y
        };

        var p2 = {
            x: mid,
            y: ep.y
        };
        return [sp, p1, p2, ep];

    },
    isLine: function (line) {
        if (line.points == null || line.points.length < 2)
            return false;

        if (Tools.equals(line.getEndPoint(), line.getStartPoint()))
            return false;

        return true;
    }
});



/*Policy*/
DragPolicy = anra.gef.Policy.extend({
    showTargetFeedback: function (request) {
        if (REQ_MOVE == request.type) {
            var x = request.event.x;
            var y = request.event.y;
            var w = MapNodeModel.width;

            x = Math.floor(x / w);
            y = Math.floor(y / w);

            if (x < 0)
                this.getHost().model.set('x', 0);
            else if (x > MapNodeModel.horizontalValue)
                this.getHost().model.set('x', MapNodeModel.horizontalValue);
            else
                this.getHost().model.set('x', x);

            if (y < 0)
                this.getHost().model.set('y', 0);
            else if (y > MapNodeModel.verticalValue)
                this.getHost().model.set('y', MapNodeModel.verticalValue = 60);
            else
                this.getHost().model.set('y', y);

            this.getHost().refresh();
        }
    },

    eraseTargetFeedback: function (request) {
        if (REQ_MOVE == request.type) {

        }
    }
});

CreateWallPolicy = anra.gef.Policy.extend({
    activate: function () {
        var host = this.getHost();
        this.listener = function (e) {
            var mn = new MapNodeModel();
            var x = e.x;
            var y = e.y;

            mn.setPosition(x, y);
            host.editor.rootModel.addChild(mn);
            host.refresh();
        };
        this.getHost().getFigure().addListener(anra.EVENT.MouseDown, this.listener);

    },
    deactivate: function () {
        this.getHost().getFigure().removeListener(anra.EVENT.MouseDown, this.listener);
    }
});

ClickDestroyPolicy = anra.gef.Policy.extend({
    activate: function () {
        var host = this.getHost();
        this.listener = function (e) {
            host.getRoot().model.removeChild(host.model);
            host.getRoot().refresh();
        }
        this.getHost().getFigure().addListener(anra.EVENT.MouseDown, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().removeListener(anra.EVENT.MouseDown, this.listener);
    }
});

CreatePathPolicy = anra.gef.Policy.extend({

    flag: false,
    lineId: 'line',

    createLineModel: function () {
        var lineModel = new anra.gef.LineModel();
        lineModel.id = this.lineId;
        return lineModel;
    },
    activate: function () {
        var ep = this.getHost();
        this.listener = function () {
            if (!this.flag) {
                var ld = new anra.gef.LineModel();
                ld.id = this.lineId;
                ep.editor.source.addSourceLine(ld);
                ep.editor.target.addTargetLine(ld);
                this.flag = true;
            } else {
                var ld = ep.editor.target.getTargetLine(this.lineId);
                var linePart = ep.getRoot().getEditPart(ld);
                linePart.unregister();
                this.flag = false;
            }

            var t = ep.getRoot().getEditPart(ep.editor.target);
            var s = ep.getRoot().getEditPart(ep.editor.source);

            s.refresh();
            t.refresh();

        }
        this.getHost().getFigure().addListener(anra.EVENT.MouseUp, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().removeListener(anra.EVENT.MouseUp, this.listener);
    }
});

/*routerProcessor*/
CommonRouterProcessor = Base.extend({
    verticalDir: [[0, 1], [1, 0], [0, -1], [-1, 0]],
    diagonalDir: [[1, 1], [1, -1], [-1, -1], [-1, 1]],

    absoluteToRelative: function (point) {
        if (point == null)
            return;

        var newPoint = {
            x: null,
            y: null
        };
        
        newPoint.x = Math.floor(point.x / MapNodeModel.width);
        newPoint.y = Math.floor(point.y / MapNodeModel.width);
        
        return newPoint;
    },

    relativeToAbsolute: function (point) {
        if (point == null)
            return;
        
        var newPoint = {
            x: null,
            y: null
        };
        
        newPoint.x = point.x * MapNodeModel.width + MapNodeModel.width / 2;
        newPoint.y = point.y * MapNodeModel.width + MapNodeModel.width / 2;
        
        return newPoint;
    }
});

BFSRouterProcessor = CommonRouterProcessor.extend({
    process: function (line) {
        var queue = new Array(); //处理队列
        
        var origin = this.absoluteToRelative(line.getStartPoint());
        var aim = this.absoluteToRelative(line.getEndPoint());
        
        var targetPoint = null;//处理节点
        
        queue.push([origin,origin]);
        
        while(queue.length > 0) {
            targetPoint = Tools.deepCopy(queue.pop);    
        }

    }
});

/*Tools*/
Tools = {
    deepCopy: function (source) {
        var result = {};
        for (var key in source) {
            result[key] = typeof source[key] === 'object' ? this.deepCopy(source[key]) : source[key];
        }
        return result;
    },

    equals: function (arg1, arg2) {

        if (typeof arg1 != typeof arg2)
            return false;

        var type = typeof arg1;

        if (type == 'undefined')
            return false;

        if (type == 'string' || type == 'number' || type == 'boolean') {
            if (arg1 == arg2) {
                return true;
            } else
                return false;
        }

        if (arg1 == null && arg2 == null)
            return true;

        /*        if(typeof arg1 === 'object' && typeof arg2 === 'object'){
                    for(var key1 in arg1) {
                        for(var key2 in arg2) {
                            
                        }
                    }
                } else if(typeof arg1 !== 'object' && typeof arg2 !== 'object') {
                    
                } else 
                    return false;*/

        for (var key in arg1) {
            if (!this.equals(arg1[key], arg2[key]))
                return false;
        }

        return true;

    }
}
