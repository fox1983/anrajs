/**
 * Created by weiyajun on 2016/8/9 0009.
 */
var Control = anra.svg.Control;
anra.Handle = Control.extend({
    //const
    defaultWidth:4,
    defaultHeight:4,
    offset:2,
    //data
    editPart:null,
    direction:null,
    constructor:function (editPart, direction) {
        this._Control(); //���ø��Ĺ��캯��
        this.editPart = editPart;
        this.direction = direction;
        var model = editPart.model;
        if (model != null) {
            var handle = this;
            // ��figure���϶���ʱ��,ˢ��handles
            editPart.figure.addListener(anra.EVENT.MouseDrag, function () {
                handle.setLocator(editPart.model.getBounds());
            });
            this.setLocator(model.getBounds());
            this.setStyle({
                'stroke':'#000000'
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
                console.log("mouse Drag" + e.x + e.y, direction, dt);
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

    setLocator:function (bounds) {
        var width = bounds[2];
        var height = bounds[3];
        var x = bounds[0] - this.offset;
        var y = bounds[1] - this.offset;
        var cursorStyle;

        cursorStyle = this.direction + '-resize';
        if (this.direction.search('e') != -1) {
            x += width;
        }
        if (this.direction.search('(w|e)') == -1) {
            x += width / 2;
        }
        if (this.direction.search('s') != -1) {
            y += height;
        }
        if (this.direction.search('(n|s)') == -1) {
            y += height / 2;
        }
        this.setBounds({
            x:x,
            y:y,
            width:this.defaultWidth,
            height:this.defaultHeight
        });
        this.setStyle({
            'cursor':cursorStyle
        });
    },
    refreshLocation:function () {
        this.setLocator(this.editPart.model.getBounds());
    },
    getResizeTracker:function (direction) {
        return  anra.gef.ResizeTracker.getInstance(direction);
    }
});
//���巽����
anra.Handle.NORTH = "n";
anra.Handle.SOUTH = "s";
anra.Handle.EAST = "e";
anra.Handle.WEST = "w";
anra.Handle.NORTH_EAST = "ne";
anra.Handle.NORTH_WEST = "nw";
anra.Handle.SOUTH_EAST = "se";
anra.Handle.SOUTH_WEST = "sw";

anra.gef.ResizeTracker = Base.extend({
    status:null,
    xStart:0,
    yStart:0,
    oldConstraint:null,
    mouseDown:function (me, editPart) {
        this.status = me.type;
    },
    dragStart:function (me, editPart) {
        this.status = me.type;
        this.xStart = me.x;
        this.yStart = me.y;
        this.oldConstraint = {
            x:editPart.model.getBounds()[0],
            y:editPart.model.getBounds()[1],
            width:editPart.model.getBounds()[2],
            height:editPart.model.getBounds()[3]
        };

    },
    dragEnd:function (me, editPart) {
        this.status = me.type;
        editPart.editor.execute(new anra.gef.RelocalCommand(editPart, this.oldConstraint, {
            x:editPart.model.getBounds()[0],
            y:editPart.model.getBounds()[1],
            width:editPart.model.getBounds()[2],
            height:editPart.model.getBounds()[3]
        }));
    },
    mouseUp:function (me, editPart) {
        this.status = me.type;
    }
});

anra.gef.ResizeTracker.getInstance = function (direction) {
    var tracker = trackPool.get(direction);
    if (tracker == null)
        return new anra.gef.ResizeTracker();
    return tracker;
}


anra.gef.NorthWestTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
    }
});
anra.gef.NorthTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
    }
});
anra.gef.NorthEastTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[1] = this.oldConstraint.y + (me.y - this.yStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height - (me.y - this.yStart);
        editPart.refresh();
    }
});

anra.gef.WestTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.refresh();
    }
});
anra.gef.EastTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.refresh();
    }
});

anra.gef.SouthWestTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = this.oldConstraint.x + (me.x - this.xStart);
        editPart.model.getBounds()[2] = this.oldConstraint.width - (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
    }
});
anra.gef.SouthTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
    }
});
anra.gef.SouthEastTracker = anra.gef.ResizeTracker.extend({
    mouseDrag:function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[2] = this.oldConstraint.width + (me.x - this.xStart);
        editPart.model.getBounds()[3] = this.oldConstraint.height + (me.y - this.yStart);
        editPart.refresh();
    }
});


var trackPool = new Map();
trackPool.put(anra.Handle.NORTH, new anra.gef.NorthTracker());
trackPool.put(anra.Handle.SOUTH, new anra.gef.SouthTracker());
trackPool.put(anra.Handle.SOUTH_EAST, new anra.gef.SouthEastTracker());
trackPool.put(anra.Handle.SOUTH_WEST, new anra.gef.SouthWestTracker());
trackPool.put(anra.Handle.NORTH_WEST, new anra.gef.NorthWestTracker());
trackPool.put(anra.Handle.NORTH_EAST, new anra.gef.NorthEastTracker());
trackPool.put(anra.Handle.EAST, new anra.gef.EastTracker());
trackPool.put(anra.Handle.WEST, new anra.gef.WestTracker());