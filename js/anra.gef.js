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
    strokeIn:'blue',
    stroke:'black',
    strokeSelected:'green',
    isSelected:false,
    constructor:function () {
        this._Figure();
    },
    _Figure:function () {
        this._Control();
        var f = this;
        this.addListener(anra.EVENT.MouseIn, function (e) {
            f.mouseIn();
        });
        this.addListener(anra.EVENT.MouseOut, function (e) {
            f.mouseOut();
        });
    },
    mouseIn:function () {
        if (!this.isSelected)
            this.setAttribute('stroke', this.strokeIn);
    },
    mouseOut:function () {
        if (!this.isSelected)
            this.setAttribute('stroke', this.stroke);
    },
    setSelected:function (s) {
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

anra.gef.LineFigure = anra.gef.Figure.extend({

});

var FLAG_ACTIVE = 1;
var FLAG_FOCUS = 2;
var MAX_FLAG = FLAG_FOCUS;
/**
 * 控制器
 * @type {*}
 */
anra.gef.EditPart = Base.extend({
    selectable:true,
    model:null,
    parent:null,
    selected:SELECTED_NONE,
    figure:null,
    sConns:null,
    tConns:null,
    policies:null,
    children:null,
    modelChildren:null,
    flags:0,
    editor:null,
    constructor:function () {
        this._EditPart();
    },
    _EditPart:function () {
        this.sConns = [];
        this.tConns = [];
        this.children = [];
        this.modelChildren = [];
        this.policies = [];
    },
    refreshChildren:function () {
        var i;
        if (this.children == null)
            return;
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

        var size = this.children.length
        if (i < size) {
            var trash = [];
            for (; i < size; i++)
                trash.push(this.children[i]);
            for (i = 0; i < trash.size(); i++) {
                var ep = trash[i];
                this.removeChild(ep);
            }
        }
    },
    createChild:function (model) {
        if (this.editor == null) {
            console.log("EditPart的editor不能为空");
            return null;
        }
        return  this.editor.createEditPart(this, model);
    },
    addChild:function (child, index) {
        if (index == null)
            index = getChildren().size();
        if (this.children == null)
            this.children = [];

        this.children[index] = child;
        child.setParent(this);
        this.addChildVisual(child, index);
        child.addNotify();
        child.activate();
    },
    reorderChild:function (editpart, index) {
        this.removeChildVisual(editpart);
        this.children.removeObject(editpart);
        this.children[index] = editpart;
        this.addChildVisual(editpart, index);
    },
    removeChildVisual:function (editPart) {
        this.getFigure().removeChild(editPart.getFigure());
    },
    addChildVisual:function (editPart, index) {
        this.getFigure().addChild(editPart.getFigure());
    },
    deactivate:function () {
        var i;
        for (i = 0; i < this.children.length; i++) {
            this.children[i].deactivate();
        }
        this.deactivePolicies();
        for (i = 0; i < this.sConns.length; i++) {
            this.sConns[i].deactivate();
        }
    },
    activate:function () {
        this.setFlag(FLAG_ACTIVE, true);

        this.activePolicies();
        var i;
        for (i = 0; i < this.children.length; i++)
            this.children[i].activate();

        this.fireActivated();

        for (i = 0; i < this.sConns.length; i++) {
            this.sConns[i].activate();
        }
    },
    deactivePolicies:function () {
        for (var i = 0; i < this.policies.length; i++) {
            this.policies[i].deactivate();
        }
    },
    activePolicies:function () {
        for (var i = 0; i < this.policies.length; i++) {
            this.policies[i].activate();
        }
    },
    fireActivated:function () {
    },
    installPolicy:function (k, p) {
        if (k == null) {
            anra.Platform.error("Edit Policies must be installed with key");
            return;
        }
        if (p == null || !(p instanceof anra.gef.Policy)) {
            anra.Platform.error("Edit Policies must be installed with key");
            return;
        }
        if (this.policies == null) {
            this.policies = [];
            this.policies.push(k);
            this.policies.push(p);
        } else {
            var i = 0;
            while (i < this.policies.length && !k.equals(this.policies[i]))
                i += 2;
            if (i < this.policies.length) {
                i++;
                var old = this.policies[i];
                if (old != null && this.isActive())
                    old.deactivate();
                this.policies[i] = p;
            } else {
                this.policies.push(k);
                this.policies.push(p);
            }
        }

    },
    getFigure:function () {
        if (this.figure == null) {
            this.figure = this.createFigure();
            this._initFigureListeners();
        }
        return this.figure;
    },
    _initFigureListeners:function () {
        if (this.figure != null) {
            var _ep = this;
            this.figure.addListener(anra.EVENT.MouseDown, function (e) {
                //TODO
                if (_ep.editor != null && _ep.editor.getDefaultTool() != null)
                    _ep.editor.getDefaultTool().mouseDown(e, _ep);
            });
            this.figure.addListener(anra.EVENT.MouseDrag, function (e) {
                if (_ep.editor != null && _ep.editor.getDefaultTool() != null)
                    _ep.editor.getDefaultTool().mouseDrag(e, _ep);
            });
            this.figure.addListener(anra.EVENT.MouseUp, function (e) {
                if (_ep.editor != null && _ep.editor.getDefaultTool() != null)
                    _ep.editor.getDefaultTool().mouseUp(e, _ep);
            });
        }
    },
    createFigure:function () {
        return new anra.gef.Figure();
    },
    getSourceConnections:function () {
    },
    getTargetConnections:function () {
    },
    isActive:function () {
        return this.getFlag(FLAG_ACTIVE);
    },
    getFlag:function (flag) {
        return (this.flags & flag) != 0;
    },
    setFlag:function (f, v) {
        if (v)
            this.flags |= f;
        else
            this.flags &= ~f;
    },
    addEditPartListener:function () {
    },
    addNotify:function () {
        this.register();
        this.createEditPolicies();
        for (var i = 0; i < this.children.length; i++)
            this.children[i].addNotify();
        this.refresh();
    },
    register:function () {
    },
    createEditPolicies:function () {
    },
    eraseSourceFeedBack:function (request) {
    },
    eraseTargetFeedBack:function (request) {
    },
    showSourceFeedback:function (request) {
    },
    showTargetFeedback:function (request) {
    },
    getCommand:function (request) {
    },
    getDragTracker:function (request) {
        if (this.dragTracker == null)
            this.dragTracker = new anra.gef.DragTracker();
        return this.dragTracker;
    },
    getEditPolicy:function (key) {
    },
    getSelected:function () {
    },
    getTargetEditPart:function (request) {
    },
    getScene:function () {
    },
    hasFocus:function () {
        return this.getFlag(FLAG_FOCUS);
    },
    installEditPolicy:function (key, editPolicy) {
    },
    performRequest:function (request) {
    },
    refresh:function () {
        this.refreshVisual();
        this.refreshChildren();
    },
    refreshVisual:function () {
    },
    removeEditPartListener:function () {
    },
    removeEditPolicy:function (key) {
    },
    removeNotify:function () {
    },
    setFocus:function (f) {
        if (this.hasFocus() == f)
            return;
        this.setFlag(FLAG_FOCUS, f);
        this.fireSelectionChanged();
    },
    fireSelectionChanged:function () {

    },
    setModel:function (model) {
        this.model = model;
    },
    setParent:function (parent) {
        this.editor = parent.editor;
        this.parent = parent;
    },
    setSelected:function (value) {
        this.selected = value;
        if (this.figure != null)
            this.figure.setSelected(value);
    },
    understandsRequest:function (req) {
//        var iter = getEditPolicyIterator();
//        while (iter.hasNext()) {
//            if (iter.next().understandsRequest(req))
//                return true;
//        }
        return false;
    }
});

//TODO
anra.gef.SelectionTool = Base.extend({
    currentEditor:null,
    startLocation:null,
    dragTrack:null,
    targetEditPart:null,
    mouseDown:function (me, editPart) {
        this.currentEditor = editPart.editor;
        this.startLocation = {x:me.x, y:me.y};
        this.targetEditPart = editPart;
        this.handleButtonDown(me, editPart);

        if (this.dragTrack != null)
            this.dragTrack.mouseDown(me, editPart);
    },
    handleButtonDown:function (me, editPart) {
        if (editPart instanceof  anra.gef.EditPart) {
            this.setDragTracker(editPart.getDragTracker());
        }
    },
    mouseDrag:function (me, editPart) {
        if (this.dragTrack != null)
            this.dragTrack.mouseDrag(me, editPart);
    },
    mouseUp:function (me, editPart) {
        if (this.dragTrack != null)
            this.dragTrack.mouseUp(me, editPart);
        this.currentEditor = editPart.editor;
        this.targetEditPart = editPart;
    },
    setDragTracker:function (dt) {
        if (this.dragTrack == dt)
            return;
        if (this.dragTrack != null)
            this.dragTrack.deactivate();
        this.dragTrack = dt;
        if (this.dragTrack != null) {
            this.dragTrack.currentEditor = this.currentEditor;
            this.dragTrack.targetEditPart = this.targetEditPart;
            this.dragTrack.active();
        }
    },
    active:function () {

    },
    deactivate:function () {
        this.currentEditor = null;
        this.startLocation = null;
        this.dragTrack = null;
        this.targetEditPart = null;
    }
});

anra.gef.DragTracker = anra.gef.SelectionTool.extend({
    status:null,
    mouseDown:function (me, editPart) {
        this.status = me.type;
        if (this.currentEditor != null)
            this.currentEditor.setSelection(editPart);
    },
    mouseDrag:function(me,editPart){
        this.status = me.type;
    },
    mouseUp:function (me, editPart) {
        console.log('up');
        //TODO
        if (this.status == anra.EVENT.MouseDrag) {
            editPart.figure.bounds.x=me.x;
            editPart.figure.bounds.y=me.y;
            editPart.figure.applyBounds();
            // editPart.editor.cmdStack.execute();
        }
        this.status = me.type;

    }
});


anra.gef.Policy = Base.extend({
    activate:function () {
    },
    deactivate:function () {
    }
});

anra.gef.Palette = anra.gef.Figure.extend({});

anra.gef.Request = Base.extend({});
anra.gef.Editor = Base.extend({
    canvas:null,
    input:null,
    palette:null,
    element:null,
    rootEditPart:null,
    cmdStack:null,
    tool:null,
    _Editor:function () {
    },
    setInput:function (input) {
        this.input = input;
    },
    createContent:function (parentId) {
        this.element = document.getElementById(parentId);
        if (this.element == null) {
            console.log('GEF的父级元素不能为空');
            return;
        }
        this.palette = this.createPalette(parentId);
        this.canvas = this.createCanvas(parentId);

        this.rootEditPart = this.createRootEditPart();
        this.rootEditPart.editor = this;
        this.initRootEditPart(this.rootEditPart);
        this.cmdStack = new anra.CommandStack();
    },
    createRootEditPart:function () {
        var root = new anra.gef.EditPart();
        root.figure = this.canvas;
        root.model = this.input;
        return root;
    },
    createEditPart:function (context, model) {
        var part = new anra.gef.EditPart();
        part.model = model;
        return part;
    },
    initRootEditPart:function (editPart) {
        editPart.refresh();
    },
    _save:function () {
        this.doSave();
        this.cmdStack.markSaveLocation();
    },
    doSave:function () {
        //执行保存
    },
    isDirty:function () {
        return this.cmdStack.isDirty();
    },
    getDefaultTool:function () {
        if (this.tool == null)
            this.tool = new anra.gef.SelectionTool();
        return this.tool;
    },
    setSelection:function (o) {
        this.clearSelection();
        this.selection = o;
        if (o instanceof Array) {
            for (var e in o)
                o.setSelected(SELECTED_PRIMARY);
        } else if (o instanceof anra.gef.EditPart) {
            o.setSelected(SELECTED_PRIMARY);
        }
    },
    clearSelection:function () {
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
    createPalette:function (id) {
        var i = id + 'Plt';
        var div = document.createElement('div');
        div.setAttribute('id', i);
        div.style.position = 'relative';
        div.style.width = '20%';
        div.style.height = '100%';
        div.style.float = 'left';
        div.style.backgroundColor = '#CC78A7';
        this.element.appendChild(div);
        return new anra.gef.Palette(i);
    },
    createCanvas:function (id) {
        var i = id + 'Cav';
        var div = document.createElement('div');
        div.setAttribute('id', i);
        div.style.position = 'relative';
        div.style.width = '80%';
        div.style.height = '100%';
        div.style.float = 'right';
        div.style.backgroundColor = '#AAFFBB';
        this.element.appendChild(div);
        this.element.appendChild(div);
        return  new anra.SVG(i);
    }
})
;