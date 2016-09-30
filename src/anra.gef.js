/**
 * GEF(graphic editor framework)相关类，参考Eclipse GEF编写，完全应用MVC模式。
 * @type {Object}
 */
anra.gef = {};

/**
 * 视图
 * @type {*}
 */
anra.gef.Figure = anra.svg.Composite.extend({
    strokeIn: 'blue',
    stroke: 'black',
    strokeSelected: 'green',
    isSelected: SELECTED_NONE,
    constructor: function () {
        this._Figure();
    },
    _Figure: function () {
        this._Control();
        var f = this;
        this.addListener(anra.EVENT.MouseIn, function (e) {
            f.mouseIn();
        });
        this.addListener(anra.EVENT.MouseOut, function (e) {
            f.mouseOut();
        });
    },
    mouseIn: function () {
        if (this.isSelected == SELECTED_NONE)
            this.setAttribute('stroke', this.strokeIn);
    },
    mouseOut: function () {
        if (this.isSelected == SELECTED_NONE)
            this.setAttribute('stroke', this.stroke);
    },
    setSelected: function (s) {
        this.isSelected = s;
        if (s == SELECTED_PRIMARY) {
            this.setAttribute('stroke', this.strokeSelected);
        } else if (s == SELECTED) {
            this.setAttribute('stroke', '#CC7755');
        } else {
            this.setAttribute('stroke', this.stroke);
        }
    }

})
;

var FLAG_ACTIVE = 1;
var FLAG_FOCUS = 2;
var MAX_FLAG = FLAG_FOCUS;

/**
 * 控制器
 * @type {*}
 */
