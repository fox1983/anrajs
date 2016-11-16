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
    activate:function () {
        this.setListener(this.createListener());
        this.decorateChildren();
    },
    createChildEditPolicy:function (child) {
        //TODO
    },
    eraseLayoutTargetFeedback:function (request) {
        //TODO
    },
    getAddCommand:function (request) {
        return null;
    },
    getCloneCommand:function (request) {
        return null;
    },
    showLayoutTargetFeedback:function (request) {
    },
    showSizeOnDropFeedback:function (request) {
    },
    getMoveChildrenCommand:function (request) {
        //TODO
    },
    getOrphanChildrenCommand:function (request) {
        return null;
    },
    getCreateCommand:function (request) {
    },
    getCreationFeedbackOffset:function (request) {
//    return new Insets();
        return null;
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
    createSizeOnDropFeedback:function (createRequest) {
        return null;
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
    eraseSizeOnDropFeedback:function (request) {
        if (this.sizeOnDropFeedback != null) {
            this.removeFeedback(this.sizeOnDropFeedback);
            this.sizeOnDropFeedback = null;
        }
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
        if (REQ_CLONE == request.type)
            return this.getCloneCommand(request);
        if (REQ_CREATE == request.type)
            return this.getCreateCommand(request);
        return null;
    },
    getLayoutContainer:function () {
        return this.getHostFigure();
    },
    getSizeOnDropFeedback:function (createRequest) {
        if (createRequest != null) {
            if (this.sizeOnDropFeedback == null)
                this.sizeOnDropFeedback = this.createSizeOnDropFeedback(createRequest);

            return this.getSizeOnDropFeedback();
        }

        //TODO 创建拖拽的虚影
//        if (this.sizeOnDropFeedback == null) {
//            this.sizeOnDropFeedback = new RectangleFigure();
//            FigureUtilities.makeGhostShape((Shape)
//            this.sizeOnDropFeedback
//        )
//            ;
//            ((Shape)
//            this.sizeOnDropFeedback
//        ).
//            setLineStyle(Graphics.LINE_DASHDOT);
//            this.sizeOnDropFeedback.setForegroundColor(ColorConstants.white);
//            addFeedback(this.sizeOnDropFeedback);
//        }
//        return this.sizeOnDropFeedback;
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
            if (request.getSize() != null) {
                this.showSizeOnDropFeedback(request);
            }
        }
    },
    undecorateChild:function (child) {
        child.removeEditPolicy(anra.gef.Policy.PRIMARY_DRAG_ROLE);
    },
    undecorateChildren:function () {
        var children = this.getHost().children;
        for (var i = 0; i < children.length; i++)
            this.undecorateChild(children[i]);
    },
    getLayoutOrigin:function () {
        //TODO
        return this.getLayoutContainer().getClientArea().getLocation();
    },
    translateFromAbsoluteToLayoutRelative:function (t) {
        //TODO
//    IFigure figure = getLayoutContainer();
//    figure.translateToRelative(t);
//    figure.translateFromParent(t);
//    Point negatedLayoutOrigin = getLayoutOrigin().getNegated();
//    t.performTranslate(negatedLayoutOrigin.x, negatedLayoutOrigin.y);
    },
    translateFromLayoutRelativeToAbsolute:function (t) {
//    IFigure figure = getLayoutContainer();
//    Point layoutOrigin = getLayoutOrigin();
//    t.performTranslate(layoutOrigin.x, layoutOrigin.y);
//    figure.translateToParent(t);
//    figure.translateToAbsolute(t);
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
        var SelectionEditPartListener = anra.gef.EditPartListener.extend({
            selectedStateChanged:function () {
                switch (this.editPart.getSelected()) {
                    case SELECTED:
                        console.log("SELECTED");
                        break;
                    case SELECTED_NONE:
                        console.log("SELECTED_NONE");  //取消选中触发
                        this.policy.hideSelection();
                        break;
                    case SELECTED_PRIMARY:
                        console.log("SELECTED_PRIMARY");  //选中触发
                        this.policy.showPrimarySelection();
                        break;
                    default :
                }
            }
        });
        this.selectionListener = new SelectionEditPartListener(this.getHost(), this);
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
        handles.push(new anra.Handle(editPart, anra.Handle.NORTH));
        handles.push(new anra.Handle(editPart, anra.Handle.SOUTH));
        handles.push(new anra.Handle(editPart, anra.Handle.EAST));
        handles.push(new anra.Handle(editPart, anra.Handle.WEST));
        handles.push(new anra.Handle(editPart, anra.Handle.NORTH_EAST));
        handles.push(new anra.Handle(editPart, anra.Handle.NORTH_WEST));
        handles.push(new anra.Handle(editPart, anra.Handle.SOUTH_EAST));
        handles.push(new anra.Handle(editPart, anra.Handle.SOUTH_WEST));
        return handles;
    }

});
anra.gef.Policy.PRIMARY_DRAG_ROLE = "PrimaryDrag Policy";
