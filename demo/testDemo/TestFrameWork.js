var GRID = 0;
var TARGET = 1;
var SOURCE = 2;

/*Editor*/
TestFrameEditor = anra.gef.Editor.extend({
    background: '#FFFFFF',
    editorParts: null,

    input2model: function (input, rootModel) {
        var w = input.width || 40;

        var mapModel = new MapStruct(input.hnum, input.vnum, w);
        mapModel.initMapStruct(rootModel);

        nm = new anra.gef.NodeModel();
        nm.id = 'source';
        nm.setValue('width', w);
        nm.setValue('x', 5);
        nm.setValue('y', 5);
        nm.setValue('type', SOURCE);
        nm.setValue('color', 'red');
        rootModel.addChild(nm);
        this.source = nm;

        nm = new anra.gef.NodeModel();
        nm.id = 'target';
        nm.setValue('width', w);
        nm.setValue('x', 10);
        nm.setValue('y', 10);
        nm.setValue('type', TARGET);
        nm.setValue('color', 'blue');
        rootModel.addChild(nm);
        this.target = nm;

        var p = {x:4, y:5};
        var a = {x:4, y:5};
        var b = 'a';
        console.log(Tools.equals(p,a));
        /*var s = new Array();*/
        //console.log(Tools.equals(p,s));
        /*s.push(p);
        p.x = 11;
        p.y = 12;
        console.log(p.x + ',' + p.y);
        console.log(s.last().x + ',' + s.last().y);*/
        /*var a = Tools.deepCopy(p);
        console.log(p.x + ',' + p.y);
        console.log(a.x + ',' + a.y);
        a.x = 0; a.y = 0;
        console.log(p.x + ',' + p.y);
        console.log(a.x + ',' + a.y);
        var h = {x:10,y:10};
        a = Tools.deepCopy(h);
        a.x = 55;a.y=55;
        console.log(p.x + ',' + p.y);
        console.log(a.x + ',' + a.y);
        console.log(h.x + ',' + h.y);*/
    },

    createEditPart: function (context, model) {
        if (this.editorParts == null)
            this.editorParts = new Map();
        var part;

        var type = model.getValue('type');
        switch (type) {
            case GRID:
                part = new GridPart();
                break;
            case TARGET:
                part = new TargetPart();
                break;
            case SOURCE:
                part = new SourcePart();
                break;
            default:
                return null;
        }

        part.model = model;
        this.editorParts.put(model.id, part);
        return part;
    },

    getCustomPolicies: function () {}
});