anra.gef.EditPart = Base.extend({
    selectable: true,
    model: null,
    parent: null,
    selected: SELECTED_NONE,
    figure: null,
    policies: null,
    children: null,
    modelChildren: null,
    flags: 0,
    editor: null,
    listeners: null,
    constructor: function () {
        this._EditPart();
    },
    _EditPart: function () {
        this.sConns = [];
        this.tConns = [];
        this.children = [];
        this.modelChildren = [];
        this.policies = new Map();
        this.listeners = [];
    },
    getRoot: function () {
        return this;
    },
    refreshChildren: function () {
        var i;
        if (this.children != null) {
            var map = new Map();
            //增量修改当前children
            for (var e in this.children) {
                map.set(e.model, e);
            }
            var model, editPart;
            for (i = 0; i < this.modelChildren.length; i++) {
                model = this.modelChildren[i];
                if (i < this.children.length
                    && this.children.get(i).model == model)
                    continue;

                editPart = map.get(model);
                if (editPart != null)
                    this.reorderChild(editPart, i);
                else {
                    editPart = this.createChild(model);
                    this.addChild(editPart, i);
                }
            }

            var size = this.children.length;
            if (i < size) {
                var trash = [];
                for (; i < size; i++)
                    trash.push(this.children[i]);
                for (i = 0; i < trash.length; i++) {
                    var ep = trash[i];
                    this.removeChild(ep);
                }
            }
        }
    },
    createChild: function (model) {
        if (this.editor == null) {
            anra.Platform.error("EditPart的editor不能为空");
            return null;
        }
        return this.editor.createEditPart(this, model);
    },
    addChild: function (child, index) {
        if (this.children == null)
            this.children = [];
        if (index == null)
            index = this.children.length;

        this.children.insert(child, index);
        child.setParent(this);
        this.addChildVisual(child, index);
        child.addNotify();
        child.activate();
    },
    reorderChild: function (editpart, index) {
        this.removeChildVisual(editpart);
        this.children.removeObject(editpart);
        this.children[index] = editpart;
        this.addChildVisual(editpart, index);
    },
    removeChildVisual: function (child) {
        this.getFigure().removeChild(child.getFigure());
    },
    addChildVisual: function (child, index) {
        this.getFigure().addChild(child.getFigure());
    },
    deactivate: function () {
        var i;
        for (i = 0; i < this.children.length; i++) {
            this.children[i].deactivate();
        }
        this.deactivePolicies();
        for (i = 0; i < this.sConns.length; i++) {
            this.sConns[i].deactivate();
        }
    },
    activate: function () {
        this.setFlag(FLAG_ACTIVE, true);
        this.doActive();

        this.activePolicies();
        var i;
        for (i = 0; i < this.children.length; i++)
            this.children[i].activate();

        this.fireActivated();

        for (i = 0; i < this.sConns.length; i++) {
            this.sConns[i].activate();
        }
    },
    doActive: function () {
    },
    fireActivated: function () {
    },
    getFigure: function () {
        if (this.figure == null) {
            this.figure = this.createFigure(this.model);
            this._initFigureListeners();
        }
        return this.figure;
    },
    _initFigureListeners: function () {
        if (this.figure != null) {
            var _ep = this;
            var dt = this.getDragTracker();
            this.figure.addListener(anra.EVENT.MouseDown, function (e) {
                //TODO
                if (dt != null)
                    dt.mouseDown(e, _ep);
            });
            this.figure.addListener(anra.EVENT.DragStart, function (e) {
                if (dt != null)
                    dt.dragStart(e, _ep);
            });
            this.figure.addListener(anra.EVENT.DragEnd, function (e) {
                if (dt != null)
                    dt.dragEnd(e, _ep);
            });
            this.figure.addListener(anra.EVENT.MouseDrag, function (e) {
                if (dt != null)
                    dt.mouseDrag(e, _ep);
            });
            this.figure.addListener(anra.EVENT.MouseUp, function (e) {
                if (dt != null)
                    dt.mouseUp(e, _ep);
            });
        }
    },
    createFigure: function (model) {
        return new anra.gef.Figure();
    },
    isActive: function () {
        return this.getFlag(FLAG_ACTIVE);
    },
    getFlag: function (flag) {
        return (this.flags & flag) != 0;
    },
    setFlag: function (f, v) {
        if (v)
            this.flags |= f;
        else
            this.flags &= ~f;
    },
    addEditPartListener: function (listener) {
        this.listeners.push(listener);
    },
    addNotify: function () {
        this.register();
        this.createEditPolicies();
        for (var i = 0; i < this.children.length; i++)
            this.children[i].addNotify();
        this.refresh();
    },
    createEditPolicies: function () {
    },
    installEditPolicy: function (key, editPolicy) {
        if (key == null) {
            anra.Platform.error("Edit Policies must be installed with key");
            return;
        }
        if (editPolicy == null || !(editPolicy instanceof anra.gef.Policy)) {
            anra.Platform.error("Edit Policies must be installed with key");
            return;
        }
        if (this.policies == null) {
            this.policies = new Map();
            this.policies.set(key, editPolicy);
        }
        else {
            var oldEditPolicy = this.policies.get(key);
            if (oldEditPolicy != null && oldEditPolicy.isActive()) {
                oldEditPolicy.deactivate();
            }
            this.policies.set(key, editPolicy);
        }
        if (editPolicy != null) {
            editPolicy.setHost(this);
            if (this.isActive()) {
                editPolicy.activate();
            }
        }
    },
    activePolicies: function () {
        this.policies.forEach(function (editPolicy) {
            editPolicy.activate();
        });
    },
    deactivePolicies: function () {
        this.policies.forEach(function (editPolicy) {
            editPolicy.deactivate();
        });
    },
    validatePolicies: function () {
        this.policies.forEach(function (editPolicy) {
            editPolicy.validatePolicy();
        });
    },
    getEditPolicy: function (key) {
        var policy = this.policies.get(key);
        return policy;
    },
    removeEditPolicy: function (key) {
        this.policies.remove(key);
    },
    unregister: function () {
        this.unregisterAccessable();
        this.unregisterVisuals();
    },
    register: function () {
        this.registerAccessable();
        this.registerVisuals();
    },
    registerAccessable: function () {
    },
    registerVisuals: function () {
    },
    unregisterVisuals: function () {
    },
    unregisterAccessable: function () {
    },
    eraseSourceFeedBack: function (request) {
    },
    eraseTargetFeedBack: function (request) {
    },
    showSourceFeedback: function (request) {
    },
    showTargetFeedback: function (request) {
    },
    getCommand: function (request) {
    },
    getDragTracker: function (request) {
        return null;
    },
    getSelected: function () {
        return this.selected;
    },
    getTargetEditPart: function (request) {
    },
    getScene: function () {
    },
    hasFocus: function () {
        return this.getFlag(FLAG_FOCUS);
    },
    performRequest: function (request) {
    },
    refresh: function () {
        this.refreshVisual();
        this.refreshChildren();
        this.validatePolicies();
    },
    /**
     * 调用之后必须应用this.figure.paint();
     */
    refreshVisual: function () {
        if (this.figure != null) {
            this.figure.paint();
        }

    },
    removeEditPartListener: function (listener) {
        if (this.listeners.contains(listener)) {
            this.listeners.removeObject(listener);
        }
    },
    removeNotify: function () {
        this.unregisterAccessable();
        this.unregisterVisuals();
        this.unregister();
    },
    setFocus: function (f) {
        if (this.hasFocus() == f)
            return;
        this.setFlag(FLAG_FOCUS, f);
        this.fireSelectionChanged();
    },
    fireSelectionChanged: function () {
        for (var i = 0; i < this.listeners.length; i++) {
            {
                this.listeners[i].selectedStateChanged(this);
            }
        }
    },
    setModel: function (model) {
        this.model = model;
    },
    setParent: function (parent) {
        this.parent = parent;
    },
    setSelected: function (value) {
        this.selected = value;
        if (this.figure != null)
            this.figure.setSelected(value);
        this.fireSelectionChanged();
    },
    understandsRequest: function (req) {
//        var iter = getEditPolicyIterator();
//        while (iter.hasNext()) {
//            if (iter.next().understandsRequest(req))
//                return true;
//        }
        return false;
    }
});

