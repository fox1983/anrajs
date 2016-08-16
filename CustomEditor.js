NodeEditPart = anra.gef.NodeEditPart.extend({
    refreshVisual: function () {
        if (this.model != null && this.figure != null) {
            var b = this.model.getValue('bounds');
            if (b != null) {
                this.figure.setBounds({x: b[0], y: b[1], width: b[2], height: b[3]});
                this.figure.paint();
            }

        }
    },
    setModel: function (model) {
        this.model = model;
    },
    createFigure: function () {
        switch (this.model.getValue('type')) {
            case 0:
                return new Figure0();
            case 1:
                return new Figure1();
            case 2:
                return new Figure2();
            case 3:
                return new Figure3();
        }
    },
    setSelected: function (value) {
        this.selected = value;
        if (this.figure != null)
            this.figure.setSelected(value);
        this.addSelectionHandles();
    },
    addSelectionHandles: function () {
        var handleLayer = this.getRoot().getLayer("Handle_Layer");
        //handleLayer.removeAll();
        var northHandle = new anra.Handle(this.figure, 'north');
        var southHandle = new anra.Handle(this.figure, 'south');
        handleLayer.addChild(northHandle);
        handleLayer.addChild(southHandle);
    }
});


MyFigure = anra.gef.Figure.extend({

    createContent: function () {
        this.layoutManager = new anra.svg.GridLayout(2, true, this);
        this.layoutManager.setNumRows(2);

        this.layoutManager.arg.marginLeft = 8;
        this.layoutManager.arg.marginRight = 8;
        this.layoutManager.arg.marginTop = 5;
        this.layoutManager.arg.marginBottom = 5;
        this.layoutManager.arg.verticalSpacing = 0;
        this.layoutManager.arg.horizontalSpacing = 0;


        var idPart = new anra.svg.Rect();
        idPart.layoutData = new anra.svg.GridData(0, 12);
        idPart.layoutData.spanCol = 2;
        idPart.layoutData.spanRow = 1;

        this.addChild(idPart);

        var namePart = new anra.svg.Ellipse();
        namePart.layoutData = new anra.svg.GridData(0, 0);
        namePart.layoutData.spanCol = 1;
        namePart.layoutData.spanRow = 1;
        this.addChild(namePart);

        var displayPart = new anra.svg.Ellipse();
        displayPart.layoutData = new anra.svg.GridData(0, 0);
        displayPart.layoutData.spanCol = 1;
        displayPart.layoutData.spanRow = 1;
        this.addChild(displayPart);

        this.customContent();

    },
    customContent: function () {
    }
});

//	#00DD00
Figure0 = MyFigure.extend({
    customContent: function () {
        this.setAttribute('fill', '#00DD00');
    }
});

//#DDDDDD
Figure1 = MyFigure.extend({
    customContent: function () {
        this.setAttribute('fill', '#DDDDDD');   //  color
    }
});

//#FF3333
Figure2 = MyFigure.extend({
    customContent: function () {
        this.setAttribute('fill', '#FF3333');
    }
});

//#FFBB00
Figure3 = MyFigure.extend({
    customContent: function () {

        this.setAttribute('fill', '#FFBB00');
    }
});


MyEditor = anra.gef.Editor.extend({
    createEditPart: function (context, model) {
        var part = new NodeEditPart();
        part.model = model;
        return part;
    },
    initRootEditPart: function (editPart) {

        editPart.modelChildren = this.models.values();
        editPart.refresh();
    },
    handleInput: function (input) {
        this.models = new Map();
        var nodes = input['nodes'];
        for (var i = 0; i < nodes.length; i++) {
            nm = new anra.gef.NodeModel();
            nm.setProperties(nodes[i]);
            this.models.set(nodes[i].id, nm);
        }
        return input;
    }
});
