/**
 *SVG操作API
 * @type {Object}
 */
anra.svg = anra.svg || {};

anra.svg.Util = {
    createElement:function (tagName) {
        return document.createElementNS("http://www.w3.org/2000/svg", tagName);
    }
};
var Util = anra.svg.Util;

/**
 *控件基类
 * @type {*}
 */
anra.svg.Control = anra.Control.extend({
    svg:null,
    owner:null,
    attrs:null,
    style:null,
    layoutData:null,
    tagName:'rect',
    bounds:null,
    parent:null,
    constructor:function () {
        this.style = {};
        this.bounds = {'x':0, 'y':0, 'width':100, 'height':100};
        this.attrs = {'fill':'white', 'stroke':'black'};
    },
    applyBounds:function () {
        var l = this.locArea();
        this.attrs.x = this.bounds.x + l[0];
        this.attrs.y = this.bounds.y + l[1];
        this.attrs.width = this.bounds.width;
        this.attrs.height = this.bounds.height;
    },
    /**
     * 绝对位置
     * @return {Object}
     */
    getClientLocation:function () {
        if (this.attrs == null || this.attrs.x == null || this.attrs.y == null)
            return [0, 0];
        return [this.attrs.x, this.attrs.y];
    },
    getBounds:function () {
        return this.bounds;
    },

    setAttribute:function (a) {
        this.attrs = a;
    },
    setStyle:function (s) {
        this.style = s;
    },
    paint:function () {
        this.repaint();
    }
})
;
anra.svg.Control.prototype.class = 'anra.svg.Control';
var Control = anra.svg.Control;
//初始化控件
Control.prototype.init = function () {
    if (this.owner == null) {
        var o = this;
        this.owner = Util.createElement(this.tagName);
        var e = this.owner;
        var dispatcher = anra.Platform.getDisplay().dispatcher;
        e.onmousedown = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchMouseDown(event);
        };
        e.onmousemove = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchMouseMove(event);
        };

        e.onmouseup = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchMouseUp(event);
        };

        e.ondblclick = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchDoubleClick(event);
        };
    }
    this.paint();
};
//设置父容器
Control.prototype.setParent = function (s) {
    if (s != null) {
        if (this.parent != null) {
            this.parent.removeChild(this.owner);
        }
        this.parent = s;
        this.svg = this.parent.svg;
        this.svg.appendChild(this.owner);
        this.applyBounds();
        this.paint();
    }
};
Control.prototype.repaint = function () {
    for (var k in this.attrs) {
        this.owner.setAttribute(k, this.attrs[k]);
    }
    for (k in this.style) {
        this.owner.style[k] = this.style[k];
    }
};
Control.prototype.setBounds = function (b) {
    if (b != null) {
        for (var k in b) {
            this.bounds[k] = b[k];
        }
    }
};
Control.prototype.locArea = function () {
    var xo = 0, yo = 0;
    if (this.parent != null) {
        var loc = this.parent.getClientLocation();
        xo = loc[0] == null ? 0 : loc[0];
        yo = loc[1] == null ? 0 : loc[1];
    }
    return [xo, yo];
};

/**
 *容器类
 * @type {*}
 */
anra.svg.Composite = Control.extend({
    children:null,
    layoutManager:null,
    removeChild:function (c) {
        if ('anra.svg.Control' == c.class) {
            this.children.removeObject(c);
            this.svg.remove(c.owner);
        } else {
            console.log('can not remove ' + c.toString() + ' from Composite');
        }
    },
    addChild:function (c) {
        if (this.children == null) {
            this.children = [];
        }
        if ('anra.svg.Control' == c.class) {
            if (!this.children.contains(c)) {
                this.children.push(c);
                c.init();
                c.setParent(this);
            }
        } else {
            console.log('can not add ' + c.toString() + ' to Composite');
        }
    },
    paint:function () {
        if (this.layoutManager != null)
            this.layout();
        this.repaint();
        if (this.children)
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].paint();
            }
    },
    layout:function () {
        this.layoutManager.layout(this);
    }
});
var Composite = anra.svg.Composite;

anra.SVG = Composite.extend({
    parent:null,
    dispatcher:null,
    constructor:function (id) {
        this.parent = document.getElementById(id);
        if (this.parent != null) {
            this.init();
            this.parent.appendChild(this.svg);
        } else {
            this.error("SVG parent can not be null");
        }
    },
    init:function () {
        this.owner = Util.createElement('svg');
        this.owner.setAttribute('version', '1.1');
        this.owner.style.position = 'absolute';
        this.owner.style.top = 0;
        this.owner.style.left = 0;
        this.owner.style.width = '100%';
        this.owner.style.height = '100%';
        this.svg = this.owner;
        this.element = this.parent;
        this.dispatcher = new anra.svg.EventDispatcher(this);
        var d = this.dispatcher;
        var t = this;
        this.element.onmousemove = function (event) {
            if (d.focusOwner != null)
                d.dispatchMouseMove(event);
        };
        anra.Platform.regist(anra.Platform.DISPLAY, this);
    },
    p2x:function (p) {
        if (this.element == null)
            return -1;
        return this.element.width * p / 100;
    },
    p2y:function (p) {
        if (this.element == null)
            return -1;
        return this.element.height * p / 100;
    },
    getRelativeLocation:function (event) {
        var ev = event || window.event;
        var x = ev.clientX - this.element.offsetLeft + Math.floor(window.pageXOffset);
        var y = ev.clientY - this.element.offsetTop + Math.floor(window.pageYOffset);
        return [x, y];
    }
});