anra.gef.NodeEditPart = anra.gef.EditPart.extend({
    sConns: null,
    tConns: null,
    lineCache: null,
    getSourceAnchor: function (line) {
        return this.figure.getSourceAnchor(line);
    },
    getDragTracker: function () {
        if (this.dragTracker == null)
            this.dragTracker = new anra.gef.DragTracker();
        return this.dragTracker;
    },
    getTargetAnchor: function (line) {
        return this.figure.getTargetAnchor(line);
    },
    constructor: function () {
        this._NodeEditPart();
    },
    _NodeEditPart: function () {
        this._EditPart();
        this.sConns = [];
        this.tConns = [];
    },
    refresh: function () {
        this.base();
        this.refreshSourceConnections();
        this.refreshTargetConnections();
    },
    getModelSourceLines: function () {
        return this.model.sourceLines == null ? [] : this.model.sourceLines;
    },
    getModelTargetLines: function () {
        return this.model.targetLines == null ? [] : this.model.targetLines;
    },
    getRoot: function () {
        return this.parent.getRoot();
    },
    refreshSourceConnections: function () {
        var i;
        var editPart;
        var model;
        var map = new Map();
        if (this.sConns.length > 0) {
            for (i = 0; i < this.sConns.length; i++) {
                editPart = this.sConns[i];
                map.set(editPart.model, editPart);
            }
        }
        var modelObjects = this.getModelSourceLines();
        if (modelObjects != null)
            for (i = 0; i < modelObjects.length; i++) {
                model = modelObjects[i];
                if (i < this.sConns.length && this.sConns[i].model == model) {
                    this.sConns[i].refresh();
                    continue;
                }
                editPart = map.get(model);
                if (editPart != null)
                    this.reorderSourceConnection(editPart, i);
                else {
                    editPart = this.createOrFindConnection(model);
                    this.addSourceConnection(editPart, i);
                }
            }

        // Remove the remaining EditParts
        size = this.sConns.length;
        if (i < size) {
            var trash = [];
            for (; i < size; i++)
                trash.add(this.sConns[i]);
            for (i = 0; i < trash.length; i++)
                this.removeSourceConnection(trash[i]);
        }
    },
    reorderSourceConnection: function (line, index) {
        this.sConns.remove(index);
        this.sConns.insert(line, index);
        line.refresh();
    },
    removeSourceConnection: function (line) {
        this.fireRemovingSourceConnection(line, this.sConns
            .indexOf(line));
        if (line.source == this) {
            line.deactivate();
            line.source = null;
        }
        this.sConns.removeObject(line);
    },
    addSourceConnection: function (line, index) {
        this.sConns.insert(line, index);
        var source = line.source;
        if (source != null)
            source.sConns.removeObject(line);
        line.setSource(this);
        if (this.isActive())
            line.activate();
        this.fireSourceConnectionAdded(line, index);
    },

    refreshTargetConnections: function () {
        var i;
        var editPart;
        var model;
        var map = new Map();
        if (this.tConns.length > 0) {
            for (i = 0; i < this.tConns.length; i++) {
                editPart = this.tConns[i];
                map.set(editPart.model, editPart);
            }
        }
        var modelObjects = this.getModelTargetLines();
        if (modelObjects != null)
            for (i = 0; i < modelObjects.length; i++) {
                model = modelObjects[i];
                if (i < this.tConns.length && this.tConns[i].model == model) {
                    this.tConns[i].refresh();
                    continue;
                }
                editPart = map.get(model);
                if (editPart != null)
                    this.reorderTargetConnection(editPart, i);
                else {
                    editPart = this.createOrFindConnection(model);
                    this.addTargetConnection(editPart, i);
                }
            }
        // Remove the remaining EditParts
        size = this.tConns.length;
        if (i < size) {
            var trash = [];
            for (; i < size; i++)
                trash.add(this.tConns[i]);
            for (i = 0; i < trash.length; i++)
                this.removeTargetConnection(trash[i]);
        }
    },
    addTargetConnection: function (line, index) {
        this.tConns.insert(line, index);
        var target = line.source;
        if (target != null)
            target.tConns.removeObject(line);
        line.setTarget(this);
        this.fireTargetConnectionAdded(line, index);
        line.refresh();
    },
    reorderTargetConnection: function (line, index) {
        this.tConns.remove(index);
        this.tConns.insert(line, index);
        line.refresh();
    },
    removeTargetConnection: function (line, index) {
        this.fireRemovingTargetConnection(line, this.tConns.indexOf(line));
        if (line.target == this)
            line.target = null;
        this.tConns.removeObject(line);
    },
    createLineEditPart: function (model) {
        return new anra.gef.LineEditPart();
    },
    findLineEditPart: function (model) {
        //TODO
        return this.getRoot().getEditPart(model);
    },
    createOrFindConnection: function (model) {
        var linepart = this.findLineEditPart(model);
        if (linepart == null) {
            linepart = this.createLineEditPart(model);
            linepart.setModel(model);
        }
        return linepart;
    },
    fireSourceConnectionAdded: function (line, i) {
        //TODO 增加连线事件类型
    },
    fireRemovingSourceConnection: function (line, i) {
        //TODO
    },
    fireTargetConnectionAdded: function (line, i) {
    },
    fireRemovingTargetConnection: function (line, i) {

    }
});
anra.gef.RootEditPart = anra.gef.EditPart.extend({
    layers: null,
    constructor: function () {
        this._RootEditPart();
    },
    _RootEditPart: function () {
        this._EditPart();
        this.editPartMap = new Map();
        this.layers = new Map();
    },
    setSelection: function (o) {
        this.clearSelection();
        this.selection = o;
        if (o instanceof Array) {
            for (var e in o)
                o.setSelected(SELECTED_PRIMARY);
        } else if (o instanceof anra.gef.EditPart) {
            o.setSelected(SELECTED_PRIMARY);
        }
    },
    clearSelection: function () {
        if (this.selection != null) {
            var o = this.selection;
            if (o instanceof Array) {
                for (var e in o)
                    o.setSelected(SELECTED_NONE);
            } else if (o instanceof anra.gef.EditPart) {
                o.setSelected(SELECTED_NONE);
            }
        }
    },
    getRoot: function () {
        return this;
    },
    createLayer: function () {
        if (this.figure != null) {
            var primaryLayer = new anra.svg.Group();
            var handleLayer = new anra.svg.Group();
            this.figure.addChild(primaryLayer);
            this.figure.addChild(handleLayer);
            this.layers.set(anra.gef.RootEditPart.PrimaryLayer, primaryLayer);
            this.layers.set(anra.gef.RootEditPart.HandleLayer, handleLayer);
        }
    },
    getLayer: function (key) {
        return this.layers.get(key);
    },
    addChildVisual: function (child, index) {
        this.getLayer("Primary_Layer").addChild(child.getFigure());
    },
    regist: function (editPart) {
        this.editPartMap.set(editPart.model, editPart);
    },
    unregist: function (editPart) {
        this.editPartMap.remove(editPart.model);
    },
    getEditPart: function (model) {
        return this.editPartMap.get(model);
    }
});
anra.gef.RootEditPart.PrimaryLayer = "Primary_Layer";
anra.gef.RootEditPart.HandleLayer = "Handle_Layer";
anra.gef.LineEditPart = anra.gef.EditPart.extend({
    target: null,
    source: null,
    doActive: function () {
    },
    setTarget: function (t) {
        if (this.target == t)
            return;
        this.target = t;
        if (t != null)
            this.setParent(t.getRoot());
        else if (this.source == null)
            this.setParent(null);
        if (this.source != null && this.target != null)
            this.refresh();
    },
    setSource: function (t) {
        if (this.source == t)
            return;
        this.source = t;
        if (t != null)
            this.setParent(t.getRoot());
        else if (this.target == null)
            this.setParent(null);
        if (this.source != null && this.target != null)
            this.refresh();
    },
    setParent: function (parent) {
        var wasNull = this.parent == null;
        var becomingNull = parent == null;
        if (becomingNull && !wasNull)
            this.removeNotify();
        this.parent = parent;
        if (wasNull && !becomingNull)
            this.addNotify();
    },
    unregisterVisuals: function () {
        this.deactivateFigure();
    },
    deactivateFigure: function () {
        this.getRoot().figure.removeChild(this.figure);
        this.figure.setSourceAnchor(null);
        this.figure.setTargetAnchor(null);
    },
    registerAccessable: function () {
        this.getRoot().regist(this);
    },
    unregisterAccessable: function () {
        this.getRoot().unregist(this);
    },
    registerVisuals: function () {
        this.activateFigure();
    },
    activateFigure: function () {
        this.getRoot().figure.addChild(this.getFigure());
    },
    getRoot: function () {
        return this.parent.getRoot();
    },
    createFigure: function () {
        return new anra.gef.Line();
    },
    refresh: function () {
        if (this.figure == null) {
            this.getRoot().figure.addChild(this.getFigure());
        }
        this.refreshSourceAnchor();
        this.refreshTargetAnchor();
        this.refreshVisual();
        this.refreshChildren();
    },
    refreshSourceAnchor: function () {
        this.figure.setSourceAnchor(this.getSourceAnchor());
    },
    refreshTargetAnchor: function () {
        this.figure.setTargetAnchor(this.getTargetAnchor());
    },
    getSourceAnchor: function () {
        if (this.source != null)
            return this.source.getSourceAnchor(this);
        return {x: 0, y: 0};
    },
    getTargetAnchor: function () {
        if (this.target != null)
            return this.target.getTargetAnchor(this);
        return {x: 100, y: 100};
    }
});

