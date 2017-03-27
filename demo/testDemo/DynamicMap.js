var SOURCE = 1;
var TARGET = 2;
var MAP = 3;
var FIND = 4;

/*Editor*/
DynamicMapEditor = anra.gef.Editor.extend({
    background: '#FFFFFF',
    editorParts: null,

    input2model: function (input, rootModel) {
        MapNodeModel.setNodeAttribute(input.width, input.vnum, input.hnum);

        /*临时source与target*/
        nm = new anra.gef.NodeModel();
        nm.id = 'source';
        nm.setValue('width', MapNodeModel.width);
        nm.setValue('x', 5);
        nm.setValue('y', 5);
        nm.setValue('type', SOURCE);
        nm.setValue('color', 'red');
        MapStruct.setSource(nm);
        rootModel.addChild(nm);

        nm = new anra.gef.NodeModel();
        nm.id = 'target';
        nm.setValue('width', MapNodeModel.width);
        nm.setValue('x', 10);
        nm.setValue('y', 10);
        nm.setValue('type', TARGET);
        nm.setValue('color', 'blue');
        MapStruct.setTarget(nm);
        rootModel.addChild(nm);
    },
    createEditPart: function (context, model) {
        if (this.editorParts == null)
            this.editorParts = new Map();

        var part;
        var type = model.getValue('type');

        if (type == SOURCE)
            part = new SourcePart();
        else if (type == TARGET)
            part = new TargetPart();
        else if (type == MAP) {
            part = new MapNodeEditPart();
        }

        part.model = model;
        this.editorParts.put(model.id, part);
        return part;
    },
    initRootEditPart: function (editPart) {},
    getCustomPolicies: function () {
        this.put('createWall', new CreateWallPolicy());
    }
});

/*Map Struct*/
MapStruct = Base.extend({
    constructor: function () {
        this.struct = new Map();
        this.FindingStruct = new Map();
        this.isFinding = false;
    },
    FindingStructClear: function () {
        this.FindingStruct.clear();
    },
    applyFindingPoints(key, color) {
        if (this.afp == null)
            this.afp = new Map();

        this.afp.put(key, color);
    },
    setSource: function (source) {
        /*if (this.source == null)
            this.source = new Point();
        this.source.setPosition(x, y);*/

        this.sourceModel = source;
        if (this.source == null)
            this.source = new Point();
        this.source.setPosition(source.getValue('x'), source.getValue('y'));
    },
    setTarget: function (target) {
        /*if (this.target == null)
            this.target = new Point();
        this.target.setPosition(x, y);*/
        this.targetModel = target;
        if (this.target == null)
            this.target = new Point();
        this.target.setPosition(target.getValue('x'), target.getValue('y'));
    },
    refreshSourceAndTarget: function () {

        if (this.sourceModel != null)
            this.source.setPosition(this.sourceModel.getValue('x'), this.sourceModel.getValue('y'));

        if (this.targetModel != null)
            this.target.setPosition(this.targetModel.getValue('x'), this.targetModel.getValue('y'));
    }
});

MapStruct = new MapStruct();

/*Model*/
MapNodeModel = anra.gef.NodeModel.extend({
    constructor: function () {
        anra.gef.NodeModel.prototype.constructor.call(this);
        this.initMapModel();
    },
    initMapModel: function () {
        this.setValue('width', MapNodeModel.width);
        this.setValue('type', MAP);
        this.setValue('color', 'gray');
        //this.setValue('stroke', 'black');
    },
    setPosition: function (x, y) {
        x = Math.floor(x / MapNodeModel.width);
        y = Math.floor(y / MapNodeModel.width);

        this.id = x + '_' + y;
        this.setValue('x', x);
        this.setValue('y', y);
    }
});
MapNodeModel.setNodeAttribute = function (width, vnum, hnum) {
    MapNodeModel.width = width || MapNodeModel.width;
    MapNodeModel.verticalValue = vnum || MapNodeModel.verticalValue;
    MapNodeModel.horizontalValue = hnum || MapNodeModel.horizontalValue;
};
MapNodeModel.horizontalValue = 60;
MapNodeModel.verticalValue = 60;
MapNodeModel.width = 40;

