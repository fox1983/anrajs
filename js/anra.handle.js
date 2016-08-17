/**
 * Created by Administrator on 2016/8/9 0009.
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
        var x;
        var y;
        switch (this.direction) {
            case 'north':
                x = bounds[0] + bounds[2] / 2 - this.offset;
                y = bounds[1] + this.offset * -1;
                break;
            case 'south':
                x = bounds[0] + bounds[2] / 2 - this.offset;
                y = bounds[1] + bounds[3] - this.offset;
                break;
            default :
                x = 0;
                y = 0;
        }
        this.setBounds({
            x: x,
            y: y,
            width: this.defaultWidth,
            height: this.defaultHeight
        });
    },
    getResizeTracker: function (handle, editpart, direction) {
        var tracker = null;
        switch (direction) {
            case "south":
                tracker = new anra.gef.SouthTracker(handle);
                break;
            case "north":
                tracker = new anra.gef.NorthTracker(handle);
                break;
        }
        return tracker;
    }
});
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
anra.gef.SouthTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
        this.handle.setLocator(editPart.model.getBounds());
    }
});
anra.gef.NorthTracker = anra.gef.getResizeTracker.extend({
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        this.handle.setLocator(editPart.model.getBounds());
        editPart.refresh();
    }
});
