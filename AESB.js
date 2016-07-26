CORE = 3317;
NORMAL = 0;
WARNING = 1;
ERROR = 2;

NodeEditPart = anra.gef.NodeEditPart.extend({
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            var b = this.model.getValue('bounds');
            if (b != null)
                this.figure.setBounds({x:b[0], y:b[1] });
        }
        this.figure.paint();
    },
    createLineEditPart:function () {
        return new AESBLineEditPart();
    },
    createFigure:function () {
        return new NodeFigure();
    }

});

CoreEditPart = anra.gef.NodeEditPart.extend({
    getDragTracker:function () {
        return null;
    },
    createLineEditPart:function () {
        return new AESBLineEditPart();
    },
    createFigure:function () {
        return new CoreFigure();
    }
});

AESBLineEditPart = anra.gef.LineEditPart.extend({
    doActive:function () {
    },
    getTargetAnchor:function () {
        var t = this.target;
        if (t != null)
            return t.getTargetAnchor(this);
        return {x:100, y:100};
    },
    refreshVisual:function () {
        this.figure.paint();
    },
    createFigure:function (model) {
        return new AESBLine(this.source);
    }
});

AESBLine = anra.gef.Line.extend({
        constructor:function (source) {
            this._Line();
            this.source = source;
        },
        mouseIn:function () {
        },
        mouseOut:function () {
        },
        initProp:function () {
            var type;
            switch (this.source.model.getValue('type')) {
                case NORMAL:
                    type = 'rgb(30,146,94)';
                    break;
                case WARNING:
                    type = 'rgb(160,182,32)';
                    break;
                case ERROR:
                    type = 'rgb(151,37,25)';
                    break;
            }
            ;

            this.setAttribute({
                stroke:type,
                'stroke-width':'1.5'
            });
        }
    }
);

CoreFigure = anra.gef.Figure.extend({
    x:null,
    y:null,
    initProp:function () {
        this.setAttribute({
            'fill-opacity':0.8,
            'fill':'#1E78A0'
        });
        this.setBounds({
            x:500, y:600, width:180, height:80
        });
    },
    getTargetAnchor:function (line) {
        if (this.x == null) {
            this.x = this.fattr('x') + this.fattr('width') / 2
        }
        if (this.y == null) {
            this.y = this.fattr('y') + this.fattr('height') / 2
        }
        return {x:this.x, y:this.y};
    }
});

NodeFigure = anra.gef.Figure.extend({
    tagName:'circle',
    createContent:function () {
        var e = new anra.svg.Circle();
        e.initProp = function () {
            e.setAttribute({
                'fill-opacity':0.4,
                'fill':'#1E78A0'
            });
        };
        var w = this.bounds.width;
        var w1 = w * 0.75;
        var r1 = (w - w1) / 2;
        e.setBounds({
            x:r1,
            y:r1,
            width:w1,
            height:w1
        });

        this.addChild(e);
        e = new anra.svg.Circle();
        e.initProp = function () {
            e.setAttribute({
                'fill-opacity':1,
                'fill':'#1E78A0'
            });
        };
        w1 = w * 0.65;
        r1 = (w - w1) / 2;
        e.setBounds({
            x:r1,
            y:r1,
            width:w1,
            height:w1
        });

        this.addChild(e);

        var text = new anra.svg.Text();
        text.setText(413);
        this.addChild(text);
        text.setAttribute({
            fill:'rgb(162,136,60)'
        });
        this.num1 = text;

        text = new anra.svg.Text();
        text.setText(134);
        this.addChild(text);
        text.setAttribute({
            fill:'rgb(29,136,90)'
        });
        this.num2 = text;

        this.layoutManager = new NodeLayout();
    },
    initProp:function () {
        this.setAttribute({
            'fill-opacity':0.2,
            'fill':'#1E78A0'
        });
    },
    mouseIn:function () {
    },
    mouseOut:function () {
    },
    setSelected:function (s) {

    },
    getSourceAnchor:function (line) {
        return {x:this.fattr('cx'), y:this.fattr('cy')};
    },
    getTargetAnchor:function (line) {
        return {x:this.fattr('cx'), y:this.fattr('cy')};
    },
    getClientArea:function () {
        return [this.fattr('cx') - this.fattr('r'), this.fattr('cy') - this.fattr('r'), this.fattr['r'] * 2];
    },
    applyBounds:function () {
        var l = this.locArea();
        var r = this.bounds.width / 2;
        this.setAttribute({
            r:r,
            cx:this.bounds.x + r + l[0],
            cy:this.bounds.y + r + l[1]
        });
    }
});
var CORE_EDIT_PART;

NodeLayout = anra.svg.Layout.extend({
    layout:function (p) {
        if (CORE_EDIT_PART != null) {
            var x1 = p.fattr('cx');
            var y1 = p.fattr('cy');
            var r1 = p.fattr('r');
            var x0 = CORE_EDIT_PART.figure.x;
            var y0 = CORE_EDIT_PART.figure.y;
            var r0 = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            var result = intersection(x0, y0, r0, x1, y1, r1);
//
            p.num1.owner.setAttribute('x',result[0]);
            p.num1.owner.setAttribute('y',result[2]);


            p.num2.owner.setAttribute('x',result[1]);
            p.num2.owner.setAttribute('y',result[3]);

//            p.num2.setBounds({
//                x:result[1],
//                y:result[3]
//            });

        }
//        console.log(p.num1);
    }
});

MyEditor = anra.gef.Editor.extend({
    models:null,
    editParts:null,
    background:'#191919',
    createEditPart:function (context, model) {
        if (this.editParts == null)
            this.editParts = new Map();

        var part;
        if (model.getValue('type') == CORE) {
            part = new CoreEditPart();
            CORE_EDIT_PART = part;
        } else
            part = new NodeEditPart();
        part.model = model;
        this.editParts.set(model.id, part);
        return part;
    },
    handleInput:function (input) {
        this.models = new Map();
        var nodes = input['nodes'];

        var coreModel = new anra.gef.NodeModel();
        coreModel.setProperties({
            id:0,
            type:CORE
        });
        this.models.set(coreModel.id, coreModel);
        for (var i = 0; i < nodes.length; i++) {
            nm = new anra.gef.NodeModel();
            nm.setProperties(nodes[i]);

            var line = {};
            nm.addSourceLine(line);
            coreModel.addTargetLine(line);

            this.models.set(nodes[i].id, nm);
        }
        return input;
    },
    initRootEditPart:function (editPart) {
        editPart.modelChildren = this.models.values();
        editPart.refresh();
    }
});
