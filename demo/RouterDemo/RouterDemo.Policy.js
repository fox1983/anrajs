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
            var x = e.x,
                y = e.y,
                mn = new WallNodeModel(x, y);

            host.editor.rootModel.addChild(mn);
            MapStruct.wallStruct.put(mn.id, new wallPoint(mn.get('x'), mn.get('y')));

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
        this.initProcessor(new ROUTER());
        this.initListener();
        this.getHost().getFigure().on(anra.EVENT.MouseUp, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().off(anra.EVENT.MouseUp, this.listener);
    },
    initProcessor: function (routerProcessor) {
        if (!routerProcessor instanceof BasicRouterProcessor)
            return;

        this.routerProcessor = routerProcessor;
    },
    initListener: function () {
        var policy = this;
        this.isFinding = false,

            this.listener = function () {
                if (policy.isFinding) return;
                if (policy.getHost().model.hasSourceLine(new RouterLineModel())) return;

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
        if (this._handleRecord == null)
            this._handleRecord = new Map();

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
