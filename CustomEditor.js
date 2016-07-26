NodeEditPart = anra.gef.EditPart.extend({
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            var b = this.model['bounds'];
            if (b != null){
                this.figure.setBounds({x:b[0], y:b[1], width:b[2], height:b[3] });
                this.figure.paint();
            }

        }
    },
    setModel:function (model) {
        this.model = model;
    },
    createFigure:function () {
        switch (this.model.type){
            case 0:
                return new Figure0();
            case 1:
                return new Figure1();
            case 2:
                return new Figure2();
            case 3:
                return new Figure3();
        }
    }
});


MyFigure = anra.gef.Figure.extend({

    createContent:function () {
        debugger
        this.layoutManager = new anra.svg.GridLayout(2,true, this);
        this.layoutManager.setNumRows(2);

        this.layoutManager.arg.marginLeft = 8;
        this.layoutManager.arg.marginRight = 8;
        this.layoutManager.arg.marginTop = 5;
        this.layoutManager.arg.marginBottom = 5;
        this.layoutManager.arg.verticalSpacing = 0;
        this.layoutManager.arg.horizontalSpacing = 0;

        //debugger
        var text = new anra.svg.Text();
        var t = "1221";
        text.setText(t);


        var idPart = new anra.svg.Rect();
        idPart.layoutData=new anra.svg.GridData(0, 12);
        idPart.layoutData.setColumns(2);
        idPart.layoutData.setRows(1);

        this.addChild(idPart);

        var namePart = new anra.svg.Ellipse();
        namePart.layoutData = new anra.svg.GridData(0,0);
        namePart.layoutData.setColumns(1);
        namePart.layoutData.setRows(1);
        this.addChild(namePart);

        var displayPart = new anra.svg.Ellipse();
        displayPart.layoutData = new anra.svg.GridData(0,0);
        displayPart.layoutData.setColumns(1);
        displayPart.layoutData.setRows(1);
        this.addChild(displayPart);

        this.customContent();

    },
    customContent:function(){}
});

//	#00DD00
Figure0=MyFigure.extend({
    customContent:function(){
        this.setAttribute('fill', '#00DD00');
    }
});

//#DDDDDD
Figure1=MyFigure.extend({
    customContent:function(){
        this.setAttribute('fill', '#DDDDDD');   //  color
    }
});

//#FF3333
Figure2=MyFigure.extend({
    customContent:function(){
        this.setAttribute('fill', '#FF3333');
    }
});

//#FFBB00
Figure3=MyFigure.extend({
    customContent:function(){

        this.setAttribute('fill', '#FFBB00');
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