RouterLineModel = anra.gef.LineModel.extend({
    constructor: function () {
        anra.gef.LineModel.prototype.constructor.call(this);
        this.initRouterLine();
    },
    initRouterLine: function () {
        this.id = RouterLineModel.id;
        this.sourceTerminal = 'source';
        this.targetTerminal = 'target';
    },
});
RouterLineModel.id = 'routerLine';

/*EditPart*/
CommonNodeEditPart = anra.gef.NodeEditPart.extend({
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
            fill: this.model.getValue('color'),
            stroke: this.model.getValue('stroke')
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
        var line = new CommonLine(this.model);
        var rp = this;

        line.router = function (l) {

            if (!this.isLine(l))
                return null;

            return rp.model.getValue('route');
        };
        return line;
    }
});

MapNodeEditPart = CommonNodeEditPart.extend({
    createEditPolicies: function () {
        this.installEditPolicy('clickDestroy', new ClickDestroyPolicy());
    },
    createFigure: function () {
        return new RectFigure();
    }
});

SourcePart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.RootDragTracker();
        //return new anra.gef.DragTracker();
    },

    createEditPolicies: function () {
        this.installEditPolicy('drag', new DragPolicy());
        this.installEditPolicy('ss', new RouterPolicy());
    },
    createLineEditPart: function () {
        return new CommonLineEditPart();
    }
});

