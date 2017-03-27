/**
 * Created by Hasee on 2017/3/21.
 *
 * API for flow dialect，example:
 input=[
 {id:1, name:'CAPP', type:0,bounds:[100, 150, 40, 40]},
 {id:2, name:'MNPP', type:1, desc:'transaction',  bounds:[250, 100, 40, 40]},
 {id:3, name:'TMKS', type:1, desc:'handle exception',bounds:[250, 200, 40, 40]},
 {id:4, name:'CIVR', type:1, bounds:[430, 60, 40, 40]},
 {id:5, name:'CSRS', type:2, bounds:[430, 140, 40, 40]},
 {id:6, name:'CIVR', type:2, bounds:[430, 180, 40, 40]},
 {id:7, name:'CSRS', type:2, bounds:[430, 260, 40, 40]}]

 link=[
 {id:0,source:1,target:2,exit:0,entr:1},
 {id:1,source:1,target:2,exit:2,entr:1},
 {id:2,source:1,target:2,exit:3,entr:1}
 ]

 FlowEditor = function(config){
 }

 CommonEditPart = function(config){
 }

 SystemEditPart=new CommonEditPart({
    key:'id',
    children:null
 });


 editor = new FlowEditor({
            data:data,
            line:link,
            id:tagId,
            name:'EditorName',
            key:'id',
            children:{
                    0: SystemEditPart,
                    1: SegmentEditPart,
                    2: BalanceEditPart,
                    3: ContainerEditPart,
                    4: StartEditPart,
                    5: EndEditPart
            },
            command:{
                0:{
                name: 'undo',
                type: ACTION_STACK,
                key: 'ctrl+z',
                run: function () {
                    editor.cmdStack.undo();
                },
                check: function (node) {
                    return editor.cmdStack.canUndo();
                }
            }
            }
            },
 policies:{

            },
 paint:function(){
            }

 });
 */

/**
 * 对外的API
 * @type {{}}
 */
$AGEF = {};

/**
 * 图形常量
 */
$AGEF.figure = {
    CIRCLE: anra.svg.Circle,
    RECTANGLE: anra.svg.Rectangle,
    IMAGE: anra.svg.Image
};

/**
 * 编辑器的API
 * @type {{}}
 */
$AGEF.Editor = anra.gef.Editor.extend({
    config: null,
    constructor: function (config) {
        this.config = config;
        this.setInput(config.data);
    },
    input2model: function (data, rootModel) {
        var nodeModel, lineModel;
        var i;
        //节点处理
        if (data)
            for (i = 0; i < data.length; i++) {
                nodeModel = createNode.call(this, data[i], this.config.children[data[i].type]);
                this.rootModel.addChild(nodeModel);
            }
        //连线处理
        var lines = this.config.line;
        var line, source, target;
        if (lines)
            for (i = 0; i < lines.length; i++) {
                line = lines[i];
                lineModel = createLine(line);
                source = this.rootModel.getChild(line.source);
                if (source == null)
                    throw 'source of line[' + line.id + '] does not exist';
                target = this.rootModel.getChild(line.target);
                if (target == null)
                    throw 'target of line[' + line.id + '] does not exist';

                source.addSourceLine(lineModel);
                target.addTargetLine(lineModel);
            }
    },
    registActions: function () {
        this.actionRegistry.regist(this.config.commands);
    },
    initRootEditPart: function (editPart) {
        editPart.config = this.config;
        editPart.addNotify();
    },
    addNode: function (data) {
        this.exec(new anra.gef.CreateNodeCommand(this.rootEditPart, createNode.call(this, data, this.config.children[data.type])));
    },
    removeNode: function (node) {
        if (!(node instanceof anra.gef.NodeModel))
            node = this.find(node);
        if (node == null)
            throw 'can not find node';
        this.exec(new anra.gef.DeleteNodeAndLineCommand(this.rootEditPart, node));
    },
    addLine: function (data) {
        this.exec(new anra.gef.CreateLineCommand(this.rootEditPart, createLine(data), data.source, data.target));
    },
    removeLine: function (line) {
        this.exec(new anra.gef.DeleteLineCommand(this.rootEditPart, line));
    },
    find: function (id) {
        var model = this.rootEditPart.model.getChild(id);
        return this.rootEditPart.getEditPart(model);
    },
    exec: function (cmd) {
        if (this.cmdStack)
            this.cmdStack.execute(cmd);
    },
    undo: function () {
        if (this.cmdStack)
            this.cmdStack.undo();
    },
    redo: function () {
        if (this.cmdStack)
            this.cmdStack.redo();
    },
    canUndo: function (cmd) {
        if (this.cmdStack)
            this.cmdStack.canUndo();
    },
    canRedo: function (cmd) {
        if (this.cmdStack)
            this.cmdStack.canRedo(cmd);
    },
    createEditPart: function (parentControl, model) {
        var config = this.config.children[model.props.type];
        if (config == null)throw 'can not found EditPart config on node [' + model.props.type + ']';
        var e = new anra.gef.NodeEditPart();
        e.config = config;
        e.refreshVisual = config.refresh;

        if (config.on) {
            e.installEditPolicy('on create figure', anra.gef.Policy.init({
                activate: function () {
                    var key;
                    for (key in config.on) {
                        this.getHostFigure().on(key, config.on[key]);
                    }
                },
                deactivate: function () {
                    var key;
                    for (key in config.on) {
                        this.getHostFigure().off(key, config.on[key]);
                    }
                }
            }));
        }

        if (config.selectable) {
            var p = new anra.gef.ResizableEditPolicy();
            p.selected = config.selected;
            p.unselected = config.unselected;
            e.installEditPolicy('selection', p);
            config.onselect && e.addSelectionListener(config.onselect);
        }

        if (config.canDrag) {
            e.dragTracker = new anra.gef.DragTracker();
        }

        if (config.line) {
            e.createLineEditPart = function (model) {
                var l = new anra.gef.LineEditPart(model);
                l.config = config.line;
                l.onCreateFigure = function (figure) {
                    figure.router = config.line.router;
                };
                return l;
            }
        }
        return e;
    },
    getCustomPolicies: function () {
        this.put(anra.gef.LAYOUT_POLICY, new anra.gef.LayoutPolicy());
    }

})
;
var createLine = function (data) {
    var lineModel = new anra.gef.LineModel();
    lineModel.setProperties(data);
    lineModel.id = data.id;
    lineModel.sourceTerminal = data.exit;
    lineModel.targetTerminal = data.entr;
    return lineModel;
};
var createNode = function (data, controller) {
    var key = this.config.key || 'id';
    var nodeModel = new anra.gef.NodeModel();
    nodeModel.id = data[key];
    // nodeModel.editPartClass = controller;
    // if (nodeModel.editPartClass == null)
    //     throw "node type " + data.type + " invalid";
    nodeModel.props = data;
    return nodeModel;
};

/**
 * 控制器的API
 * @type {{}}
 */

$AGEF.EditPart = anra.gef.EditPart.extend({});