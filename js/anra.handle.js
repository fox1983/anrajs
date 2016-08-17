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
    constructor: function (editpart, direction) {
        this._Control(); //调用父的构造函数
        var figure = editpart.figure;
        if (figure != null) {
            this.setLocater(this.getLocation(figure, direction));
            this.setStyle({
                'fill': '#000000'
            });
            var dt = this.createResizeTracker(this, editpart, direction);
            this.addListener(anra.EVENT.MouseDown, function (e) {
                console.log("mouse down" + e.x + e.y);
                if (dt != null)
                    dt.mouseDown(e, editpart);
            });
            this.addListener(anra.EVENT.DragStart, function (e) {
                console.log("drag start" + e.x + e.y);
                if (dt != null)
                    dt.dragStart(e, editpart);
            });
            this.addListener(anra.EVENT.DragEnd, function (e) {
                console.log("Drag End" + e.x + e.y);
                if (dt != null)
                    dt.dragEnd(e, editpart);
            });
            this.addListener(anra.EVENT.MouseDrag, function (e) {
                console.log("mouse Drag" + e.x + e.y);
                if (dt != null)
                    dt.mouseDrag(e, editpart);
            });
            this.addListener(anra.EVENT.MouseUp, function (e) {
                console.log("mouse up" + e.x + e.y);
                if (dt != null)
                    dt.mouseUp(e, editpart);
            });
        }

    },
    createResizeTracker: function (handle, editpart, direction) {
        console.log("direction:" + direction);
        SouthTracker = anra.gef.ResizeTracker.extend(
            {
                dragStart: function (me, editpart) {
                    this.status = me.type;
                    //this.yOffset = me.y- editpart.model.getBounds()[1];
                    this.heightOffset = me.y - editpart.model.getBounds()[3];
                }
                ,
                mouseDrag: function (me, editPart) {
                    this.status = me.type;
                    //editPart.model.getBounds()[1] = me.y - this.yOffset;
                    editPart.model.getBounds()[3] = me.y - this.heightOffset;
                    var bounds = editPart.model.getBounds();
                    handle.setLocater({x: bounds[0] + bounds[2] / 2 - 2, y: bounds[1] + bounds[3] - 2});
                    editpart.refresh();
                },
                dragEnd: function (me, editPart) {
                    this.status = me.type;
                    editPart.editor.execute(new anra.gef.ConstraintCommand(editPart, null, {
                        x: editPart.model.getBounds()[0],
                        y: editPart.model.getBounds()[1],
                        width: editpart.model.getBounds()[2],
                        height: editpart.model.getBounds()[3]
                    }));
                }
            });
        return new SouthTracker();
    },
    getLocation: function (figure, direction) {
        var location = {x: 0, y: 0};
        var bounds = figure.getBounds();
        switch (direction) {
            case 'north':
                location.x = bounds.x + bounds.width / 2 - this.offset;
                location.y = bounds.y + this.offset * -1;
                break;
            case 'south':
                location.x = bounds.x + bounds.width / 2 - this.offset;
                location.y = bounds.y + bounds.height - this.offset;
                break;
            default :
                x = 0;
                y = 0;
        }
        return location;
    },
    setLocater: function (location) {
        this.setBounds({
            x: location.x,
            y: location.y,
            width: this.defaultWidth,
            height: this.defaultHeight
        });
        console.log("x:" + location.x + ",y:" + location.y);
    }
});
anra.gef.ResizeTracker = Base.extend({
    status: null,
    xOffset: 0,
    yOffset: 0,
    widOffset: 0,
    heightOffset: 0,
    oldLocation: null,
    oldSize: null,
    mouseDown: function (me, editPart) {
        this.status = me.type;
    },
    dragStart: function (me, editPart) {
        this.status = me.type;
        this.startLocation = {x: editPart.model.getBounds()[0], y: editPart.model.getBounds()[1]};
        this.xStart = me.x - editPart.model.getBounds()[0];
        this.yStart = me.y - editPart.model.getBounds()[1];
    },
    mouseDrag: function (me, editPart) {
        this.status = me.type;
        editPart.model.getBounds()[0] = me.x - this.xStart;
        editPart.model.getBounds()[1] = me.y - this.yStart;
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
