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
    models:null,
    editParts:null,
    background:'#FFFFFF',

    /**
     *第一步，把json输入解析为model
     *
     * @param input
     * @return {*}
     */
    handleInput:function (input) {
        this.models = new Map();
        var nodes = input['nodes'];
        var lines, nm, list, line, target;
        var targetCache = new Map();
        //遍历nodes，每个node生成一个节点模型（NodeModel）
        for (var i = 0; i < nodes.length; i++) {
            nm = new anra.gef.NodeModel();
            //设置属性
            nm.setProperties(nodes[i]);
            lines = nodes[i]['lines'];

            /*--------开始添加连线---------*/
            //添加连线，根据连线定义来确定连线的source和target
            if (lines != null)
                for (var inx = 0; inx < lines.length; inx++) {
                    line = lines[inx];
                    nm.addSourceLine(line);
                    //记录连线目标节点的id
                    list = targetCache.get(line.target);
                    if (list == null) {
                        list = [];
                        targetCache.set(line.target, list);
                    }
                    list.push(line);

                    target = this.models.get(line.target);
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

            //把生成好的节点记录在 FlowEditor#models
            this.models.put(nodes[i].id, nm);
        }

        //释放缓存
        targetCache = null;

        return input;
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
    /**
     * 第三步，初始化RootEditPart，也就是把之前步骤里生成好的模型设置为rootEditPart的孩子。
     *如果要自定义RootEditPart，重写createRootEditPart方法即可。
     *
     * @param editPart
     */
    initRootEditPart:function (rootEditPart) {
        rootEditPart.modelChildren = this.models.values();
        rootEditPart.refresh();
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
            if (b != null)
                this.figure.setBounds({x:b[0], y:b[1], width:b[2], height:b[3] });
        }
        this.figure.paint();
    },
    createLineEditPart:function () {
        return new CommonLineEditPart();
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
    }
});
SegmentEditPart = CommonNodeEditPart.extend({
    getImage:function () {
        return "segment.png";
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
    activate:function () {
        this.handle = new TextHandle(this.getHost());
        this.handle.setText(this.getHost().model.getValue('name'));
        var handle = this.handle;
        this.getHostFigure().addListener(anra.EVENT.MouseDrag, function (e) {
            handle.refreshLocation(e);
        });
        this.getHost().getRoot().figure.addChild(this.handle);
    }
});

TextHandle = anra.Handle.extend(anra.svg.Text).extend({

});


/**
 * 通用图形
 *
 * @type {*}
 */
CommonFigure = anra.gef.Figure.extend(anra.svg.Image).extend({
    getTargetAnchor:function (line) {
        return {x:this.fattr('x'), y:this.fattr('y')};
    },
    getSourceAnchor:function (line) {
        return {x:this.fattr('x') + 10, y:this.fattr('y') + 5};
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
        return new Line(this.source);
    }
});

Line = anra.gef.Line.extend({
        init:function (source) {
            anra.gef.Line.prototype.init(source);
            this.source = source;
        },
        mouseIn:function () {
        },
        mouseOut:function () {
        },
        initProp:function () {
            this.setAttribute({
                stroke:'rgb(30,146,94)',
                'stroke-width':'1.5'
            });
        }
    }
);

