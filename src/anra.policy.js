/**
 * Created with JetBrains WebStorm.
 * User: Caiyu
 * Date: 16-7-20
 * Time: 上午9:45
 */

anra.gef.AbstractEditPolicy = anra.gef.Policy.extend({
});


/**
 * 布局策略
 * @type {*}
 */
anra.gef.LayoutPolicy = anra.gef.AbstractEditPolicy.extend({
    sizeOnDropFeedback:null,
    ID:'layoutPolicy',
    listener:null,
    feedbackMap:null,
    constructor:function () {
        this.feedbackMap = new Map();
    },
    refreshFeedback:function (feedback, request, offsetX, offsetY) {
        if (feedback != null){
            feedback.setBounds({
                x:request.event.x - feedback.bounds.width / 2 + (offsetX == null ? 0 : offsetX),
                y:request.event.y - feedback.bounds.height / 2 + (offsetY == null ? 0 : offsetY)
            });
        }
    },
    activate:function () {
        this.setListener(this.createListener());
        this.decorateChildren();
    },
    createChildEditPolicy:function (child) {
        //TODO
    },
    eraseLayoutTargetFeedback:function (request) {
        //TODO
        this.editParts = null;
        var values = this.feedbackMap.values();
        for (var i = 0, len = values.length; i < len; i++) {
            this.removeFeedback(values[i]);
        }
        this.feedbackMap.clear();
    },
    getAddCommand:function (request) {
        return null;
    },
    getCloneCommand:function (request) {
        return null;
    },
    showLayoutTargetFeedback:function (request) {
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
    getLayoutEditParts:function (request) {
        if (REQ_CREATE == request.type) {
            var creationTool = request.target;
            return creationTool.getEditPart(this.getHost());
        } else if (REQ_MOVE == request.type) {
//            if (request.target.model instanceof anra.gef.NodeModel) {
            var selection = this.getHost().getRoot().selection;
            if (selection == null)return null;
            if (selection.figure == request.target)
                return selection;
            /*验证已选节点里包含拖拽目标节点*/
            if (selection instanceof Array) {
                var s = [];
                var valid;
                for (var i = 0, len = selection.length; i < len; i++) {
                    if (selection[i].figure == request.target) {
                        s.insert(selection[i]);
                        valid = true;
                    } else {
                        s.push(selection[i]);
                    }
                }
                if (valid)return s;
            }
//            }
        }
        return null;
    },
    getFeedback:function (ep) {
        var ghost = this.feedbackMap.get(ep.model);
        if (ghost == null) {
            ghost = this.createFeedback(ep);

            this.addFeedback(ghost);
            this.feedbackMap.put(ep.model, ghost);

            if (this.mouseUpListener == null) {
                var p = this;
                p.mouseUpListener = function (e) {
                    p.eraseLayoutTargetFeedback();
                    anra.Platform.getDisplay().removeListener(anra.EVENT.MouseUp, p.mouseUpListener);
                    p.mouseUpListener = null;
                };
                anra.Platform.getDisplay().addListener(anra.EVENT.MouseUp, p.mouseUpListener);
            }
        }
        return ghost;
    },
    createFeedback:function (ep) {
        return  anra.FigureUtil.createGhostFigure(ep);
    },
    getMoveChildrenCommand:function (request) {
        //TODO
    },
    getOrphanChildrenCommand:function (request) {
        return null;
    },
    getDeleteDependantCommand:function (request) {
        return null;
    },
    getMoveCommand:function (request) {
        var target = this.editParts;
        if (target instanceof anra.gef.NodeEditPart)
            return this.movecmd(target, request);
        else if (target instanceof Array) {
            var cmd, offx, offy, ox, oy;
            if (request.target.bounds == null) {
                ox = 0;
                oy = 0
            } else
                ox = request.target.bounds.x,
                    oy = request.target.bounds.y;
            for (var i = 0; i < target.length; i++) {
                offx = target[i].figure.bounds.x - ox;
                offy = target[i].figure.bounds.y - oy;
                cmd = cmd == null ?
                    this.movecmd(target[i], request, offx, offy) :
                    cmd.chain(this.movecmd(target[i], request, offx, offy));
            }
            return cmd;
        }
    },
    movecmd:function (target, request, offx, offy) {
        return  new anra.gef.RelocalCommand(target, {
                x:target.getFigure().getBounds().x,
                y:target.getFigure().getBounds().y
            },
            {
                x:request.event.x - target.getFigure().getBounds().width / 2 + (offx ? offx : 0),
                y:request.event.y - target.getFigure().getBounds().height / 2 + (offy ? offy : 0)
            });
    },
    getCreateCommand:function (request) {
        var model = request.event.prop.drag.model;
        var b = model.getBounds();
        model.setValue('bounds', [request.event.x - b[2] / 2, request.event.y - b[3] / 2, b[2], b[3]]);
        return new anra.gef.CreateNodeCommand(this.getHost().getRoot(), model);
    },
    createListener:function () {
        var listener = new anra.gef.EditPartListener();
        var f = this;
        listener.childAdded = function (child, index) {
            f.decorateChild(child);
        };
        return listener;
    },
    deactivate:function () {
        if (this.sizeOnDropFeedback != null) {
            this.removeFeedback(this.sizeOnDropFeedback);
            this.sizeOnDropFeedback = null;
        }
        this.setListener(null);
    },
    decorateChild:function (child) {
        var policy = this.createChildEditPolicy(child);
        if (policy != null)
            child.installEditPolicy(anra.gef.Policy.PRIMARY_DRAG_ROLE, policy);
    },
    decorateChildren:function () {
        var children = this.getHost().children;
        for (var i = 0, len = children.length; i < len; i++)
            this.decorateChild(children[i]);
    },
    eraseTargetFeedback:function (request) {
        if (REQ_ADD == request.type
            || REQ_MOVE == request.type
            || REQ_RESIZE_CHILDREN == request.type
            || REQ_CREATE == request.type
            || REQ_CLONE == request.type)
            this.eraseLayoutTargetFeedback(request);

        if (REQ_CREATE == request.type)
            this.eraseSizeOnDropFeedback(request);
    },
    getCommand:function (request) {
        if (REQ_DELETE_DEPENDANT == request.type)
            return this.getDeleteDependantCommand(request);
        if (REQ_ADD == request.type)
            return this.getAddCommand(request);
        if (REQ_ORPHAN_CHILDREN == request.type)
            return this.getOrphanChildrenCommand(request);
        if (REQ_MOVE_CHILDREN == request.type)
            return this.getMoveChildrenCommand(request);
        if (REQ_MOVE == request.type)
            return this.getMoveCommand(request);
        if (REQ_CLONE == request.type)
            return this.getCloneCommand(request);
        if (REQ_CREATE == request.type)
            return this.getCreateCommand(request);
        return null;
    },
    getLayoutContainer:function () {
        return this.getHostFigure();
    },
    showSizeOnDropFeedback:function (request) {
    },
    eraseSizeOnDropFeedback:function (request) {
        if (this.sizeOnDropFeedback != null) {
            this.removeFeedback(this.sizeOnDropFeedback);
            this.sizeOnDropFeedback = null;
        }
    },
    createSizeOnDropFeedback:function (createRequest) {
//        var shadow = anra.FigureUtil.createGhostFigure(this.getHost());
//        this.addFeedback(shadow);
        return null;
    },
    getSizeOnDropFeedback:function (createRequest) {
        if (createRequest != null) {
            if (this.sizeOnDropFeedback == null)
                this.sizeOnDropFeedback = this.createSizeOnDropFeedback(createRequest);
            return this.sizeOnDropFeedback;
        }
    },
    getTargetEditPart:function (request) {
        if (REQ_ADD == request.type
            || REQ_MOVE == request.type
            || REQ_CREATE == request.type
            || REQ_CLONE == request.type)
            return this.getHost();
        return null;
    },
    setListener:function (listener) {
        if (this.listener != null)
            this.getHost().removeEditPartListener(this.listener);
        this.listener = listener;
        if (this.listener != null)
            this.getHost().addEditPartListener(this.listener);
    },
    showTargetFeedback:function (request) {
        if (REQ_ADD == request.type
            || REQ_CLONE == request.type
            || REQ_MOVE == request.type
            || REQ_RESIZE_CHILDREN == request.type
            || REQ_CREATE == request.type)
            this.showLayoutTargetFeedback(request);

        if (REQ_CREATE == request.type) {
//            if (request.getSize() != null) {
            this.showSizeOnDropFeedback(request);
//            }
        }
    },
    undecorateChild:function (child) {
        child.removeEditPolicy(anra.gef.Policy.PRIMARY_DRAG_ROLE);
    },
    undecorateChildren:function () {
        var children = this.getHost().children;
        for (var i = 0; i < children.length; i++)
            this.undecorateChild(children[i]);
    }
});

anra.gef.ConnectionPolicy = anra.gef.AbstractEditPolicy.extend({
    showSourceFeedback:function (req) {
        if (REQ_CONNECTION_START == req.type) {
            var anchor = this.getHost().getSourceAnchor(req);
            this.refreshSourceAnchorFeedback(anchor);
        }
    },
    eraseSourceFeedback:function (req) {
        if (this.sourceAnchor != null) {
            this.getFeedbackLayer().removeChild(this.sourceAnchor);
            this.sourceAnchor = null;
        }
    },
    showTargetFeedback:function (req) {
        if (REQ_RECONNECT_TARGET == req.type) {
            var anchor = this.getHost().getTargetAnchor(req);
            this.refreshTargetAnchorFeedback(anchor);
        }
    },
    eraseTargetFeedback:function (req) {
        if (this.targetAnchor != null) {
            this.getFeedbackLayer().removeChild(this.targetAnchor);
            this.targetAnchor = null;
        }
    },
    refreshTargetAnchorFeedback:function (anchor) {
        if (this.targetAnchor == null) {
            this.targetAnchor = this.createTargetAnchorFeedback();
            this.getFeedbackLayer().addChild(this.targetAnchor);
        }
        this.targetAnchor.setBounds({x:anchor.x, y:anchor.y, width:10, height:10});
    },
    refreshSourceAnchorFeedback:function (anchor) {
        if (this.sourceAnchor == null) {
            this.sourceAnchor = this.createSourceAnchorFeedback();
            this.getFeedbackLayer().addChild(this.sourceAnchor);
        }
        this.sourceAnchor.setBounds({x:anchor.x, y:anchor.y, width:10, height:10});
    },
    createSourceAnchorFeedback:function () {
        var Circle = anra.svg.Control.extend(anra.svg.Circle);
        Circle = new Circle();
        Circle.setAttribute({
            fill:'red'
        });
        Circle.setOpacity(0.5);
        return Circle;
    },
    createTargetAnchorFeedback:function () {
        var Rect = anra.svg.Control.extend(anra.svg.Circle);
        Rect = new Rect();
        Rect.setAttribute({
            stroke:'yellow'
        });
//        Circle.setOpacity(0.5);
        return Rect;
    },
    getCreateConnectionCommand:function (req) {
        var cmd = new anra.gef.CreateLineCommand();
        cmd.line = new anra.gef.LineModel();
        cmd.line.id = anra.genUUID();
        cmd.rootEditPart = this.getHost().getRoot();
        cmd.sourceId = this.getHost().model.id;
        return  cmd;
    },
    getConnectionCompleteCommand:function (req) {
        var cmd = req.command;
        if (cmd == null)return null;
        cmd.targetId = this.getHost().model.id;
        return cmd;
    }
});

/**
 * 选中节点策略
 * @type {*}
 */
anra.gef.SelectionPolicy = anra.gef.AbstractEditPolicy.extend({
    handles:[],
    selectionListener:null,
    activate:function () {
        this.addSelectionListener();
    },
    deactivate:function () {
        this.removeSelectionHandles();
        this.removeSelectionListener();
    },
    validatePolicy:function () {
        if (this.handles.length > 0) {
            for (var i = 0; i < this.handles.length; i++) {
                this.handles[i].refreshLocation();
            }
        }
    },
    addSelectionListener:function () {
        var policy = this;
        var SelectionEditPartListener = anra.gef.EditPartListener.extend({
            selectedStateChanged:function (editPart) {
                switch (editPart.getSelected()) {
                    case SELECTED_NONE:
                        policy.hideSelection();
                        break;
                    case SELECTED:
                    case SELECTED_PRIMARY:
                        policy.showPrimarySelection();
                        break;
                    default :
                }
            }
        });
        this.selectionListener = new SelectionEditPartListener();
        this.getHost().addEditPartListener(this.selectionListener);
    },
    removeSelectionListener:function () {
        this.getHost().removeEditPartListener(this.selectionListener);
    },
    showPrimarySelection:function () {
        if (this.handles == null || this.handles.isEmpty())
            this.addSelectionHandles();
        else {
            for (var i = 0; i < this.handles.length; i++) {
                this.handles[i].setVisible(true);
            }
        }
    },
    hideSelection:function () {
        if (this.handles.isEmpty()) {
            return;
        }
        for (var i = 0; i < this.handles.length; i++) {
            this.handles[i].setVisible(false);
        }
    },
    addSelectionHandles:function () {
        this.removeSelectionHandles();
        this.handles = this.createSelectionHandles();
        for (var i = 0; i < this.handles.length; i++) {
            this.getHandleLayer().addChild(this.handles[i]);
        }
    },
    removeSelectionHandles:function () {
        if (this.handles.isEmpty()) {
            return;
        }
        for (var i = 0; i < this.handles.length; i++) {
            this.getHandleLayer().removeChild(this.handles[i]);
        }
        this.handles = [];
    },
    createSelectionHandles:function (selection) {

    }
});

anra.gef.ResizableEditPolicy = anra.gef.SelectionPolicy.extend({
    createSelectionHandles:function () {
        var handles = [];
        var editPart = this.getHost();
        handles.push(new anra.ResizeHandle(editPart, anra.NORTH));
        handles.push(new anra.ResizeHandle(editPart, anra.SOUTH));
        handles.push(new anra.ResizeHandle(editPart, anra.EAST));
        handles.push(new anra.ResizeHandle(editPart, anra.WEST));
        handles.push(new anra.ResizeHandle(editPart, anra.NORTH_EAST));
        handles.push(new anra.ResizeHandle(editPart, anra.NORTH_WEST));
        handles.push(new anra.ResizeHandle(editPart, anra.SOUTH_EAST));
        handles.push(new anra.ResizeHandle(editPart, anra.SOUTH_WEST));
        return handles;
    }

});

//anra.gef.CreateLinePolicy= anra.gef.

anra.gef.Policy.PRIMARY_DRAG_ROLE = "PrimaryDrag Policy";