anra.gef.DragTracker = Base.extend({
    status: null,
    xoffset: 0,
    yoffset: 0,
    startLocation: null,
    mouseDown: function (me, editPart) {
        this.status = me.type;
        editPart.getRoot().setSelection(editPart);
    },
    dragStart: function (me, editPart) {
        this.status = me.type;
        this.startLocation = {x: editPart.model.getBounds()[0], y: editPart.model.getBounds()[1]};
        this.xStart = me.x - editPart.model.getBounds()[0];
        this.yStart = me.y - editPart.model.getBounds()[1];
    },
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = me.x - this.xStart;
        editPart.model.getBounds()[1] = me.y - this.yStart;
        editPart.refresh();
    },
    dragEnd: function (me, editPart) {
        this.status = me.type;
        editPart.editor.execute(new anra.gef.RelocalCommand(editPart, this.startLocation, {
            x: editPart.model.getBounds()[0],
            y: editPart.model.getBounds()[0]
        }));
    },
    mouseUp: function (me, editPart) {
        this.status = me.type;
    }
});

anra.gef.RelocalCommand = anra.Command.extend({
    constructor: function (editPart, sp, ep) {
        this.sp = sp;
        this.ep = ep;
        this.editPart = editPart;
    },
    canExecute: function () {
        return this.editPart != null && this.sp != null && this.ep != null;
    },
    execute: function () {
        this.editPart.model.getBounds()[0] = this.ep.x;
        this.editPart.model.getBounds()[1] = this.ep.y;
        this.editPart.refresh();
    },
    undo: function () {
        this.editPart.model.getBounds()[0] = this.sp.x;
        this.editPart.model.getBounds()[1] = this.sp.y;
        this.editPart.refresh();
    }
});


