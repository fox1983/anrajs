/**
 * EditPart
 */

/*地图节点EditPart*/
CommonNodeEditPart = anra.gef.NodeEditPart.extend({
    refreshVisual: function () {
        var x = this.model.getValue('x'),
            y = this.model.getValue('y'),
            w = this.model.getValue('width');
        this.figure.setBounds({
            x: x * w,
            y: y * w,
            width: w,
            height: w
        });
        this.figure.paint();
    },

    createDragTracker: function () {
        return null;
    },

    createFigure: function () {
        return new RectFigure();
    }
});

/*线EditPart*/
CommonLineEditPart = anra.gef.LineEditPart.extend({
    createFigure: function () {
        var line = new CommonLine(this.model);
        var rp = this;

        line.router = function (l) {

            if (!this.isLine(l))
                return null;
            
            return rp.model.getValue('route');
        };
        return line;
    }
});

/*障碍EditPart*/
WallPart = CommonNodeEditPart.extend({
    createEditPolicies: function () {
        this.installEditPolicy('clickDestroy', new ClickDestroyPolicy());
    },
    createFigure: function () {
        return new RectFigure();
    }
});

/*起点EditPart*/
SourcePart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.RootDragTracker();
    },

    createEditPolicies: function () {
        this.installEditPolicy('drag', new DragPolicy());
        this.installEditPolicy('router', new RouterPolicy());
    },
    createLineEditPart: function () {
        return new CommonLineEditPart();
    }
});

/*终点EditPart*/
TargetPart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.RootDragTracker();
    },

    createEditPolicies: function () {
        this.installEditPolicy('drag', new DragPolicy());
        this.installEditPolicy('destroy', new DestroyRouterPolicy());
    },

    createLineEditPart: function () {
        return new CommonLineEditPart();
    }
});