TargetPart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.RootDragTracker();
        //return new anra.gef.DragTracker();
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
    init: function () {
        this.registAnchors([
            {
                id: 'source',
                dir: anra.CENTER,
                offset: null
            },
            {
                id: 'target',
                dir: anra.CENTER,
                offset: null
            }
        ]);
    },
    initProp: function () {
        this.setAttribute({
            fill: this.model.getValue('color'),
            stroke: this.model.getValue('stroke')
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
    listener: null,
    init: function (model) {
        anra.gef.Line.prototype.init.call(this, model);
    },
    initProp: function () {
        this.setAttribute({
            fill: 'none',
            'stroke-width': 2,
            stroke: 'black'
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

/*Handle*/
FindingPathHandler = anra.svg.Composite.extend({
    constructor: function () {
        anra.svg.Control.prototype.constructor.call(this);
        this.initProp();
    },
    initProp: function () {
        /*this.setStyle({
            'stroke-width': 2,
            stroke: 'black'
        });*/
        this.setOpacity(0.5);
    },
    createContent:function(){
        var text=anra.svg.Control.extend(anra.svg.Text);
        text=new text();
        text.setText(this.point.x + ',' + this.point.y);
        this.addChild(text)
        text.setBounds({x:15,y:15});
    },
    setPosition: function (point) {
        if (point == null)
            return;

        /*记录x与y*/
        this.point = point;

        this.setBounds({
            x: point.x * MapNodeModel.width,
            y: point.y * MapNodeModel.width,
            width: MapNodeModel.width,
            height: MapNodeModel.width
        });
    },
    setColor: function (type) {
        var color = MapStruct.afp.get(type);

        if (color == null)
            color = 'green'

        this.setAttribute({
            fill: color,
            stroke:'gray'
        });
    },
    toString: function () {
        return this.point.x + ',' + this.point.y;
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
                this.getHost().model.setValue('x', 0);
            else if (x > MapNodeModel.horizontalValue)
                this.getHost().model.setValue('x', MapNodeModel.horizontalValue);
            else
                this.getHost().model.setValue('x', x);

            if (y < 0)
                this.getHost().model.setValue('y', 0);
            else if (y > MapNodeModel.verticalValue)
                this.getHost().model.setValue('y', MapNodeModel.verticalValue);
            else
                this.getHost().model.setValue('y', y);

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
            MapStruct.struct.put(mn.getValue('x') + '_' + mn.getValue('y'), mn);

            host.refresh();
        };
        this.getHost().getFigure().on(anra.EVENT.MouseDown, this.listener);

    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseDown, this.listener);
    }
});

ClickDestroyPolicy = anra.gef.Policy.extend({
    activate: function () {
        var host = this.getHost();
        this.listener = function (e) {
            host.getRoot().model.removeChild(host.model);
            MapStruct.struct.remove(host.model.getValue('x') + '_' + host.model.getValue('y'));
            host.getRoot().refresh();
        }
        this.getHost().getFigure().on(anra.EVENT.MouseDown, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseDown, this.listener);
    }
});

CreatePathPolicy = anra.gef.Policy.extend({
    flag: false,

    createLineModel: function () {
        var lineModel = new RouterLineModel();
        lineModel.initRouterLine();
        return lineModel;
    },
    activate: function () {
        var ep = this.getHost();
        var flag = this.flag;
        this.listener = function () {
            if (!flag) {
                var ld = new RouterLineModel();
                ld.initRouterLine();
                ep.editor.source.addSourceLine(ld);
                ep.editor.target.addTargetLine(ld);
                flag = true;
            } else {
                var ld = ep.editor.target.getTargetLine(RouterLineModel.id);
                var linePart = ep.getRoot().getEditPart(ld);
                linePart.unregister();
                flag = false;
            }

            var t = ep.getRoot().getEditPart(ep.editor.target);
            var s = ep.getRoot().getEditPart(ep.editor.source);

            s.refresh();
            t.refresh();
        }
        this.getHost().getFigure().on(anra.EVENT.MouseUp, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseUp, this.listener);
    }
});

/*另外一套策略*/
 RouterPolicy = anra.gef.Policy.extend({
    initProcessor: function (routerProcessor) {
        if (!routerProcessor instanceof CommonRouterProcessor)
            return;

        this.routerProcessor = routerProcessor;
    },
    initListener: function () {
        var f = this.flag = false;
        var p = this;

        this.listener = function () {
            if (MapStruct.isFinding)
                return;

            if (!f) {
                p.routerProcessor.process();
                MapStruct.isFinding = true;

                /*记录Handle，处理handle覆盖*/
                p._handleRecord = new Map();
                //p._index = 0;

                p.createHandle();
                f = true;
            } else {
                p.destroyHandle();
                p.destroyLine();
                f = false;
            }
        }

    },
    createHandle: function () {
        var s = this;
        var keyList = s.routerProcessor.keyList;

        if (keyList == null || keyList.length == 0) {
            s.createLine();
            return;
        }

        (function () {
            for (var i = 0; i < keyList.length; i++) {
                s._isAllEmpty = 1;
                s.createHandleByType(keyList[i]);
            }

            if (s._isAllEmpty == 1) {
                MapStruct.isFinding = false;
                s.createLine();
            }

            if (MapStruct.isFinding) {
                setTimeout(function () {
                    s.createHandle()
                }, 50);
            }
        })();
    },
    createHandleByType: function (type) {
        if (!MapStruct.FindingStruct.get(type).isEmpty()) {
            var temp = MapStruct.FindingStruct.get(type).pop();

            while (!temp.isEmpty()) {
                var h = new FindingPathHandler();
                h.setPosition(temp.pop());
                h.setColor(type);
                this.destroyCoverHandle(h);
                this.getHost().getRoot().getLineLayer().addChild(h);
            }
            this._isAllEmpty = this._isAllEmpty & 0;
        }
    },
    createLine: function () {
        var sourceModel = this.getHost().getRoot().model.getChild('source');
        var targetModel = this.getHost().getRoot().model.getChild('target');
        var ld = new RouterLineModel();

        sourceModel.addSourceLine(ld);
        targetModel.addTargetLine(ld);
        ld.initRouterLine();
        ld.setValue('route', this.routerProcessor.getPoints());

        var t = this.getHost().getRoot().getEditPart(targetModel);
        var s = this.getHost().getRoot().getEditPart(sourceModel);

        s.refresh();
        t.refresh();
    },
    destroyHandle: function () {
        var host = this.getHost();
        var handles = host.getRoot().getLineLayer().children;

        if (handles == null)
            return;

        while (!handles.isEmpty())
            host.getRoot().getLineLayer().removeChild(handles.last());
    },
    destroyCoverHandle: function (handle) {
        if (this._handleRecord.has(handle.toString())) {
            /*handleLayer.removeChild(handleLayer.children[this._handleRecord.get(h.toString())]);
            this._index--;*/
            this.getHost().getRoot().getLineLayer().removeChild(this._handleRecord.get(handle.toString()));
        }

        //this._handleRecord.put(h.toString(), this._index++);
        this._handleRecord.put(handle.toString(), handle);
    },
    destroyLine: function () {
        var host = this.getHost();
        var targetModel = host.getRoot().model.getChild('target');
        var sourceModel = host.getRoot().model.getChild('source');
        var ld = sourceModel.getSourceLine(RouterLineModel.id);
        var linePart = host.getRoot().getEditPart(ld);

        linePart.unregister();
        sourceModel.removeSourceLine(ld);
        targetModel.removeTargetLine(ld);

        host.getRoot().getEditPart(sourceModel).refresh();
        host.getRoot().getEditPart(targetModel).refresh();
    },
    activate: function () {

        //this.initProcessor(new DyDoubleAStarRouterProcessor());
        //this.initProcessor(new BFSRouterProcessor());
        //this.initProcessor(new GreedRouterProcessor());
        this.initProcessor(new SingleASRouterProcessor());
        //this.initProcessor(new DyDoubleAStarRouterProcessor());
        this.initListener();
        this.getHost().getFigure().on(anra.EVENT.MouseUp, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseUp, this.listener);
    }
});

/*routerProcessor*/
CommonRouterProcessor = Base.extend({
    /*方向字典*/
    verticalDir: [[0, 1], [1, 0], [0, -1], [-1, 0]],
    diagonalDir: [[1, 1], [1, -1], [-1, -1], [-1, 1]],
    allDir: [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]],
    /*起始与终点*/
    origin: null,
    aim: null,
    /*寻路成功标志*/
    flag: false,
    /*返回的寻路结果*/
    points: null,

    constructor: function () {
        this.initPointState();
        this.initFinding();
    },
    /*初始化点状态和寻路过程中点分类*/
    initPointState: function () {},
    initFinding: function () {},
    /*router前重置数据*/
    reset: function () {
        this.initPoints();
        this.flag = false;
    },
    /*调用方法*/
    process: function () {
        this.reset();
        this.router();
    },
    /*寻路计算*/
    router: function () {
        var midX = (this.origin.x + this.aim.x) / 2;

        var p1 = new Point();
        p1.setPosition(midX, this.aim.y);

        var p2 = new Point();
        p2.setPosition(midX, this.origin.y);

        this.aim.setParent(p1);
        p1.setParent(p2);
        p2.setParent(this.origin);
    },

    /*相对点与绝对点转换*/
    absoluteToRelative: function (point) {
        if (point == null)
            return null;

        var resultPoint = {
            x: null,
            y: null
        };

        resultPoint.x = Math.floor(point.x / MapNodeModel.width);
        resultPoint.y = Math.floor(point.y / MapNodeModel.width);

        return resultPoint;
    },
    relativeToAbsolute: function (point) {
        if (point == null)
            return null;

        var resultPoint = {
            x: null,
            y: null
        };

        resultPoint.x = point.x * MapNodeModel.width + MapNodeModel.width / 2;
        resultPoint.y = point.y * MapNodeModel.width + MapNodeModel.width / 2;

        return resultPoint;
    },
    /*初始化起始点与终点*/
    initPoints: function () {

        MapStruct.refreshSourceAndTarget();

        this.origin = MapStruct.source;
        this.aim = MapStruct.target;
    },
    /*验证点在地图上的有效性*/
    isValid: function (point) {
        if (point == null)
            return false;

        if (point.x < 0 || point.y < 0 ||
            MapStruct.struct.has(point.x + '_' + point.y))
            return false;

        if (point.isVertical()) {
            point.setValue('direction', 'vertical');
            return true;
        }

        point.setValue('direction', 'diagonal');

        if (!MapStruct.struct.has(point.parent.x + '_' + point.y) || !MapStruct.struct.has(point.x + '_' + point.parent.y))
            return true;

        return false;
    },
    /*提供通过Point实例返回point[]数组的方法*/
    calculatePoints: function (point) {
        if (point == null || point.x != this.aim.x || point.y != this.aim.y) {
            this.points = [this.origin, this.origin];
            return;
        }

        this.points = [];
        while (!point.equalsWithPosition(this.origin)) {
            this.points.unshift(this.relativeToAbsolute(point));
            point = point.parent;
        }
        this.points.unshift(this.relativeToAbsolute(point));
    },
    getPoints: function () {
        if (this.flag == true) {
            this.calculatePoints(this.aimPoint);
        } else
            this.points = [this.origin, this.origin];

        return this.points;
    },
    addFindingPoint: function (key, point) {
        if (!MapStruct.afp.has(key))
            return;

        if (point == null)
            return;

        if (!MapStruct.FindingStruct.has(key))
            MapStruct.FindingStruct.put(key, new Array());

        var arr = MapStruct.FindingStruct.get(key);
        var l = arr.length;

        if (l == 0) {
            var temp = [];
            temp.unshift(point);
            arr.unshift(temp);
            return;
        }

        arr[0].unshift(point);
    },
    addFindingPause: function (key) {
        var arr = MapStruct.FindingStruct.get(key);

        arr.unshift(new Array());
    }
});

BFSRouterProcessor = CommonRouterProcessor.extend({
    constructor: function () {
        CommonRouterProcessor.prototype.constructor.call(this);
    },
    initPointState: function () {
        this.notFind = 0;
        this.inQueue = 1;
        this.visited = 2;
    },
    initFinding: function () {
        if (this.keyList == null)
            this.keyList = [];

        this.key = 'BFS';
        this.keyList.unshift(this.key);

        MapStruct.applyFindingPoints(this.key, 'green');
    },
    router: function () {
        /*处理队列*/
        var processQueue = new Array();
        var state = new Map();

        processQueue.push(new Point(this.origin));
        state.put(processQueue.last().toString(), this.inQueue);

        /*寻路过程*/
        while (processQueue.length > 0) {
            var currentPoint = processQueue.pop();

            for (var i = 0, l = this.allDir.length; i < l; i++) {
                var tempPoint = new Point(null); //*
                tempPoint.setPosition(currentPoint.x + this.allDir[i][0], currentPoint.y + this.allDir[i][1]);
                tempPoint.setParent(currentPoint);

                if (!this.isValid(tempPoint))
                    continue;

                if (state.has(tempPoint.toString()) && state.get(tempPoint.toString()) != this.notFind)
                    continue;

                processQueue.unshift(tempPoint);

                if (tempPoint.equalsWithPosition(this.aim)) {
                    this.flag = true;
                    this.aimPoint = tempPoint;
                    break;
                }

                state.put(tempPoint.toString(), this.inQueue);

                /*添加寻路过程的点(与寻路本身无关)*/
                this.addFindingPoint(this.key, tempPoint.createSimplePoint());
            }
            /*添加暂停(与寻路本身无关)*/
            this.addFindingPause(this.key);

            if (this.flag == true)
                break;
        }
    }
});

GreedRouterProcessor = CommonRouterProcessor.extend({
    constructor: function () {
        CommonRouterProcessor.prototype.constructor.call(this);
    },
    initPointState: function () {
        this.inQueue = 1;
    },
    initFinding: function () {
        if (this.keyList == null)
            this.keyList = [];

        this.key = 'greed';
        this.keyList.unshift(this.key);

        MapStruct.applyFindingPoints(this.key, 'green');
    },
    router: function () {
        var processQueue = new Array();
        var state = new Map();

        processQueue.push(this.origin);
        state.put(processQueue.last().toString(), this.inQueue);

        while (processQueue.length > 0) {
            var currentPoint = processQueue.pop();

            for (var i = 0, l = this.allDir.length; i < l; i++) {
                var tempPoint = new Point();
                tempPoint.setPosition(currentPoint.x + this.allDir[i][0], currentPoint.y + this.allDir[i][1]);
                tempPoint.setParent(currentPoint);

                if (!this.isValid(tempPoint))
                    continue;

                if (state.has(tempPoint.toString()))
                    continue;

                this.insertQueue(tempPoint, processQueue);
                state.put(tempPoint.toString(), this.inQueue);
                this.addFindingPoint(this.key, tempPoint.createSimplePoint());

                if (tempPoint.equalsWithPosition(this.aim)) {
                    this.flag = true;
                    this.aimPoint = tempPoint;
                    break;
                }
            }

            this.addFindingPause(this.key);

            if (this.flag == true)
                break;
        }
    },
    insertQueue: function (point, queue) {
        if (point == null)
            return;

        point.setValue('dis', Math.abs(point.x - this.aim.x) + Math.abs(point.y - this.aim.y));

        var high = queue.length - 1,
            low = 0,
            mid;

        if (high < 0) {
            queue.push(point);
            return;
        }

        while (low <= high) {
            mid = Math.floor((high + low) / 2);

            if (queue[mid].getValue('dis') > point.getValue('dis'))
                low = mid + 1;
            else
                high = mid - 1;
        }
        queue.insert(point, low);
    }
});

SingleASRouterProcessor = CommonRouterProcessor.extend({
    constructor: function () {
        CommonRouterProcessor.prototype.constructor.call(this);
    },
    initPointState: function () {
        this.notFind = 0;
        this.inOpen = 1;
        this.inClosed = 2;
    },
    initFinding: function () {
        if (this.keyList == null)
            this.keyList = [];

        this.open = 'open';
        this.closed = 'closed';
        this.keyList.unshift(this.closed);
        this.keyList.unshift(this.open);

        MapStruct.applyFindingPoints(this.open, 'green');
        MapStruct.applyFindingPoints(this.closed, 'yellow');
    },
    router: function () {
        /*打开与关闭队列*/
        var openList = [];
        var closedList = [];
        /*点状态记录*/
        var state = new Map();

        /*初始化信息*/
        openList.push(new Point(this.origin));
        state.put(this.origin.toString(), this.inOpen);

        while (openList.length > 0) {
            var currentPoint = openList.pop();
            closedList.push(currentPoint);
            state.put(currentPoint.toString(), this.inClosed);
            /*添加寻路过程中关闭集变化*/
            this.addFindingPoint(this.closed, currentPoint.createSimplePoint());

            if (currentPoint.equalsWithPosition(this.aim)) {
                this.aimPoint = currentPoint;
                this.flag = true;
                break;
            }

            for (var i = 0, l = this.allDir.length; i < l; i++) {
                var tempPoint = new Point();
                tempPoint.setPosition(currentPoint.x + this.allDir[i][0], currentPoint.y + this.allDir[i][1]);
                tempPoint.setParent(currentPoint);

                if (!this.isValid(tempPoint))
                    continue;

                /*计算G值*/
                tempPoint.setValue('g', (tempPoint.getValue('direction') == 'vertical' ? 10 : 14) + currentPoint.getValue('g'));

                if (state.get(tempPoint.toString()) == this.inOpen) {
                    var index = this.pointIndexOf(tempPoint, openList);
                    if (openList[index].getValue('g') > tempPoint.getValue('g')) {
                        openList.remove(index);
                        state.put(tempPoint.toString(), this.notFind);
                    }
                }

                if (state.get(tempPoint.toString()) == this.inClosed) {
                    var index = this.pointIndexOf(tempPoint, closedList);
                    if (closedList[index].getValue('g') > tempPoint.getValue('g')) {
                        closedList.remove(index);
                        state.put(tempPoint.toString(), this.notFind);
                    }
                }

                if (!state.has(tempPoint.toString()) || state.get(tempPoint.toString()) == this.notFind) {
                    this.caculateH(tempPoint);
                    this.insertOpen(tempPoint, openList);
                    state.put(tempPoint.toString(), this.inOpen);

                    /*添加寻路过程中打开集的变化*/
                    this.addFindingPoint(this.open, tempPoint.createSimplePoint());
                }
            }

            /*添加暂停*/
            this.addFindingPause(this.open);
            this.addFindingPause(this.closed);
        }
    },
    pointIndexOf: function (point, array) {
        var index;

        for (var i = 0; i < array.length; i++) {
            if (array[i].equalsWithPosition(point)) {
                index = i;
                break;
            }
        }

        return index;
    },
    caculateH: function (point) {
        point.setValue('h', (Math.abs(point.x - this.aim.x) + Math.abs(point.y - this.aim.y)) * 10);
    },
    insertOpen: function (point, list) {
        var high = list.length - 1,
            low = 0,
            mid;

        if (high < 0) {
            list.push(point);
            return;
        }

        while (low <= high) {
            mid = Math.floor((high + low) / 2);

            if (list[mid].getValue('h') > point.getValue('h'))
                low = mid + 1;
            else
                high = mid - 1;
        }
        list.insert(point, low);
    }
});

/*双向基类*/
DoubleRouterProcessor = CommonRouterProcessor.extend({
    constructor: function() {
        CommonRouterProcessor.prototype.constructor.call(this);
    }
});

DyDoubleAStarRouterProcessor = CommonRouterProcessor.extend({
    constructor: function () {
        CommonRouterProcessor.prototype.constructor.call(this);
    },
    initPointState: function () {
        this.inForwardOpen = 0;
        this.inBackwardOpen = 1;
        this.inForwardClosed = 2;
        this.inBackwardClosed = 3;
        this.notFind = 4;
    },
    initFinding: function () {
        this.keyList = [];
        this.key = 'open';
        this.key1 = '2'
        this.keyList.push(this.key);
        this.keyList.push(this.key1);
        MapStruct.applyFindingPoints(this.key,'yellow');
        MapStruct.applyFindingPoints(this.key1,'green');
        
        
    },
    router: function () {
        var forwardOpenList = [];
        var backwardOpenList = [];
        var state = new Map();
        var tempState;

        /*初始化两个Open集*/
        forwardOpenList.push(this.origin);
        backwardOpenList.push(this.aim);
        state.put(this.origin.toString(), this.inForwardOpen);
        state.put(this.aim.toString(), this.inBackwardOpen);

        while (forwardOpenList.length > 0 && backwardOpenList.length > 0) {
            var currentForwardPoint = forwardOpenList.pop();
            var currentBackwardPoint = backwardOpenList.pop();
            state.put(currentForwardPoint.toString(), this.inForwardClosed);
            state.put(currentBackwardPoint.toString(), this.inBackwardClosed);
            
            //console.log(currentForwardPoint .x + ',' + currentForwardPoint .y + ' - ' + currentBackwardPoint.x + ',' + currentBackwardPoint.y)

            /*需要判断相遇*/
            if(currentForwardPoint.equalsWithPosition(currentBackwardPoint)) {
                this.flag = true;
                this.aimForwardPoint = currentForwardPoint;
                this.aimBackwardPoint = currentBackwardPoint;
                break;
            }

            for (var i = 0, l = this.allDir.length; i < l; i++) {
                var tempForwardPoint = new Point();
                var tempBackwardPoint = new Point();
                tempForwardPoint.setPosition(currentForwardPoint.x + this.allDir[i][0], currentForwardPoint.y + this.allDir[i][1]);
                tempBackwardPoint.setPosition(currentBackwardPoint.x + this.allDir[i][0], currentBackwardPoint.y + this.allDir[i][1]);
                tempForwardPoint.setParent(currentForwardPoint);
                tempBackwardPoint.setParent(currentBackwardPoint);

                if (this.isValid(tempForwardPoint)) {
                    tempState = state.get(tempForwardPoint.toString());
                    tempForwardPoint.setValue('g', (tempForwardPoint.getValue('direction') == 'vertical' ? 10 : 14) + currentForwardPoint.getValue('g'));
                    
                    if(currentForwardPoint.x == 7 && currentForwardPoint.y == 7)
                        console.log(tempForwardPoint,tempBackwardPoint)
                    
                    if(tempForwardPoint.equalsWithPosition(currentBackwardPoint)) {
                        console.log('sd')
                        forwardOpenList.push(tempForwardPoint);
                        state.put(tempForwardPoint.toString(), this.inForwardOpen);
                        backwardOpenList.push(currentBackwardPoint);
                        break;
                    }
                    
                    /*if (tempState == this.inBackwardOpen) {
                        //相遇
                        forwardOpenList.push(tempForwardPoint);
                        state.put(tempForwardPoint.toString(), this.inForwardOpen);
                        break;
                    }
*/
                    if (tempState == this.inForwardOpen) {
                        /*在自己的Open集里*/
                        var index = this.pointIndexOf(tempForwardPoint, forwardOpenList);
                        if (forwardOpenList[index].getValue('g') > tempForwardPoint.getValue('g')) {
                            forwardOpenList.remove(index);
                            state.put(tempForwardPoint.toString(), this.notFind);
                        }
                    }

                    if (tempState != this.inForwardOpen && tempState != this.inForwardClosed) {
                        /*加入Open集*/
                        forwardOpenList.push(tempForwardPoint);
                        state.put(tempForwardPoint.toString(), this.inForwardOpen);
                        this.addFindingPoint(this.key, tempForwardPoint);
                    }
                }

                if (this.isValid(tempBackwardPoint)) {
                    tempState = state.get(tempBackwardPoint.toString());
                    tempBackwardPoint.setValue('g', (tempBackwardPoint.getValue('direction') == 'vertical' ? 10 : 14) + currentBackwardPoint.getValue('g'));
                    /*if (tempState == this.inForwardOpen) {
                        相遇
                        backwardOpenList.push(tempBackwardPoint);
                        state.put(tempBackwardPoint.toString(), this.inBackwardOpen);
                        break;
                    }*/

                    if (tempState == this.inBackwardOpen) {
                        /*在自己的Open集里*/
                        var index = this.pointIndexOf(tempBackwardPoint, backwardOpenList);
                        if (backwardOpenList[index].getValue('g') > tempBackwardPoint.getValue('g')) {
                            backwardOpenList.remove(index);
                            state.put(tempBackwardPoint.toString(), this.notFind);
                        }
                    }

                    if (tempState != this.inBackwardOpen && tempState != this.inBackwardClosed) {
                        /*加入Open集*/
                        backwardOpenList.push(tempBackwardPoint);
                        state.put(tempBackwardPoint.toString(), this.inBackwardOpen);
                        this.addFindingPoint(this.key1, tempBackwardPoint);
                    }
                }
            }
            /*对于Open集的长度排序*/
            this.sortOpenList(forwardOpenList, backwardOpenList);
        }
    },
    pointIndexOf: function (point, array) {
        var index;

        for (var i = 0; i < array.length; i++) {
            if (array[i].equalsWithPosition(point)) {
                index = i;
                break;
            }
        }

        return index;
    },
    sortOpenList: function (forward, backward) {
        
        if(forward.length == 0 || backward.length == 0)
            return;
        
        var index1 = 0,
            index2 = 0;
        var minDis = (Math.abs(forward[index1].x - backward[index2].x) + Math.abs(forward[index1].y - backward[index2].y)) * 10 +
            forward[index1].getValue('g') + backward[index2].getValue('g'),
            tempDis;
        

        for (var i = 0; i < forward.length; i++) {
            for (var j = 0; j < backward.length; j++) {
                tempDis = (Math.abs(forward[i].x - backward[j].x) + Math.abs(forward[i].y - Math.abs(backward[j].y))) * 10 +
                    forward[i].getValue('g') + backward[j].getValue('g');
                //console.log(forward[i].x + ',' + forward[i].y + ' - ' + backward[j].x + ',' + backward[j].y)
                //console.log(tempDis)
                if (minDis >= tempDis) {
                    index1 = i;
                    index2 = j;
                    minDis = tempDis;
                    
                }
            }
        }

        var temp1 = forward[index1];
        forward.remove(index1);
        forward.push(temp1);

        var temp2 = backward[index2];
        backward.remove(index2);
        backward.push(temp2);
        //console.log('-------')
        /*console.log(forward.last())
        console.log(backward.last())*/
        //console.log(temp1.x + ',' + temp1.y + ' - ' + temp2.x + ',' + temp2.y)
    },
    getPoints: function (){
        this.points = [];
        var fp = this.aimForwardPoint;
        var bp = this.aimBackwardPoint;
        
        while (!fp.equalsWithPosition(this.origin) || !bp.equalsWithPosition(this.aim)) {
            if(!fp.equalsWithPosition(this.origin)) {
                this.points.unshift(this.relativeToAbsolute(fp));
                fp = fp.parent;
            }
            
            if(!bp.equalsWithPosition(this.aim)) {
                this.points.push(this.relativeToAbsolute(bp));
                bp = bp.parent;
            }
        }
        this.points.unshift(this.relativeToAbsolute(fp));
        this.points.push(this.relativeToAbsolute(bp));
        
        return this.points;
    }
});

/*点对象*/
Point = Base.extend({
    x: null,
    y: null,
    parent: null,
    _extraAttribute: null,
    constructor: function (point) {
        if (point == null) {
            this.x = 0;
            this.y = 0;
        } else {
            this.x = point.x || 0;
            this.y = point.y || 0;
        }
        this._extraAttribute = new Map();
    },
    setPosition: function (x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
    },
    setParent: function (point) {
        if (point instanceof Point)
            this.parent = point;
    },
    setValue: function (key, value) {
        this._extraAttribute.put(key, value);
    },
    getValue: function (key) {
        if (!this._extraAttribute.has(key))
            return null;

        return this._extraAttribute.get(key);
    },
    isVertical() {
        if (this.parent == null)
            return;

        if (Math.abs(this.x - this.parent.x) + Math.abs(this.y - this.parent.y) == 1)
            return true;
        else
            return false;
    },
    equalsWithPosition: function (point) {
        if (point == null || point.x == null || point.y == null)
            return false;

        if (point.x == this.x && point.y == this.y)
            return true;
    },
    toString: function () {
        return this.x + '_' + this.y;
    },
    createSimplePoint: function () {
        var p = {
            x: null,
            y: null
        };
        p.x = this.x;
        p.y = this.y;

        return p;
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