anra.gef.ConstraintCommand = anra.Command.extend({
    constructor: function (editPart, sp, ep) {
        this.sp = sp;
        this.ep = ep;
        this.editPart = editPart;
    },
    canExecute: function () {
        return this.editPart != null && this.sp != null && this.ep != null;
    },
    execute: function () {
        this.editPart.model.getBounds()[0] = this.ep.x;
        this.editPart.model.getBounds()[1] = this.ep.y;
        this.editPart.model.getBounds()[2] = this.ep.width;
        this.editPart.model.getBounds()[3] = this.ep.height;
        this.editPart.refresh();
    },
    undo: function () {
        this.editPart.model.getBounds()[0] = this.sp.x;
        this.editPart.model.getBounds()[1] = this.sp.y;
        this.editPart.model.getBounds()[2] = this.sp.width;
        this.editPart.model.getBounds()[3] = this.sp.height;
        this.editPart.refresh();
    }
});


anra.gef.Policy = Base.extend({
    activate: function () {
    },
    deactivate: function () {
    },
    validatePolicy: function () {
    }
});

anra.gef.Palette = anra.gef.Figure.extend({});

anra.gef.Request = Base.extend({});
anra.gef.Editor = Base.extend({
    canvas: null,
    input: null,
    palette: null,
    element: null,
    rootEditPart: null,
    cmdStack: null,
    background: '#EEFFEE',
    _Editor: function () {
    },
    setInput: function (input) {
        this.input = this.handleInput(input);
    },
    handleInput: function (input) {
        return input;
    },
    createContent: function (parentId) {
        this.element = document.getElementById(parentId);
        this.actionRegistry = new anra.ActionRegistry();
        this.registActions();
        if (this.element == null) {
            anra.Platform.error('GEF的父级元素不能为空');
            return;
        }
        this.palette = this.createPalette(parentId);
        this.canvas = this.createCanvas(parentId);

        this._initCanvasListeners(this.canvas);

        this.rootEditPart = this.createRootEditPart();
        this.rootEditPart.editor = this;
        this.initRootEditPart(this.rootEditPart);
        this.cmdStack = new anra.CommandStack();
    },
    _initCanvasListeners: function (cav) {
        var editor = this;
        this.canvas.addKeyListener({
            handleEvent: function (e) {
                editor.actionRegistry.keyHandle(e);
            }
        });
    },
    registActions: function () {

    },
    execute: function (c) {
        if (this.cmdStack != null)
            this.cmdStack.execute(c);
    },
    createRootEditPart: function () {
        var root = new anra.gef.RootEditPart();
        root.figure = this.canvas;
        root.setModel(this.models);
        root.createLayer();
        return root;
    },
    createEditPart: function (context, model) {
        var part = new anra.gef.EditPart();
        part.model = model;
        return part;
    },
    initRootEditPart: function (editPart) {
        editPart.refresh();
    },
    _save: function () {
        this.doSave();
        this.cmdStack.markSaveLocation();
    },
    doSave: function () {
        //执行保存
    },
    isDirty: function () {
        return this.cmdStack.isDirty();
    },
//    getDefaultTool:function () {
//        if (this.tool == null)
//            this.tool = new anra.gef.SelectionTool();
//        return this.tool;
//    },
    createPalette: function (id) {
        var i = id + 'Plt';
        var div = document.createElement('div');
        div.setAttribute('id', i);
        div.style.position = 'relative';
        div.style.width = '10%';
        div.style.height = '100%';
        div.style.float = 'left';
        div.style.backgroundColor = '#CCCCCC';
        this.element.appendChild(div);
        return new anra.gef.Palette(i);
    },
    createCanvas: function (id) {
        var i = id + 'Cav';
        var div = document.createElement('div');
        div.setAttribute('id', i);
        div.style.position = 'relative';
        div.style.width = '90%';
        div.style.height = '100%';
        div.style.float = 'right';
        div.style.overflow = 'auto';
        div.style.background = this.background;
        this.element.appendChild(div);
        return new anra.SVG(i);
    }
});


