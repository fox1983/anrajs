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
    editpart: null,
    dragTracker: null,
    constructor: function (figure, direction) {
        this._Control(); //调用父的构造函数
        //var figure =editpart.figure;
        if (figure != null) {
            var x;
            var y;
            var bounds = figure.getBounds();
            switch (direction) {
                case 'north':
                    x = bounds.x + bounds.width / 2 - this.offset;
                    y = bounds.y + this.offset * -1;
                    break;
                case 'south':
                    x = bounds.x + bounds.width / 2 - this.offset;
                    y = bounds.y + bounds.height - this.offset;
                    break;
                default :
                    x = 0;
                    y = 0;
            }
            this.setLocater(x, y);
            this.setStyle({
                'fill': '#000000'
            });
            var dt = this.createResizeTracker(figure, direction);
            this.addListener(anra.EVENT.MouseDown, function (e) {
                console.log("mouse down" + e.x + e.y);
                if (dt != null)
                    dt.mouseDown(e);
            });
            this.addListener(anra.EVENT.DragStart, function (e) {
                console.log("drag start" + e.x + e.y);
                if (dt != null)
                    dt.dragStart(e);
            });
            this.addListener(anra.EVENT.DragEnd, function (e) {
                console.log("Drag End" + e.x + e.y);
                if (dt != null)
                    dt.dragEnd(e);
            });
            this.addListener(anra.EVENT.MouseDrag, function (e) {
                console.log("mouse Drag" + e.x + e.y);
                if (dt != null)
                    dt.mouseDrag(e);
            });
            this.addListener(anra.EVENT.MouseUp, function (e) {
                console.log("mouse up" + e.x + e.y);
                if (dt != null)
                    dt.mouseUp(e);
            });
        }

    },
    createResizeTracker: function (owner, direction) {
        console.log("direction:" + direction);
        NorthTracker = anra.gef.ResizeTracker.extend(
            {
                dragStart: function (me, editPart) {
                    this.status = me.type;
                    this.oldSize = {width: owner.getBounds()[2], y: owner.getBounds()[3]};
                    this.xoffset = me.x - owner.model.getBounds()[0];
                    this.yoffset = me.y - owner.model.getBounds()[1];
                }
                ,
                mouseDrag: function (me, editPart) {
                    this.status = me.type;
                    editPart.model.getBounds()[0] = me.x - this.xoffset;
                    editPart.model.getBounds()[1] = me.y - this.yoffset;
                    editPart.refresh();
                }
                ,
                dragEnd: function (me, editPart) {
                    this.status = me.type;
                    editPart.editor.execute(new anra.gef.RelocalCommand(editPart, this.startLocation, {
                        x: editPart.model.getBounds()[0],
                        y: editPart.model.getBounds()[1]
                    }));
                }
            });
        return new NorthTracker();
    },
    setLocater: function (locX, locY) {
        this.setBounds({
            x: locX,
            y: locY,
            width: this.defaultWidth,
            height: this.defaultHeight
        });
        console.log("x:" + locX + ",y:" + locY);
    }
});
anra.gef.ResizeTracker = Base.extend({
    status: null,
    xOffset: 0,
    yOffset: 0,
    oldLocation: null,
    oldSize: null,
    mouseDown: function (me, editPart) {
        this.status = me.type;
    },
    dragStart: function (me, editPart) {
        this.status = me.type;
        this.startLocation = {x: editPart.model.getBounds()[0], y: editPart.model.getBounds()[1]};
        this.xoffset = me.x - editPart.model.getBounds()[0];
        this.yoffset = me.y - editPart.model.getBounds()[1];
    },
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = me.x - this.xoffset;
        editPart.model.getBounds()[1] = me.y - this.yoffset;
        editPart.refresh();
    },
    dragEnd: function (me, editPart) {
        this.status = me.type;
        editPart.editor.execute(new anra.gef.RelocalCommand(editPart, this.startLocation, {
            x: editPart.model.getBounds()[0],
            y: editPart.model.getBounds()[1]
        }));
    },
    mouseUp: function (me, editPart) {
        this.status = me.type;
    }
});
