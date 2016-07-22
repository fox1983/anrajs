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
        this.layoutManager = new anra.svg.GridLayout(2,false);

        var e = new anra.svg.Rect();   //Ellipse
        e.setBounds({

            width:15,
            height:18
        });

        e.layoutData=new anra.svg.GridData(this,e);

        this.addChild(e);


        var e1 = new anra.svg.Ellipse();
        e1.setBounds({

            width:11,
            height:30
        });

        this.addChild(e1);

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