/*Figure*/
RectFigure = anra.gef.Figure.extend({
    constructor: function () {
        anra.gef.Figure.prototype.constructor.call(this);
    },

    initProp: function () {
        this.setAttribute({
            fill: this.model.getValue('color'),
            stroke: 'black'
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

/*Map Struct Tools*/
MapStruct = Base.extend({
    constructor: function (h, v, w) {
        MapStruct.horizontalValue = h || MapStruct.horizontalValue;
        MapStruct.verticalValue = v || MapStruct.verticalValue;
        MapStruct.width = w || MapStruct.width;
    },

    initMapStruct: function (rootModel) {
        var vModels = null;
        for (var i = 0; i < MapStruct.verticalValue; i++) {
            vModels = [];
            for (var j = 0; j < MapStruct.horizontalValue; j++) {
                vModels[j] = this.createNodeModel(j, i);
                rootModel.addChild(vModels[j]);
            }
            MapStruct.mapMess[i] = vModels;
        }
    },

    createNodeModel: function (i, j) {
        var nm = new MapNodeModel();
        nm.initMapNodeModel();
        nm.setPosition(i, j, MapStruct.width);
        return nm;
    }
});
MapStruct.mapMess = [];
MapStruct.horizontalValue = 60;
MapStruct.verticalValue = 60;
MapStruct.width = 40;

/*model*/
MapNodeModel = anra.gef.NodeModel.extend({
    flag: null,
    listener: null,
    constructor: function () {
        anra.gef.NodeModel.prototype.constructor.call(this);
    },

    initMapNodeModel: function () {
        var node = this;
        this.flag = MapNodeModel.TRANSITABlLE;
        this.setValue("type", GRID);
        this.setValue('color', 'white');
        this.listener = function () {
            console.log(this instanceof MapNodeModel);//false
            //console.log(this instanceof anra.gef.NodeModel);
            //console.log(typeof this);
            //console.log(Object.prototype.toString.call(this));
            //console.log(node instanceof MapNodeModel);
            node.flag = node.flag == MapNodeModel.TRANSITABlLE ? MapNodeModel.IMPASSABILITY : MapNodeModel.TRANSITABlLE;
        }
        this.addPropertyListener(this.listener, 'color');
    },
    setPosition(x, y, w) {
        this.setValue('x', x);
        this.setValue('y', y);
        this.setValue('width', w);
        this.id = x + '_' + y;
    }
});
MapNodeModel.TRANSITABlLE = 'transitable';
MapNodeModel.IMPASSABILITY = 'impassability';
/*EditPart*/
CommonPart = anra.gef.NodeEditPart.extend({

    refreshVisual: function () {
        var x = this.model.getValue('x');
        var y = this.model.getValue('y');
        var w = this.model.getValue('width');
        this.figure.setBounds({
            x: x * w,
            y: y * w,
            width: w,
            height: w
        });
        this.figure.setAttribute({
            fill: this.model.getValue('color')
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
    createFigure: function () {
        var line = new CommonLine();
        line.router = function (line) {

            if (line.points == null || line.points.length < 2)
                return null;

            var sp = line.getStartPoint(),
                ep = line.getEndPoint();

            if (sp.x == ep.x && sp.y == ep.y)
                return null;

            var router = new BreadthFirstRouter();
            var points = router.router(line);

            return points;
        };
        return line;
    }
});

GridPart = CommonPart.extend({
    createEditPolicies: function (request) {
        this.installEditPolicy('click', new ClickGridPolicy());
    }
});

SourcePart = CommonPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.RootDragTracker();
    },

    createEditPolicies: function () {
        this.installEditPolicy('drag', new DragPolicy());
        this.installEditPolicy('connect', new AddLinePolicy());
    },

    createLineEditPart: function () {
        return new CommonLineEditPart();
    }
});

TargetPart = CommonPart.extend({
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

/*Policy*/
ClickGridPolicy = anra.gef.Policy.extend({
    activate: function () {
        var host = this.getHost();
        this.listener = function () {
            var color = host.model.getValue('color');
            host.model.setValue('color', color == 'white' ? 'gray' : 'white');
            //host.model.flag = (host.model.flag == MapNodeModel.TRANSITABlLE) ? MapNodeModel.IMPASSABILITY : MapNodeModel.TRANSITABlLE;
            host.refresh();
        };
        this.getHost().getFigure().addListener(anra.EVENT.MouseDown, this.listener);
    },

    deactivate: function () {
        this.getHost().getFigure().removeListener(anra.EVENT.MouseDown, this.listener);
    }
});

DragPolicy = anra.gef.Policy.extend({
    showTargetFeedback: function (request) {
        if (REQ_MOVE == request.type) {
            var x = request.event.x;
            var y = request.event.y;
            var w = 50;

            this.getHost().model.setValue('x', Math.floor(x / w));
            this.getHost().model.setValue('y', Math.floor(y / w));

            this.getHost().refresh();
        }
    },

    eraseTargetFeedback: function (request) {
        if (REQ_MOVE == request.type) {

        }
    }
});

AddLinePolicy = anra.gef.Policy.extend({
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
            /*            lineModel.sourceNode = ep.editor.source;

                        if (!this.flag) {
                            ep.editor.source.addSourceLine(lineModel);
                            ep.editor.target.addTargetLine(lineModel);
                            this.flag = true;
                        } else {
                            ep.editor.target.removeTargetLine(lineModel);
                            ep.editor.source.removeSourceLine(lineModel);
                            this.flag = false;
                        }
                        var t = ep.getRoot().getEditPart(ep.editor.target);
                        var s = ep.getRoot().getEditPart(ep.editor.source);*/

        }
        this.getHost().getFigure().addListener(anra.EVENT.MouseUp, this.listener);
    },

    deactivate: function () {
        this.getHost().getFigure().removeListener(anra.EVENT.MouseUp, this.listener);
    }
});

/*Line*/
CommonLine = anra.gef.Line.extend({
    init: function (model) {
        anra.gef.Line.prototype.init.call(this, model);
    },
    initProp: function () {
        this.setAttribute({
            fill: 'none',
            'stroke-width': 2,
            stroke: 'black'
        });
    }
});

/*Router*/
CommonRouter = Base.extend({
    absoluteToRelative: function (point) {
        if (point == null)
            return;

        point.x = Math.floor(point.x / MapStruct.width);
        point.y = Math.floor(point.y / MapStruct.width);
    },

    relativeToAbsolute: function (point) {
        if (point == null)
            return;

        point.x = point.x * MapStruct.width + MapStruct.width / 2;
        point.y = point.y * MapStruct.width + MapStruct.width / 2;
    }
});

BreadthFirstRouter = CommonRouter.extend({
    verticalDir: [[0, 1], [1, 0], [0, -1], [-1, 0]],
    diagonalDir: [[1, 1], [1, -1], [-1, -1], [-1, 1]],

    createVisistedRecord: function () {
        var v = [];
        var temp = null;

        for (var i = 0; i < MapStruct.verticalValue; i++) {
            temp = [];
            for (var j = 0; j < MapStruct.horizontalValue; j++) {
                temp[j] = 0;
            }
            v[i] = temp;
        }

        return v;
    },

    router: function (line) {
        var queue = new Array(); //处理点的队列
        var flag = false;
        var recordCrossMess = [];
        var visited = this.createVisistedRecord();
        var tempX = null;
        var tempY = null;
        //var path = new Map();
        var processPath = new Map();
        var points = [];
        var origin = line.getStartPoint();
        var tempPoint = null;
        var insertPoint = {x:null,y:null};
        this.absoluteToRelative(origin);
        var aim = line.getEndPoint();
        this.absoluteToRelative(aim);

        queue.push([origin,origin]);

        while (queue.length > 0) {
            tempPoint = Tools.deepCopy(queue.pop());
            if (visited[tempPoint[1].y][tempPoint[1].x] == 1)
                continue;

            visited[tempPoint[1].y][tempPoint[1].x] = 1;
            
            processPath.put(tempPoint[1].x + '_' + tempPoint[1].y, tempPoint[0]);

            if (tempPoint[1].x == aim.x && tempPoint[1].y == aim.y) {
                flag = true;
                break;
            }

            for (var i = 0; i < this.verticalDir.length; i++) {

                tempX = tempPoint[1].x + this.verticalDir[i][0];
                tempY = tempPoint[1].y + this.verticalDir[i][1];

                if (tempX >= 0 && tempX < MapStruct.horizontalValue &&
                    tempY >= 0 && tempY < MapStruct.verticalValue &&
                    MapStruct.mapMess[tempY][tempX].flag == MapNodeModel.TRANSITABlLE) {
                    insertPoint.x = tempX;
                    insertPoint.y = tempY;
                    queue.insert([tempPoint[1],Tools.deepCopy(insertPoint)], 0);
                    recordCrossMess[i] = 1;
                } else
                    recordCrossMess[i] = 0;
            }

            recordCrossMess[this.verticalDir.length] = recordCrossMess[0];
            for (var i = 0; i < this.diagonalDir.length; i++) {
                tempX = tempPoint[1].x + this.diagonalDir[i][0];
                tempY = tempPoint[1].y + this.diagonalDir[i][1];

                if (tempX >= 0 && tempX < MapStruct.horizontalValue &&
                    tempY >= 0 && tempY < MapStruct.verticalValue &&
                    MapStruct.mapMess[tempY][tempX].flag == MapNodeModel.TRANSITABlLE &&
                    (recordCrossMess[i] + recordCrossMess[i + 1]) > 0) {
                    insertPoint.x = tempX;
                    insertPoint.y = tempY;
                    queue.insert([tempPoint[1],Tools.deepCopy(insertPoint)], 0);
                }
            }

        }


        var aimX = aim.x;
        var aimY = aim.y;
        this.relativeToAbsolute(aim);
        points.push(aim);
        if (flag) {
            while (aimX != origin.x || aimY != origin.y) {
                var key = aimX + '_' + aimY;
                var tp = Tools.deepCopy(processPath.get(key));
                aimX = tp.x;
                aimY = tp.y;
                this.relativeToAbsolute(tp);
                points.insert(tp, 0);
            }
        }
        return points;
    }
});


/*Tools*/
Tools = {
    deepCopy : function(source) {
        var result = {};
        for (var key in source) {
            result[key] = typeof source[key] === 'object' ? this.deepCopy(source[key]) : source[key];
        }
        return result;
    },
    
    equals : function(arg1, arg2) {
        
        if(typeof arg1 != typeof arg2)
            return false;
        
        var type = typeof arg1;
        
        if(type == 'undefined')
            return false;
        
        if(type == 'string' || type == 'number' || type == 'boolean'){
            if(arg1 == arg2) {
                return true;
            }
            else 
                return false;
        }
        
        if(arg1 == null && arg2 == null)
            return true;
        
/*        if(typeof arg1 === 'object' && typeof arg2 === 'object'){
            for(var key1 in arg1) {
                for(var key2 in arg2) {
                    
                }
            }
        } else if(typeof arg1 !== 'object' && typeof arg2 !== 'object') {
            
        } else 
            return false;*/
        
        for(var key in arg1) {  
            if(!this.equals(arg1[key], arg2[key]))
                return false;
        }
        
        return true;
        
    }
}

