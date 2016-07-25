NodeEditPart = anra.gef.NodeEditPart.extend({
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            var b = this.model.getValue('bounds');
            if (b != null)
                this.figure.setBounds({x:b[0], y:b[1], width:b[2], height:b[3] });
        }
        this.figure.paint();
    },
    createLineEditPart:function () {
        return new MyLineEditPart();
    },
    createFigure:function () {
        return new MyFigure();
    },
    getSourceAnchor:function (line) {
        return {x:this.figure.fattr('x'), y:this.figure.fattr('y')};
    },
    getTargetAnchor:function (line) {
        return {x:this.figure.fattr('x') + 10, y:this.figure.fattr('y')+10};
    }

});

MyLineEditPart = anra.gef.LineEditPart.extend({
    getTargetAnchor:function () {
        var t = this.target;
        if (t != null)
            return t.getTargetAnchor(this);
        return {x:100, y:100};
    }
});

MyFigure = anra.gef.Figure.extend({
    createContent:function () {
        var e = new anra.svg.Ellipse();
        e.setBounds({
            x:10,
            y:20,
            width:20,
            height:18
        });
        this.addChild(e);
    }
});

MyEditor = anra.gef.Editor.extend({
    models:null,
    editParts:null,
    createEditPart:function (context, model) {
        if (this.editParts == null)
            this.editParts = new Map();
        var part = new NodeEditPart();
        part.model = model;
        this.editParts.set(model.id, part);
        return part;
    },
    handleInput:function (input) {
        this.models = new Map();
        var nodes = input['nodes'];
        var lines, nm, list, line, target;
        var targetCache = new Map();
        for (var i = 0; i < nodes.length; i++) {
            nm = new anra.gef.NodeModel();
            nm.setProperties(nodes[i]);
            lines = nodes[i]['lines'];
            if (lines != null)
                for (var inx = 0; inx < lines.length; inx++) {
                    line=lines[inx];
                    nm.addSourceLine(line);
                    //记录连线目标id
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
                for ( inx = 0; inx < list.length; inx++) {
                    nm.addTargetLine(list[inx]);
                }
                targetCache.remove(nodes[i].id);
            }
            this.models.set(nodes[i].id, nm);
        }

        targetCache = null;

        return input;
    },
    initRootEditPart:function (editPart) {
        editPart.modelChildren = this.models.values();
        editPart.refresh();
    }
})
;
