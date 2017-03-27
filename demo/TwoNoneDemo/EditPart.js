CommonNodeEditPart = anra.gef.NodeEditPart.extend({
    refreshVisual: function () {
        var bounds = this.model.getValue('bounds');
        
        //约束移动
        var x = Math.floor(bounds[0]/bounds[2])*bounds[2],
            y = Math.floor(bounds[1]/bounds[3])*bounds[3];
        this.figure.setBounds({x:x, y:y, width:bounds[2], height:bounds[3]});
        bounds[0] = x; bounds[1] = y;
        this.model.setValue('bounds', bounds);
        
        this.figure.setAttribute({
            fill: this.model.getValue('color'),
            stroke: this.model.getValue('stroke')
        });
        this.figure.paint();
    },
    createDragTracker: function () {
        //return new anra.gef.DragTracker();
        return null;
    },
    createFigure: function () {
        return new RectFigure();
    }
});


StartEditPart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        return new anra.gef.RootDragTracker();
    },

    createEditPolicies: function () {
        this.installEditPolicy("selection", new anra.gef.ResizableEditPolicy());
        //this.installEditPolicy('router', new RouterPolicy());
    },
    createLineEditPart: function () {
        //return new CommonLineEditPart();
    }
});

EndEditPart = CommonNodeEditPart.extend({
    createDragTracker: function (request) {
        //return new anra.gef.RootDragTracker();
        return null;
    },
    createEditPolicies: function () {
        //this.installEditPolicy('destroy', new DestroyRouterPolicy());
        this.installEditPolicy("selection", new anra.gef.ResizableEditPolicy());
    },
    createLineEditPart: function () {
        //return new CommonLineEditPart();
    }
});

PlanNodeEditPart = CommonNodeEditPart.extend({
    refreshVisual: function () {
        var bounds = this.model.getValue('bounds');
        
        //约束移动
        var x = Math.floor(bounds[0]/bounds[2])*bounds[2],
            y = Math.floor(bounds[1]/bounds[3])*bounds[3];
        this.figure.setBounds({x:x, y:y, width:bounds[2], height:bounds[3]});
        bounds[0] = x; bounds[1] = y;
        this.model.setValue('bounds', bounds);
        
        this.figure.setAttribute({
            fill: this.model.getValue('color'),
            stroke: this.model.getValue('stroke')
        });
        this.figure.paint();
    },
});

StartPlanEditPart = PlanNodeEditPart.extend({
    createDragTracker: function (request) {
        //return new anra.gef.RootDragTracker();
        return null;
    },
    createEditPolicies: function () {
        //this.installEditPolicy('destroy', new DestroyRouterPolicy());
        this.installEditPolicy("selection", new anra.gef.ResizableEditPolicy());
    },
    createLineEditPart: function () {
        //return new CommonLineEditPart();
    }
});

EndPlanEditPart = PlanNodeEditPart.extend({
        createDragTracker: function (request) {
        //return new anra.gef.RootDragTracker();
        return null;
    },
    createEditPolicies: function () {
        //this.installEditPolicy('destroy', new DestroyRouterPolicy());
        this.installEditPolicy("selection", new anra.gef.ResizableEditPolicy());
    },
    createLineEditPart: function () {
        //return new CommonLineEditPart();
    }
});

WallEditPart = CommonNodeEditPart.extend({
    
});
