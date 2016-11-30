GRID = 0;
TARGET = 1;
SOURCE = 2;

AStarZoom = anra.gef.Editor.extend({
    editParts:null,
    background:'#FFFFFF',

    /**
     *第一步，把json输入解析为model
     *
     * @param input
     * @return {*}
     */
    input2model:function (input, rootModel) {
        var w = input.width ? input.width : 40;
        var hn = input.hnum ? input.hnum : 60;
        var vn = input.vnum ? input.vnum : 60;

        //背景墙
        for (var j = 0; j < vn; j++) {
            for (var i = 0; i < hn; i++) {
                var nm = new anra.gef.NodeModel();
                nm.id = i + '_' + j;
                nm.setValue('width', w);
                nm.setValue('x', i);
                nm.setValue('y', j);
                nm.setValue('type', GRID);
                nm.setValue('color', 'white');
                rootModel.addChild(nm);
            }
        }

        //开始节点
        nm = new anra.gef.NodeModel();
        nm.id = 'source';
        nm.setValue('x', 5);
        nm.setValue('y', 5);
        nm.setValue('width', w);
        nm.setValue('type', SOURCE);
        nm.setValue('color', 'red');
        rootModel.addChild(nm);
        this.source = nm;

        //结束节点
        nm = new anra.gef.NodeModel();
        nm.id = 'target';
        nm.setValue('x', 10);
        nm.setValue('y', 5);
        nm.setValue('width', w);
        nm.setValue('type', TARGET);
        nm.setValue('color', 'blue');
        this.target = nm;
        rootModel.addChild(nm);
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
        switch (type) {
            case GRID:
                part = new GridPart();
                break;
            case TARGET:
                part = new TargetPart();
                break;
            case SOURCE:
                part = new SourcePart();
                break;
            default:
                return null;
        }

        part.model = model;
        this.editParts.put(model.id, part);
        return part;
    },
    getCustomPolicies:function () {
//        this.put('layoutPolicy', new FlowLayoutPolicy());
    }
});


RectFigure = anra.gef.Figure.extend({
    constructor:function (color) {
        anra.gef.Figure.prototype.constructor.call(this);
    },
    initProp:function () {
        this.setAttribute({
            fill:this.model.getValue('color'),
            stroke:'black'
        });
    },
    getTargetAnchor:function (line) {
        return {x:this.fattr('x') + this.fattr('width') / 2, y:this.fattr('y') + this.fattr('height') / 2};
    },
    getSourceAnchor:function (line) {
        return {x:this.fattr('x') + this.fattr('width') / 2, y:this.fattr('y') + this.fattr('height') / 2};
    }
});

CommonPart = anra.gef.NodeEditPart.extend({
    /**
     * 用于同步model和figure。
     */
    refreshVisual:function () {
        var x = this.model.getValue('x');
        var y = this.model.getValue('y');
        var w = this.model.getValue('width');
        this.figure.setBounds({x:x * w, y:y * w, width:w, height:w});

        this.figure.setAttribute({
            fill:this.model.getValue('color')
        });
        this.figure.paint();
    },
    createDragTracker:function (request) {
        return null;
    },
    createFigure:function () {
        return new RectFigure();
    }
});

GridPart = CommonPart.extend({
    createEditPolicies:function () {
        this.installEditPolicy('drag', new ClickPolicy());
    }
});

SourcePart = CommonPart.extend({
    createDragTracker:function (request) {
        return new anra.gef.DragTracker();
    },
    createEditPolicies:function () {
        this.installEditPolicy('drag', new DragPolicy());
        this.installEditPolicy('addLine', new AddLinePolicy());
    },
    createLineEditPart:function () {
        return new CommonLineEditPart();
    }
});

TargetPart = CommonPart.extend({
    createDragTracker:function (request) {
        return new anra.gef.DragTracker();
    },
    createEditPolicies:function () {
        this.installEditPolicy('drag', new DragPolicy());
    },
    createLineEditPart:function () {
        return new CommonLineEditPart();
    }
});

CommonLineEditPart = anra.gef.LineEditPart.extend({
    createFigure:function () {
        var line = new anra.gef.Line();
        line.initProp = function () {
            this.setAttribute({
                'stroke-width':2,
                stroke:'black'
            });
        };
        line.router=function(l){
//            console.log(l.points);

            return l.points;
        };
        return line;
    }
});


/*--------------------Policy-----------------*/
DragPolicy = anra.gef.Policy.extend({
    showTargetFeedback:function (request) {
        if (REQ_MOVE == request.type) {
            var x = request.event.x;
            var y = request.event.y;
            var w = 50;

//            console.log(x,y);
            this.getHost().model.setValue('x', Math.floor(x / w));
            this.getHost().model.setValue('y', Math.floor(y / w));

            this.getHost().refresh();
        }
    },
    eraseTargetFeedback:function (request) {
        if (REQ_MOVE == request.type) {

        }
    }

});

ClickPolicy = anra.gef.Policy.extend({
    activate:function () {
        var ep = this.getHost();
        this.listener = function () {
            var color = ep.model.getValue('color');
            ep.model.setValue('color', color == 'white' ? 'gray' : 'white');
            ep.refresh();
        };
        this.getHost().figure.addListener(anra.EVENT.MouseUp, this.listener);
    },
    deactivate:function () {
        this.getHost().figure.removeListener(anra.EVENT.MouseUp, this.listener);
    }
});

AddLinePolicy = anra.gef.Policy.extend({
    activate:function () {
        var ep = this.getHost();
        this.listener = function () {
            var lineModel = new anra.gef.LineModel();
            lineModel.id = 'line';
            ep.editor.source.addSourceLine(lineModel);
            ep.editor.target.addTargetLine(lineModel);
            var t = ep.getRoot().getEditPart(ep.editor.target);
            var s = ep.getRoot().getEditPart(ep.editor.source);
            t.refresh();
            s.refresh();
        };
        this.getHost().figure.addListener(anra.EVENT.MouseUp, this.listener);
    },
    deactivate:function () {
        this.getHost().figure.removeListener(anra.EVENT.MouseUp, this.listener);
    }
});