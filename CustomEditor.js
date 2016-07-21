NodeEditPart = anra.gef.EditPart.extend({
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            var b = this.model['bounds'];
            if (b != null)
                this.figure.setBounds({x:b[0], y:b[1], width:b[2], height:b[3] });
        }
    },
    createFigure:function () {
        return new MyFigure();
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
    createEditPart:function (context, model) {
        var part = new NodeEditPart();
        part.model = model;
        return part;
    },
    initRootEditPart:function (editPart) {
        editPart.modelChildren = this.input['nodes'];
        editPart.refresh();
    }
});