/**
 * 连线
 * @type {*}
 */
anra.gef.Line = anra.gef.Figure.extend({
    router: null,
    tagName: 'line',
    startPoint: null,
    endPoint: null,
    sourceAnchor: null,
    targetAnchor: null,
    endMarker: null,
    startMarker: null,
    setStartMarker: function (marker) {
        this.startMarker = marker;
        if (marker != null) {
            marker.init(this);
            this.setAttribute('marker-start', 'url(#' + marker.id + ')');
        } else
            this.removeAttribute('marker-start');
    },
    setEndMarker: function (marker) {
        if (marker != null) {
            this.setAttribute('marker-end', 'url(#' + marker.id + ')');
        } else
            this.removeAttribute('marker-end');
    },
    constructor: function () {
        this._Line();
    },
    _Line: function () {
        this._Figure();
        this.points = [];
        this.startPoint = {};
        this.endPoint = {};
    },
    setStartPoint: function (p) {
        setPoint(this.startPoint, p);
    },
    setEndPoint: function (p) {
        setPoint(this.endPoint, p);
    },
    initProp: function () {
        this.setAttribute({
            stroke: 'black',
            'stroke-width': '1.5'
        });
    },
    paint: function () {
        var f = this;
        if (this.sourceAnchor != null && this.targetAnchor != null)
            this.setAttribute({
                x1: f.sourceAnchor.x,
                y1: f.sourceAnchor.y,
                x2: f.targetAnchor.x,
                y2: f.targetAnchor.y
            });
    },
    setSourceAnchor: function (anchor) {
        this.sourceAnchor = anchor;
    },
    setTargetAnchor: function (anchor) {
        this.targetAnchor = anchor;
    },
    layout: function () {
    }
});


