/**
 * Policy
 */

/*拖拽策略*/
DragPolicy = anra.gef.Policy.extend({
    showTargetFeedback: function (request) {
        if (REQ_MOVE == request.type) {
            var x = Math.floor(request.event.x / WIDTH),
                y = Math.floor(request.event.y / WIDTH),
                xMax = MapStruct.horizontalValue,
                yMax = MapStruct.verticalValue,
                host = this.getHost();

            host.model.set('x', x < 0 ? 0 : x > xMax ? xMax : x);
            host.model.set('y', y < 0 ? 0 : y > yMax ? yMax : y);

            host.refresh();
        }
    }
});

/*生成障碍策略*/
CreateWallPolicy = anra.gef.Policy.extend({
    activate: function () {
        var host = this.getHost();
        this.listener = function (e) {
            if (e.button != 0) {
                return;
            }
            
            var x = e.x,
                y = e.y,
                mn = new WallNodeModel(x, y);

            host.editor.rootModel.addChild(mn);
            MapStruct.wallStruct.put(mn.get('id'), new wallPoint(mn.get('x'), mn.get('y')));

            host.refresh();
        };
        this.getHost().getFigure().on(anra.EVENT.MouseDown, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseDown, this.listener);
    }
});

/*销毁障碍策略*/
ClickDestroyPolicy = anra.gef.Policy.extend({
    activate: function () {
        var host = this.getHost();
        this.listener = function (e) {
            host.getRoot().model.removeChild(host.model);
            MapStruct.wallStruct.remove(host.model.id);
            host.getRoot().refresh();
        }
        this.getHost().getFigure().on(anra.EVENT.MouseDown, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseDown, this.listener);
    }
});

/*寻路策略*/
RouterPolicy = anra.gef.Policy.extend({
    activate: function () {
        //this.initProcessor(new ROUTER());
        this.initListener();
        this.getHost().getFigure().on(anra.EVENT.MouseUp, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseUp, this.listener);
    },
    initProcessor: function (routerProcessor) {
        if (!routerProcessor instanceof BasicRouterProcessor)
            return;

        if (this.routerProcessor && routerProcessor.toString() == this.routerProcessor.toString()) {
            return;
        }

        this.routerProcessor = routerProcessor;
    },
    initListener: function () {
        var policy = this;
        this.isFinding = false;

            this.listener = function (e) {
                if (policy.isFinding) {
                    return;
                }
            
                if (e.button != 0) {
                    return;
                }
            
                if (policy.getHost().model.hasSourceLine(new RouterLineModel())) return;

                policy._handleRecord = new Map();
                FindingTool.reset();
                policy.initProcessor(new ROUTER());
                policy.isFinding = true;
                policy.routerProcessor.process();
                policy.createHandle();
            }

    },
    createHandle: function () {
        if (!FindingTool.isValid()) {
            this.createLine();
            return;
        }

        var policy = this;
        (function () {
            for (var i = 0; i < FindingTool.keyList.length; i++)
                policy.createHandleByType(FindingTool.keyList[i]);

            if (policy.isFinding)
                setTimeout(function () {
                    policy.createHandle()
                }, DELAY);
            else
                policy.createLine();
        })();
    },
    createHandleByType: function (type) {
        var temp, handle;
        if (!FindingTool.findingSub.get(type).isEmpty()) {
            temp = FindingTool.findingSub.get(type).pop();

            while (!temp.isEmpty()) {
                handle = new FindingPathHandle(temp.pop(), type);
                this.destroyCoverHandle(handle);
                this.getHost().getRoot().getLineLayer().addChild(handle);
            }
        } else
            this.isFinding = false;
    },
    createLine: function () {
        var root = this.getHost().getRoot(),
            ld = new RouterLineModel();
        
        source.addSourceLine(ld);
        target.addTargetLine(ld);
        ld.initRouterLine();
        
        ld.set('route', this.routerProcessor.getPath());
        
        root.getEditPart(source).refresh();
        root.getEditPart(target).refresh();
    },
    destroyCoverHandle: function (handle) {
        if (this._handleRecord.has(handle.toString()))
            this.getHost().getRoot().getLineLayer().removeChild(this._handleRecord.get(handle.toString()));

        this._handleRecord.put(handle.toString(), handle);
    }
});

/*销毁router*/
DestroyRouterPolicy = anra.gef.Policy.extend({
    activate: function () {
        this.initListener();
        this.getHost().getFigure().on(anra.EVENT.MouseUp, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseUp, this.listener);
    },
    initListener: function () {
        var policy = this;

        this.listener = function () {
            if (!policy.getHost().model.hasTargetLine(new RouterLineModel()))
                return;

            policy.destroyLine();
            policy.destroyHandle();

            MapStruct.clear();
            FindingTool.clear();
        }
    },
    destroyLine: function () {
        var root = this.getHost().getRoot(),
            ld = source.getSourceLine(RouterLineModel.id),
            linePart = root.getEditPart(ld);

        linePart.unregister();
        source.removeSourceLine(ld);
        target.removeTargetLine(ld);

        root.getEditPart(source).refresh();
        root.getEditPart(target).refresh();
    },
    destroyHandle: function () {
        var root = this.getHost().getRoot(),
            handles = root.getLineLayer().children;

        if (handles == null)
            return;

        while (!handles.isEmpty())
            root.getLineLayer().removeChild(handles.last());
    }
});


/* 新拖拽celve */
NewDray = anra.gef.LayoutPolicy.extend({
    constructor: function () {
        anra.gef.LayoutPolicy.prototype.constructor.call(this);
    },
    showLayoutTargetFeedback: function (request) {
        var feedback;
        var editParts = this.editParts = this.getLayoutEditParts(request);
        if (editParts instanceof Array) {
            var ox = request.target.bounds.x,
                oy = request.target.bounds.y;
            for (var i = 0, len = editParts.length; i < len; i++) {
                feedback = this.getFeedback(editParts[i]);
                this.refreshFeedback(feedback, request, editParts[i].figure.bounds.x - ox, editParts[i].figure.bounds.y - oy);
            }
        } else if (editParts instanceof anra.gef.NodeEditPart) {
            feedback = this.getFeedback(editParts);
            this.refreshFeedback(feedback, request);
        }
    },
    refreshFeedback: function (feedback, request, offsetX, offsetY) {
        if (feedback != null) {
            var x = request.event.x + (offsetX == null ? 0 : offsetX),
                y = request.event.y + (offsetY == null ? 0 : offsetY),
                xMax = MapStruct.verticalValue*WIDTH,
                yMax = MapStruct.horizontalValue*WIDTH;
            
            x = x > xMax ? xMax : x < 0 ? 0 : x;
            y = y > yMax ? yMax : y < 0 ? 0 : y;
            
            feedback.setBounds({
                x: x,
                y: y
            });
        }
    },
    getMoveCommand : function(request) {
        var target = this.editParts;
        
        if (target instanceof WallPart) {
            return null;
        }
        
        if (target instanceof SourcePart || target instanceof TargetPart) {
            var x = request.event.x,
                y = request.event.y,
                xMax = MapStruct.verticalValue*WIDTH,
                yMax = MapStruct.horizontalValue*WIDTH;
            x = x > xMax ? xMax : x < 0 ? 0 : x;
            y = y > yMax ? yMax : y < 0 ? 0 : y;
            
            target.model.setAbsolutePosition(x, y);
            
            return new anra.gef.RelocalCommand(target, 
                        {x:target.getFigure().getBounds().x,
                         y:target.getFigure().getBounds().y},
                        {x:x,
                         y:y});
        }
    }
});
