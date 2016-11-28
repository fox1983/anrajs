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
    listener:null,
    feedbackMap:null,
    constructor:function () {
        this.feedbackMap = new Map();
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
        var values = this.feedbackMap.values();
        for(var i= 0,len=values.length;i<len;i++){
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
        var editParts = this.getLayoutEditParts(request);
        if (editParts instanceof Array) {
            for (var i = 0, len = editParts.length; i < len; i++) {
                feedback = this.getFeedback(editParts[i]);
                this.refreshFeedback(feedback);
            }
        } else if (editParts instanceof anra.gef.EditPart) {
            feedback = this.getFeedback(editParts);
            this.refreshFeedback(feedback,request);
        }
    },
    refreshFeedback:function (feedback,request) {

    },
    getLayoutEditParts:function (request) {
        if (REQ_CREATE == request.type) {
            var creationTool = request.event.prop.drag;
            return creationTool.create(this.getHost());
        }
        return null;
    },
    getFeedback:function (ep) {
        var ghost = this.feedbackMap.get(ep.model);
        if (ghost == null) {
            ghost = this.createFeedback(ep)
            this.addFeedback(ghost);
            this.feedbackMap.put(ep.model, ghost);
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
    },a
    getCreateCommand:function (request) {
    },
    getDeleteDependantCommand:function (request) {
        return null;
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
    getMoveCommand:function(){},
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

/**
 * 选中节点策略
 * @type {*}
 */
anra.gef.SelectionPolicy = anra.gef.AbstractEditPolicy.extend({
    handles:[],
    selectionListener:null,
    activate:function () {
        this.base();
        this.addSelectionListener();
    },
    deactivate:function () {
        this.base();
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
        var policy=this;
        var SelectionEditPartListener = anra.gef.EditPartListener.extend({
            selectedStateChanged:function () {
                switch (policy.getHost().getSelected()) {
                    case SELECTED:
                        console.log("SELECTED");
                        break;
                    case SELECTED_NONE:
                        console.log("SELECTED_NONE");  //取消选中触发
                        policy.hideSelection();
                        break;
                    case SELECTED_PRIMARY:
                        console.log("SELECTED_PRIMARY");  //选中触发
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
        this.addSelectionHandles();
    },
    hideSelection:function () {
        this.removeSelectionHandles();
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
    createSelectionHandles:function () {

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
anra.gef.Policy.PRIMARY_DRAG_ROLE = "PrimaryDrag Policy";
