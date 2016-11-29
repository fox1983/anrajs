/**
 * Created with JetBrains WebStorm.
 * User: Hasee
 * Date: 16-11-7
 * Time: 下午4:14
 * To change this template use File | Settings | File Templates.
 */
/**/
SYSTEM = 0;
SEGMENT = 1;
BALANCE = 2;

FlowEditor = anra.gef.Editor.extend({
    editParts:null,
    background:'#FFFFFF',

    /**
     *第一步，把json输入解析为model
     *
     * @param input
     * @return {*}
     */
    input2model:function (input, rootModel) {
        var nodes = input['nodes'];
        var lines, nm, list, line, target;
        var targetCache = new Map();
        //遍历nodes，每个node生成一个节点模型（NodeModel）
        for (var i = 0; i < nodes.length; i++) {
            nm = new anra.gef.NodeModel();
            nm.id = nodes[i].id;
            //设置属性
            nm.setProperties(nodes[i]);
            lines = nodes[i]['lines'];

            /*--------开始添加连线---------*/
            //添加连线，根据连线定义来确定连线的source和target
            if (lines != null)
                for (var inx = 0; inx < lines.length; inx++) {
                    line = this.createLine(lines[inx]);
                    nm.addSourceLine(line);
                    //记录连线目标节点的id
                    list = targetCache.get(line.getValue('target'));
                    if (list == null) {
                        list = [];
                        targetCache.set(line.getValue('target'), list);
                    }
                    list.push(line);

                    target = rootModel.getChild(line.getValue('target'));
                    if (target != null)
                        target.addTargetLine(line);
                }
            list = targetCache.get(nodes[i].id);
            if (list != null) {
                for (inx = 0; inx < list.length; inx++) {
                    nm.addTargetLine(list[inx]);
                }
                targetCache.remove(nodes[i].id);
            }
            /*----------连线添加完毕-----------*/
            rootModel.addChild(nm);
        }
        //释放缓存
        targetCache = null;
    },
    /**
     * 第二步，根据context（前一个EditPart）和model（数据）生成EditPart（控制器）
     * @param context
     * @param model
     * @return {*}
     */
    createEditPart:function (context, model) {
        if (this.editParts == null)
            this.editParts = new Map();
        var part;
        /*根据type字段来确定节点类型*/
        var type = model.getValue('type');
        if (type == SYSTEM) {
            //创建系统EditPart
            part = new SystemEditPart();
        } else if (type == SEGMENT) {
            //创建网段EditPart
            part = new SegmentEditPart();
        }
        else if (type == BALANCE)
            part = new BalanceEditPart();

        part.model = model;
        this.editParts.put(model.id, part);
        return part;
    },
    addNode:function (json) {
        var node = new anra.gef.NodeModel();
        node.setProperties(json);
        node.id = json.id;

        var cmd = new anra.gef.CreateNodeCommand(this.rootEditPart, node);

        var lines = json['lines'];
        /*--------开始添加连线---------*/
        //添加连线，根据连线定义来确定连线的source和target
        if (lines != null)
            for (var inx = 0; inx < lines.length; inx++) {
                var line = this.createLine(lines[inx]);
                cmd = cmd.chain(new anra.gef.CreateLineCommand(this.rootEditPart, line, json.id, line.getValue('target')));
            }

        this.cmdStack.execute(cmd);
    },
    initRootEditPart:function (editPart) {
    },
    createLine:function (json) {
        var lineModel = new anra.gef.LineModel();
        lineModel.setProperties(json);
        lineModel.id = json.id;
        return lineModel;
    },
    getCustomPolicies:function () {
        this.put('layoutPolicy', new FlowLayoutPolicy());
    }
});


FlowLayoutPolicy = anra.gef.LayoutPolicy.extend({
    getLayoutEditParts:function (request) {
        var v = anra.gef.LayoutPolicy.prototype.getLayoutEditParts.call(this, request);
        if (v != null)
            return v;
        if (this.target != null) {
            //解析所有与target有关的editPart
            return this.target;
        }
        return null;
    },
    refreshFeedback:function (feedback, request) {
        if (feedback != null) {
            feedback.setBounds({x:request.event.x, y:request.event.y});
        }
    },
    createChildEditPolicy:function (child) {
        return new ChildPolicy(this);
    },
    eraseLayoutTargetFeedback:function (request) {
        anra.gef.LayoutPolicy.prototype.eraseLayoutTargetFeedback.call(this, request);
        this.target = null;
        this.layout();
    },
    layout:function () {
        var children = this.getHost().children;
        for (var i = 0, len = children.length; i < len; i++) {
//            var m = children[i].model;

        }
    },
    getMoveCommand:function (request) {
        if (this.target != null)
            return new anra.gef.RelocalCommand(this.target, {
                    x:this.target.getFigure().getBounds().x,
                    y:this.target.getFigure().getBounds().y
                },
                {
                    x:request.event.x,
                    y:request.event.y
                });
    },
    getCreateCommand:function (request) {
        var model = request.event.prop.drag.model;
        var b = model.getValue('bounds');
        model.setValue('bounds', [request.event.x, request.event.y, b[2], b[3]]);
        return new anra.gef.CreateNodeCommand(this.getHost().getRoot(), model);
    }
});