var setPoint = function (o, t) {
    if (s != null)
        for (var k in t) {
            o[k] = t[k];
        }
};
/**
 * 曲线
 * @type {*|void}
 */
anra.gef.Polyline = anra.gef.Line.extend({
    points: null,
    tagName: 'polyline'
});

/**
 * 路径线
 * @type {*|void}
 */
anra.gef.PathLine = anra.gef.Line.extend({
    points: null,
    tagName: 'path'

});

anra.gef.Marker = anra.svg.Control.extend({});


anra.gef.BaseModel = Base.extend({
    constructor: function () {
        this._BaseModel();
    },
    _BaseModel: function () {
        this.properties = new Map();
    },
    /**
     * 输入应当为json
     * @param p
     * @param fire
     */
    setProperties: function (p, fire) {
        var o, n;
        for (var key in p) {
            o = this.properties.get(key);
            this.properties.set(key, p[key]);
            if (fire) {
                this.firePropertyChanged(key, o, p[key]);
            }
        }
    },
    getBounds: function () {
        return this.properties.get('bounds');
    },
    setBounds: function (b, fire) {
        var old = this.getBounds();
        this.properties.put('bounds', b);
        if (fire)
            this.firePropertyChanged('bounds', old, b);
    },
    setValue: function (key, value, fire) {
        //TODO
        var o, n;
        o = this.properties.get(key);
        this.properties.set(key, value);
        if (fire) {
            this.firePropertyChanged(key, o, value);
        }
    },
    getValue: function (key) {
        return this.properties.get(key);
    },
    firePropertyChanged: function (key, oldValue, newValue) {

    }
});

anra.gef.NodeModel = anra.gef.BaseModel.extend({
    sourceLines: null,
    targetLines: null,
    constructor: function () {
        this._NodeModel();
    },
    addSourceLine: function (line) {
        this.sourceLines.push(line);
    },
    addTargetLine: function (line) {
        this.targetLines.push(line);
    },
    _NodeModel: function () {
        this._BaseModel();
        this.sourceLines = [];
        this.targetLines = [];
    }
});

anra.gef.LineModel = anra.gef.BaseModel.extend({});