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
        this._Control(); //调用父的构造函数
        this.editPart = editPart;
        this.direction = direction;
        var model = editPart.model;
        if (model != null) {
            var handle = this;
            // 当figure被拖动的时候,刷新handles
            editPart.figure.addListener(anra.EVENT.MouseDrag, function () {
                handle.setLocator(editPart.model.getBounds());
            });
            this.setLocator(model.getBounds());
            this.setStyle({
                'fill': '#000000'
            });
            var dt = this.getResizeTracker(direction);
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
        var cursorStyle = 'default';
        switch (this.direction) {
            //上三个
            case anra.Handle.NORTH_WEST:
                cursorStyle = 'nw-resize';
                break;
            case anra.Handle.NORTH:
                x += width / 2;
                cursorStyle = 'n-resize';
                break;
            case anra.Handle.NORTH_EAST:
                x += width;
                cursorStyle = 'ne-resize';
                break;
            //中两个
            case anra.Handle.WEST:
                y += height / 2;
                cursorStyle = 'w-resize';
                break;
            case anra.Handle.EAST:
                x += width;
                y += height / 2;
                cursorStyle = 'e-resize';
                break;
            //下三个
            case anra.Handle.SOUTH_WEST:
                y += height;
                cursorStyle = 'sw-resize';
                break;
            case anra.Handle.SOUTH:
                x += width / 2;
                y += height;
                cursorStyle = 's-resize';
                break;
            case anra.Handle.SOUTH_EAST:
                x += width;
                y += height;
                cursorStyle = 'se-resize';
                break;
            default :

        }
        this.setBounds({
            x: x,
            y: y,
            width: this.defaultWidth,
            height: this.defaultHeight
        });
        this.setStyle({
            'cursor': cursorStyle
        });
    },
    refreshLocation: function () {
        this.setLocator(this.editPart.model.getBounds());
    },
    getResizeTracker: function (direction) {
        var tracker = null;
        switch (direction) {
            case anra.Handle.NORTH_WEST:
                tracker = anra.gef.NorthWestTracker();
                break;
            case anra.Handle.NORTH:
                tracker = anra.gef.NorthTracker();
                break;
            case anra.Handle.NORTH_EAST:
                tracker = anra.gef.NorthEastTracker();
                break;

            case anra.Handle.WEST:
                tracker = anra.gef.WestTracker();
                break;
            case anra.Handle.EAST:
                tracker = anra.gef.EastTracker();
                break;

            case anra.Handle.SOUTH_WEST:
                tracker = anra.gef.SouthWestTracker();
                break;
            case anra.Handle.SOUTH:
                tracker = anra.gef.SouthTracker();
                break;
            case anra.Handle.SOUTH_EAST:
                tracker = anra.gef.SouthEastTracker();
                break;
            default :
                tracker = anra.gef.getResizeTracker();
        }
        return tracker;
    }
});
//定义方向常量
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
    }
});
anra.gef.NorthTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
    }
});
anra.gef.NorthEastTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
    }
});

anra.gef.WestTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.refresh();
    }
});
anra.gef.EastTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.refresh();
    }
});

anra.gef.SouthWestTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
    }
});
anra.gef.SouthTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
    }
});
anra.gef.SouthEastTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
    }
});
