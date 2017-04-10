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
                nm.set('width', w);
                nm.set('x', i);
                nm.set('y', j);
                nm.set('type', GRID);
                nm.set('color', 'white');
                nm.editPartClass = GridPart;
                rootModel.addChild(nm);
            }
        }

        //开始节点
        nm = new anra.gef.NodeModel();
        nm.id = 'source';
        nm.set('x', 5);
        nm.set('y', 5);
        nm.set('width', w);
        nm.set('type', SOURCE);
        nm.set('color', 'red');
        nm.editPartClass = SourcePart;
        rootModel.addChild(nm);
        this.source = nm;

        //结束节点
        nm = new anra.gef.NodeModel();
        nm.id = 'target';
        nm.set('x', 10);
        nm.set('y', 5);
        nm.set('width', w);
        nm.set('type', TARGET);
        nm.set('color', 'blue');
        nm.editPartClass = TargetPart;
        this.target = nm;
        rootModel.addChild(nm);
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
            fill:this.model.get('color'),
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
        var x = this.model.get('x');
        var y = this.model.get('y');
        var w = this.model.get('width');
        this.figure.setBounds({x:x * w, y:y * w, width:w, height:w});

        this.figure.setAttribute({
            fill:this.model.get('color')
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
        this.installPolicies({
            'drag':DragPolicy,
            'addLine':AddLinePolicy
        });
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
        this.installEditPolicy('removeLine', new RemoveLinePolicy());

        this.installPolicies({drag:DragPolicy,
            removeLine:RemoveLinePolicy});
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
        line.router = function (l) {
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
            this.getHost().model.set('x', Math.floor(x / w));
            this.getHost().model.set('y', Math.floor(y / w));

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
//            var color = ep.model.get('color');
//            ep.model.set('color', color == 'white' ? 'gray' : 'white');
//            ep.refresh();

            var rootModel = ep.getRoot().model;
            var model = ep.model;

            console.log(rootModel.children.remove(model.id))

            ep.getRoot().refresh();
        };
        this.getHost().figure.on(anra.EVENT.MouseDown, this.listener);
    },
    deactivate:function () {
        this.getHost().figure.off(anra.EVENT.MouseDown, this.listener);
    }
});


RemoveLinePolicy = anra.gef.Policy.extend({
    activate:function () {
        var ep = this.getHost();
        this.listener = function () {
            var line = ep.model.getTargetLine('line');
            var linePart = ep.getRoot().getEditPart(line);
            linePart.unregister();
        };
        this.getHost().figure.on(anra.EVENT.MouseUp, this.listener);
    },
    deactivate:function () {
        this.getHost().figure.off(anra.EVENT.MouseUp, this.listener);
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
            s.refresh();
            t.refresh();
        };
        this.getHost().figure.on(anra.EVENT.MouseUp, this.listener);
    },
    deactivate:function () {
        this.getHost().figure.off(anra.EVENT.MouseUp, this.listener);
    }
});