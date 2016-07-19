NodeEditPart = anra.gef.EditPart.extend({
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            var b = this.model['bounds'];
            if (b != null)
                this.figure.setBounds({x:b[0], y:b[1], width:b[2], height:b[3] });

        }
    },
    createFigure:function(){
        return
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