ChildPolicy = anra.gef.AbstractEditPolicy.extend({
    class:'ShadowPolicy',
    constructor:function (parent) {
        anra.gef.AbstractEditPolicy.prototype.constructor.call(this);
        this.parent = parent;
    },
    showTargetFeedback:function (request) {
        if (REQ_MOVE == request.type) {
            this.parent.target = this.getHost();
        }
    },
    eraseTargetFeedback:function (request) {
        if (REQ_MOVE == request.type) {
            this.parent.eraseTargetFeedback(request);
            this.parent.target = null;
        }
    },
    getCommand:function (request) {
    },
    getLayoutEditParts:function (request) {
        return null;
    }
});

/**
 * 节点EditPart父类，Editpart决定节点的图形、连线的控制器等
 * @type {*}
 */
CommonNodeEditPart = anra.gef.NodeEditPart.extend({
    /**
     * 用于同步model和figure。
     */
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            var b = this.model.getValue('bounds');
            this.figure.setBounds({x:b[0], y:b[1], width:b[2], height:b[3] });
        }
        this.figure.paint();
    },
    createLineEditPart:function () {
        return new CommonLineEditPart();
    },
    createDragTracker:function (request) {
        return new anra.gef.DragTracker();
    },
    createFigure:function () {
        var f = new CommonFigure();
        f.setUrl(this.getImage());
        return f;
    }
});

/*--------详细节点控制器定义--------*/
SystemEditPart = CommonNodeEditPart.extend({
    getImage:function () {
        return "system.png";
    },
    createEditPolicies:function () {
        this.installEditPolicy("asdfasfasdf", new TextInfoPolicy());
        this.installEditPolicy("selection", new anra.gef.ResizableEditPolicy());
    }
});
SegmentEditPart = CommonNodeEditPart.extend({
    getImage:function () {
        return "segment.png";
    },
    createEditPolicies:function () {
        this.installEditPolicy("selection", new anra.gef.ResizableEditPolicy());
    }
});
BalanceEditPart = CommonNodeEditPart.extend({
    getImage:function () {
        return "balance.png";
    }
});
/*-------详细节点控制器定义结束-------*/
/*-------策略------*/
TextInfoPolicy = anra.gef.AbstractEditPolicy.extend({
    handle:null,
    class:'TextInfoPolicy',
    activate:function () {
        this.handle = new TextHandle(this.getHost());
        this.handle.setText(this.getHost().model.getValue('name'));
        this.getHandleLayer().addChild(this.handle);

        var root = this.getHost().getRoot();
        this.handle.addListener(anra.EVENT.MouseUp, function (e) {
            //TODO
            var json = {id:10, name:'C2APP1', type:0, bounds:[330, 230, 60, 60], lines:[
                {id:0, target:2, sTML:1, tTML:1 }
            ]};
            root.editor.addNode(json);
            root.refresh();
        });
    },
    deactivate:function () {
        this.getHandleLayer().removeChild(this.handle);
    }
});

TextHandle = anra.Handle.extend(anra.svg.Text).extend({
    refreshLocation:function (figure) {
        if (this.owner == null || figure == null)
            return;
        this.owner.setAttribute('x', figure.fattr('x'));
        this.owner.setAttribute('y', figure.fattr('y') + figure.fattr('height') + 10);
    }

});


/**
 * 通用图形
 *
 * @type {*}
 */
CommonFigure = anra.gef.Figure.extend(anra.svg.Image).extend({
    getTargetAnchor:function (line) {
        return {x:this.fattr('x'), y:this.fattr('y') + this.fattr('height') / 2};
    },
    getSourceAnchor:function (line) {
        return {x:this.fattr('x') + this.fattr('width'), y:this.fattr('y') + this.fattr('height') / 2};
    }
});


/*-------连线定义------*/

CommonLineEditPart = anra.gef.LineEditPart.extend({
    doActive:function () {
    },
    refreshVisual:function () {
        this.figure.paint();
    },
    createFigure:function (model) {
        return new Line(this.model);
    }
});


Line = anra.gef.Line.extend({
        router:function (line) {
            if (line.points == null || line.points.length < 2)
                return null;
            var sp = line.getStartPoint(), ep = line.getEndPoint();

            var mid = (sp.x + ep.x) / 2;
            var p1 = {
                x:mid,
                y:sp.y
            };

            var p2 = {
                x:mid,
                y:ep.y
            };
            return  [sp, p1, p2, ep];
        },
        init:function (model) {
            anra.gef.Line.prototype.init.call(this, model);
        },
        createContent:function () {
            var marker = new anra.svg.TriangleMarker();
            marker.setId(this.model.hashCode());
            marker.setFigureAttribute({
                    fill:'white',
                    stroke:'black'}
            );
            this.setEndMarker(marker);

        },
        mouseIn:function () {
        },
        mouseOut:function () {
        },
        initProp:function () {
            this.setAttribute({
                stroke:'rgb(30,146,94)',
                fill:'none',
                'stroke-width':'2'
            });
        }
    }
);