anra.svg.Rect = Composite.extend({
});
anra.svg.Circle = Composite.extend({
    tagName:'circle',
    getClientLocation:function () {
        if (this.attrs.r == null)
            this.attrs.r = 0;
        return [this.attrs.cx - this.attrs.r, this.attrs.cy - this.attrs.r];
    },
    applyBounds:function () {
        var l = this.locArea();
        this.attrs.r = this.bounds.width / 2;
        this.attrs.cx = this.bounds.x + this.attrs.r + l[0];
        this.attrs.cy = this.bounds.y + this.attrs.r + l[1];
    }
});

anra.svg.Ellipse = Composite.extend({
    tagName:'ellipse',
    getClientLocation:function () {
        return [this.attrs.cx - this.attrs.rx, this.attrs.cy - this.attrs.ry];
    },
    applyBounds:function () {
        var l = this.locArea();
        this.attrs.rx = this.bounds.width / 2;
        this.attrs.ry = this.bounds.height / 2;
        this.attrs.cx = this.bounds.x + this.attrs.rx + l[0];
        this.attrs.cy = this.bounds.y + this.attrs.ry + l[1];
    }
});

/**
 * 连线
 * @type {*}
 */
anra.svg.Line = Control.extend({

});
/**
 * 布局
 * @type {*}
 */
anra.svg.Layout = Base.extend({
    layout:function (comp) {
    }
});

anra.svg.GridLayout = anra.svg.Layout.extend({


});

anra.svg.GridData = Base.extend({
});
anra.svg.GridData.prototype.class = 'anra.svg.GridData';
/**
 * 事件分发器
 * @type {*}
 */
anra.svg.EventDispatcher = Base.extend({
    display:null,
    constructor:function (display) {
        this.display = display;
    },
    focusOwner:null,
    mouseState:0,
    dispatchMouseDown:function (event) {
        this.mouseState = anra.EVENT.MouseDown;
        var e = new anra.event.Event(anra.EVENT.MouseDown);
        var location = this.getRelativeLocation(event);
        e.x = location[0];
        e.y = location[1];
        var widget = this.focusOwner;
        widget.notifyListeners(anra.EVENT.MouseDown, e);
//        widget.setFocus();

    },
    dispatchMouseMove:function (event) {
        //模拟拖拽
        var e;
        var location = this.getRelativeLocation(event);
        if ((this.mouseState == anra.EVENT.MouseDown) || (this.mouseState == anra.EVENT.MouseDrag)) {
            this.mouseState = anra.EVENT.MouseDrag;
        } else {
            this.mouseState = anra.EVENT.MouseMove;
            e = new anra.event.Event(anra.EVENT.MouseMove);
            e.x = location[0];
            e.y = location[1];
            this.focusOwner.notifyListeners(anra.EVENT.MouseMove, e);
        }
        if (this.focusOwner != null && (this.mouseState == anra.EVENT.MouseDrag)) {
            e = new anra.event.Event(anra.EVENT.MouseDrag);
            e.x = location[0];
            e.y = location[1];
            this.focusOwner.notifyListeners(anra.EVENT.MouseDrag, e);
        }
    },
    dispatchMouseUp:function (event) {
        var location = this.getRelativeLocation(event);
        this.mouseState = anra.EVENT.MouseUp;
        var e = new anra.event.Event(anra.EVENT.MouseUp, location);
        this.focusOwner.notifyListeners(anra.EVENT.MouseUp, e);
    },
    dispatchDoubleClick:function (event) {
        var location = this.getRelativeLocation(event);
        var e = new anra.event.Event(anra.EVENT.MouseDoubleClick, location);
        this.focusOwner.notifyListeners(anra.EVENT.MouseDoubleClick, e);
    },
    dispatchKeyDown:function (event) {
        var e = new anra.event.KeyEvent(anra.EVENT.KeyDown, this.getRelativeLocation(event), event);
        this.focusOwner.notifyListeners(e.type, e);
    },
    dispatchKeyUp:function (event) {
        var e = new anra.event.KeyEvent(anra.EVENT.KeyUp, this.getRelativeLocation(event), event);
        this.focusOwner.notifyListeners(e.type, e);
    },
    dispatchTouchStart:function (event) {
        var location = this.getRelativeLocation(event.touches[0]);
        var e = new anra.event.TouchEvent(anra.EVENT.TouchStart, location, event);
        this.focusOwner.notifyListeners(anra.EVENT.TouchStart, e);
    },
    dispatchTouchMove:function (event) {
        var location = this.getRelativeLocation(event.touches[0]);
        if (location[0] == null)
            return;
        var e = new anra.event.TouchEvent(anra.EVENT.TouchMove, location, event);
        this.focusOwner.notifyListeners(anra.EVENT.TouchMove, e);
    },
    dispatchTouchEnd:function (event) {
        var location = this.getRelativeLocation(event.touches[0]);
        if (location[0] == null)
            return;
        var e = new anra.event.TouchEvent(anra.EVENT.TouchEnd, location, event);
        this.focusOwner.notifyListeners(anra.EVENT.TouchEnd, e);
    },
    setFocusOwner:function (o) {
        this.focusOwner = o;
    },
    getRelativeLocation:function (event) {
        return this.display.getRelativeLocation(event);
    }
});