/**
 * Created by weiyajun on 2016/8/9 0009.
 */
var Control = anra.svg.Control;
anra.Handle = Control.extend({
    //const
    defaultWidth: 4,
    defaultHeight: 4,
    offset: 2,
    //data
    editPart: null,
    direction: null,
    constructor: function (editPart, direction) {
        this._Control(); //���ø��Ĺ��캯��
        this.editPart = editPart;
        this.direction = direction;
        var model = editPart.model;
        if (model != null) {
            var handle = this;
            editPart.figure.addListener(anra.EVENT.MouseDrag, function () {
                handle.setLocator(editPart.model.getBounds());
            });
            this.setLocator(model.getBounds());
            this.setStyle({
                'fill': '#000000'
            });
            var dt = this.getResizeTracker(this, editPart, direction);
            this.addListener(anra.EVENT.MouseDown, function (e) {
                console.log("mouse down" + e.x + e.y);
                if (dt != null)
                    dt.mouseDown(e, editPart);
            });
            this.addListener(anra.EVENT.DragStart, function (e) {
                console.log("drag start" + e.x + e.y);
                if (dt != null)
                    dt.dragStart(e, editPart);
            });
            this.addListener(anra.EVENT.DragEnd, function (e) {
                console.log("Drag End" + e.x + e.y);
                if (dt != null)
                    dt.dragEnd(e, editPart);
            });
            this.addListener(anra.EVENT.MouseDrag, function (e) {
                console.log("mouse Drag" + e.x + e.y);
                if (dt != null)
                    dt.mouseDrag(e, editPart);
            });
            this.addListener(anra.EVENT.MouseUp, function (e) {
                console.log("mouse up" + e.x + e.y);
                if (dt != null)
                    dt.mouseUp(e, editPart);
            });
        }

    },

    setLocator: function (bounds) {
        var width = bounds[2];
        var height = bounds[3];
        var x = bounds[0] - this.offset;
        var y = bounds[1] - this.offset;
        switch (this.direction) {
            //�����
            case anra.Handle.NORTH_WEST:
                break;
            case anra.Handle.NORTH:
                x += width / 2;
                break;
            case anra.Handle.NORTH_EAST:
                x += width;
                break;
            //������
            case anra.Handle.WEST:
                y += height / 2;
                break;
            case anra.Handle.EAST:
                x += width;
                y += height / 2;
                break;
            //�����
            case anra.Handle.SOUTH_WEST:
                y += height;
                break;
            case anra.Handle.SOUTH:
                x += width / 2;
                y += height;
                break;
            case anra.Handle.SOUTH_EAST:
                x += width;
                y += height;
                break;
            default :

        }
        this.setBounds({
            x: x,
            y: y,
            width: this.defaultWidth,
            height: this.defaultHeight
        });
    },
    refreshLocation: function () {
        this.setLocator(this.editPart.model.getBounds());
    },
    getResizeTracker: function (handle, editpart, direction) {
        var tracker = null;
        switch (direction) {
            case anra.Handle.NORTH_WEST:
                tracker = new anra.gef.NorthWestTracker(handle);
                break;
            case anra.Handle.NORTH:
                tracker = new anra.gef.NorthTracker(handle);
                break;
            case anra.Handle.NORTH_EAST:
                tracker = new anra.gef.NorthEastTracker(handle);
                break;

            case anra.Handle.WEST:
                tracker = new anra.gef.WestTracker(handle);
                break;
            case anra.Handle.EAST:
                tracker = new anra.gef.EastTracker(handle);
                break;


            case anra.Handle.SOUTH_WEST:
                tracker = new anra.gef.SouthWestTracker(handle);
                break;
            case anra.Handle.SOUTH:
                tracker = new anra.gef.SouthTracker(handle);
                break;
            case anra.Handle.SOUTH_EAST:
                tracker = new anra.gef.SouthEastTracker(handle);
                break;
            default :
        }
        return tracker;
    }
});
//���巽����
anra.Handle.NORTH = "north";
anra.Handle.SOUTH = "south";
anra.Handle.EAST = "east";
anra.Handle.WEST = "west";
anra.Handle.NORTH_EAST = "northeast";
anra.Handle.NORTH_WEST = "northwest";
anra.Handle.SOUTH_EAST = "southeast";
anra.Handle.SOUTH_WEST = "southwest";

anra.gef.getResizeTracker = Base.extend({
    status: null,
    xStart: 0,
    yStart: 0,
    oldConstraint: null,
    handle: null,
    constructor: function (handle) {
        this.handle = handle;
    },
    mouseDown: function (me, editPart) {
        this.status = me.type;
    },
    dragStart: function (me, editPart) {
        this.status = me.type;
        this.xStart = me.x;
        this.yStart = me.y;
        this.oldConstraint = {
            x: editPart.model.getBounds()[0],
            y: editPart.model.getBounds()[1],
            width: editPart.model.getBounds()[2],
            height: editPart.model.getBounds()[3]
        };

    },
    dragEnd: function (me, editPart) {
        this.status = me.type;
        editPart.editor.execute(new anra.gef.RelocalCommand(editPart, this.oldConstraint, {
            x: editPart.model.getBounds()[0],
            y: editPart.model.getBounds()[1],
            width: editPart.model.getBounds()[2],
            height: editPart.model.getBounds()[3]
        }));
    },
    mouseUp: function (me, editPart) {
        this.status = me.type;
    }
})
;
anra.gef.NorthWestTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});
anra.gef.NorthTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});
anra.gef.NorthEastTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});

anra.gef.WestTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});
anra.gef.EastTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});

anra.gef.SouthWestTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});
anra.gef.SouthTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});
anra.gef.SouthEastTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
        editPart.getRoot().getLayer("Handle_Layer").paint();
    }
});
