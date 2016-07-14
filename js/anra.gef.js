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

});

anra.gef.LineFigure = anra.svg.Figure.extend({

});

var FLAG_ACTIVE = 1;
var FLAG_FOCUS = 2;
var MAX_FLAG = FLAG_FOCUS;
/**
 * 控制器
 * @type {*}
 */
anra.gef.EditPart = Base.extend({
    SELECTED:0,
    SELECTED_NONE:1,
    SELECTED_PRIMARY:2,
    selectable:true,
    model:null,
    parent:null,
    selected:this.SELECTED_NONE,
    figure:null,
    sConns:null,
    tConns:null,
    policies:null,
    children:null,
    flags:0,
    constructor:function () {
        this.sConns = [];
        this.tConns = [];
        this.children = [];
    },
    deactivate:function () {
        var i;
        for (i = 0; i < this.children.length; i++) {
            this.children[i].deactivate();
        }

        this.
            deactivePolicies();
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
        if (p == null || p.class == null || p.class != anra.gef.Policy.class) {
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
    },
    eraseSourceFeedBack:function (request) {
    },
    eraseTargetFeedBack:function (request) {
    },
    getCommand:function (request) {
    },
    getDragTracker:function (request) {
    },
    getEditPolicy:function (key) {
    },
    getModel:function () {
        return this.model;
    },
    getParent:function () {
        return this.parent;
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
        this.parent = parent;
    },
    setSelected:function (value) {
        this.selected = value;
    },
    showSourceFeedback:function (request) {
    },
    showTargetFeedback:function (request) {
    },
    understandsRequest:function (req) {
        var iter = getEditPolicyIterator();
        while (iter.hasNext()) {
            if (iter.next().understandsRequest(req))
                return true;
        }
        return false;
    }
})
;

anra.gef.Policy = Base.extend({
    activate:function () {
    },
    deactivate:function () {
    }
});

anra.gef.Policy.prototype.class = "anra.gef.Policy ";
anra.gef.Request = Base.extend({});

anra.gef.GEFEditor = anra.Scene.extend({});