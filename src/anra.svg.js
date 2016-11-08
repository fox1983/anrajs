/**
 *SVG操作API
 * @type {Object}
 */
anra.svg = anra.svg || {};

anra.svg.Util = {
    createElement:function (tagName) {
        return document.createElementNS("http://www.w3.org/2000/svg", tagName);
    },
    apply:function (container, a, v) {
        if (a != null && typeof(a) == 'object')
            for (var k in a) {
                container[k] = a[k];
            }
        else if (typeof(a) == 'string') {
            container[a] = v;
        }
    },
    applyAttr:function (container, a, v) {
        if (a != null && typeof(a) == 'object')
            for (var k in a) {
                container.setAttribute(k, a[k]);
            }
        else if (typeof(a) == 'string') {
            container.setAttribute(a, v);
        }
    }
};
var Util = anra.svg.Util;

/**
 *控件基类，生命周期。
 * 构建，
 * @type {*}
 */
anra.svg.Control = anra.Control.extend({
    svg:null,
    owner:null,
    layoutData:null,
    tagName:'rect',
    bounds:null,
    parent:null,
    _attr:null,
    _style:null,
    ready:false,
    constructor:function () {
        this._Control();
    },
    _Control:function () {
        this.bounds = {'x':0, 'y':0, 'width':100, 'height':100};
    },
    applyBounds:function () {
        if (this.bounds == null)
            return;
        var l = this.locArea();
        this.setAttribute('x', this.bounds.x + l[0]);
        this.setAttribute('y', this.bounds.y + l[1]);
        this.setAttribute('width', this.bounds.width);
        this.setAttribute('height', this.bounds.height);
    },
    createContent:function () {
    },
    /**
     * 绝对位置
     * @return {Object}
     */
    getClientArea:function () {
        if (this.owner == null)
            return [0, 0, 0, 0];
        return [this.fattr('x'), this.fattr('y'), this.fattr('width'), this.fattr('height')];
    },
    attr:function (k, h) {
        if (h == null || typeof(h) != 'function')
            return this.owner.getAttribute(k);
        var a = this.owner.getAttribute(k);
        return a == null ? null : h(a);
    },
    fattr:function (k) {
        return this.attr(k, parseFloat);
    },
    getBounds:function () {
        return this.bounds;
    },
    removeAttribute:function (k) {
        this.owner.removeAttribute(k);
    },
    setAttribute:function (a, v) {
        if (this.owner == null) {
            if (this._attr == null)
                this._attr = {};
            Util.apply(this._attr, a, v);
            return;
        }
        if (this._attr != null) {
            Util.apply(this.owner, this._attr);
            this._attr = null;
        }
        Util.applyAttr(this.owner, a, v);
    },
    setStyle:function (a, v) {
        if (this.owner == null) {
            if (this._style == null)
                this._style = {};
            Util.apply(this._style, a, v);
            return;
        }
        if (this._style != null) {
            Util.apply(this.owner.style, this._style);
            this._style = null;
        }
        Util.apply(this.owner.style, a, v);
    },
    /**
     * 初始化属性，在构建完成后调用。
     */
    initProp:function () {
        this.setAttribute({'fill':'white', 'stroke':'black'});
    },
    paint:function () {
        this.applyBounds();
        //this.repaint();
    }
})
;
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
        e.ondragstart = function (event) {
            return false;
        };
        e.onmousemove = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchMouseMove(event);
        };

        e.onmouseout = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchMouseOut(event);
        };

        e.onmouseover = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchMouseIn(event);
        };

        e.onmouseup = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchMouseUp(event);
        };

        e.ondblclick = function (event) {
            dispatcher.setFocusOwner(o);
            dispatcher.dispatchDoubleClick(event);
        };

        this.ready = true;

        //应用预设
        this.setAttribute({});
        this.setStyle({});
        this.initProp();
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
        this.parent.domContainer().appendChild(this.owner);
        this.applyBounds();
        this.createContent(this);
        this.paint();
    }
};
Control.prototype.setBounds = function (b) {
    if (typeof(b) == 'object') {
        for (var k in b) {
            this.bounds[k] = b[k];
        }
    }
    if (this.ready) {
        this.applyBounds();
    }
};
Control.prototype.locArea = function () {
    var xo = 0, yo = 0;
    if (this.parent != null) {
        var loc = this.parent.getClientArea();
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
    selection:null,
    setSelection:function (o) {
        if (this.selection != null)
            this.selection.setSelected(false);
        this.selection = o;
        this.selection.setSelected(true);
    },
    removeChild:function (c) {
        if (c instanceof anra.svg.Control) {
            this.children.removeObject(c);
            this.domContainer().removeChild(c.owner);
        } else {
            anra.Platform.error('can not remove ' + c.toString() + ' from Composite');
        }
    },
    addChild:function (c) {
        if (this.children == null) {
            this.children = [];
        }
        if (c instanceof  anra.svg.Control) {
            if (!this.children.contains(c)) {
                this.children.push(c);
                c.init();
                c.setParent(this);
                this.paint();
            }
        } else {
            anra.Platform.error('can not add [' + c + '] to ' + this.tagName);
        }
    },
    /**
     * DOM容器
     * @return {*}
     */
    domContainer:function () {
        return this.svg.owner;
    },
    paint:function () {
        this.applyBounds();
        if (this.layoutManager != null)
            this.layout();

        if (this.children)
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].paint();
            }
    },
    layout:function () {
        this.layoutManager.layout(this);
    }
})
;
var Composite = anra.svg.Composite;

/**
 * 组
 * @type {*|void}
 */
anra.svg.Group = Composite.extend({
    animations:null,
    tagName:'g',
    domContainer:function () {
        return this.owner;
    },
    applyBounds:function () {
    }
});

anra.svg.Path = Composite.extend({
    startPoint:null,
    frags:null,
    close:false,
    tagName:'path',
    constructor:function () {
        this._Path();
    },
    _Path:function () {
        this._Control();
        this.startPoint = {x:0, y:0};
    },
    applyBounds:function () {
        this.setAttribute('d', this.compute());
    },
    initProp:function () {
        this.setAttribute({
            stroke:'white',
            fill:'none',
            'stroke-width':2
        });
    },
    compute:function () {
        var l = this.locArea();
        var result = '';
        if (this.startPoint != null) {
            result += 'm' + (this.startPoint.x + l[0]) + ',' + (this.startPoint.y + l[1]) + ' ';
        }
        if (this.frags != null)
            for (var i = 0; i < this.frags.length; i++) {
                result += ' ' + this.frags[i];
            }
        if (this.close) {
            result += 'z';
        }
        return result;
    }
});

anra.svg.MarkerLine = anra.svg.Group.extend({
    createContent:function () {
//        this.addChild();
    }
});

/**
 * 动画
 * @type {*|void}
 */
anra.svg.Animation = Control.extend({
    tagName:'animateTransform'
});

anra.SVG = Composite.extend({
    dispatcher:null,
    error:function (msg) {
        console.log(msg);
    },
    constructor:function (id) {
        this.element = document.getElementById(id);
        if (this.element != null) {
            this.init();
            this.element.appendChild(this.svg.owner);
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
        this.owner.style.width = '200%';
        this.owner.style.height = '200%';
        this.svg = this;
        this.dispatcher = new anra.svg.EventDispatcher(this);
        var d = this.dispatcher;
        var t = this;
        var div = this.element;
        this.element.onmousemove = function (event) {
            if (d.focusOwner != null)
                d.dispatchMouseMove(event);
        };
        this.element.onmouseout = function (event) {
            var x = event.clientX;
            var y = event.clientY;
            if (x < div.offsetLeft || x > div.offsetLeft + div.offsetWidth || y < div.offsetTop || y > div.offsetTop + div.offsetHeight)
                d.dispatchMouseOutScreen(event);
        };
        this.element.onmouseup = function (event) {
            anra.Platform.focusDisplay = this;
            if (d.focusOwner != null)
                d.dispatchMouseUp(event);
        };
        anra.Platform.regist(anra.Platform.DISPLAY, this);
        anra.Platform.focus = this;
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
        var x = ev.clientX - this.getX(this.element) + Math.floor(window.pageXOffset);
        var y = ev.clientY - this.getY(this.element) + Math.floor(window.pageYOffset);
        return [x, y];
    },
    getX:function (obj) {
        if (this.left != null)
            return this.left;
        var parObj = obj;
        var left = obj.offsetLeft;
        while (parObj = parObj.offsetParent) {
            left += parObj.offsetLeft;
        }
        this.left = left;
        return this.left;
    },
    getY:function (obj) {
        if (this.top != null)
            return this.top;
        var parObj = obj;
        var top = obj.offsetTop;
        while (parObj = parObj.offsetParent) {
            top += parObj.offsetTop;
        }
        this.top = top;
        return this.top;
    }
});

anra.svg.Rect = {};
anra.svg.Circle = {
    tagName:'circle',
    getClientArea:function () {
        return [this.fattr('cx'), this.fattr('cy'), this.fattr['r'] * 2];
    },
    applyBounds:function () {
        var l = this.locArea();
        var r = this.bounds.width / 2;
        this.setAttribute({
            r:r,
            cx:this.bounds.x + l[0],
            'cy':this.bounds.y + l[1]
        });
    }
};
anra.svg.Image ={
    tagName:'image',
    url:null,
    setUrl:function (url) {
        this.url = url;
        if (this.owner != null) {
            this.owner.setAttributeNS(
                'http://www.w3.org/1999/xlink',
                'xlink:href',
                url);
        }
    },
    initProp:function () {
        this.owner.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            this.url);
    }
};
/**
 * 文本
 * @type {*|void}
 */
anra.svg.Text = {
    tagName:'text',
    text:null,
    setText:function (text) {
        this.text = text;
        if (this.owner != null) {
            this.owner.textContent = text;
        }
    },
    initProp:function () {
        this.owner.textContent = this.text;
    },
    paint:function () {

    }
};

anra.svg.Ellipse = {
    tagName:'ellipse',
    getClientArea:function () {
        return [this.fattr('cx') - this.fattr('rx'), this.fattr('cy') - this.fattr('ry')];
    },
    applyBounds:function () {
        var l = this.locArea();
        this.setAttribute('rx', this.bounds.width / 2);
        this.setAttribute('ry', this.bounds.height / 2);
        this.setAttribute('cx', this.bounds.x + this.fattr('rx') + l[0]);
        this.setAttribute('cy', this.bounds.y + this.fattr('ry') + l[1]);
    }
};

/**
 * 布局
 * @type {*}
 */
anra.svg.Layout = Base.extend({
    layout:function (comp) {
    }
});

anra.svg.GridLayout = anra.svg.Layout.extend({});

anra.svg.GridData = Base.extend({});
count = 0;
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
        //提高效率
        if ((++count ) % 5 != 0) {
            if (count > 101)
                count = 0;
            return;
        }
        //模拟拖拽
        var e;
        var location = this.getRelativeLocation(event);
        if ((this.mouseState == anra.EVENT.MouseDown) || (this.mouseState == anra.EVENT.MouseDrag)) {
            this.mouseState = anra.EVENT.MouseDrag;
            if (this.dragTarget == null) {
                this.dragTarget = this.focusOwner;
                e = new anra.event.Event(anra.EVENT.DragStart, location);
                this.dragTarget.notifyListeners(anra.EVENT.DragStart, e);
            }
        } else {
            this.mouseState = anra.EVENT.MouseMove;
            e = new anra.event.Event(anra.EVENT.MouseMove);
            e.x = location[0];
            e.y = location[1];
            this.focusOwner.notifyListeners(anra.EVENT.MouseMove, e);
        }
        if (this.dragTarget != null && (this.mouseState == anra.EVENT.MouseDrag)) {
            e = new anra.event.Event(anra.EVENT.MouseDrag);
            e.x = location[0];
            e.y = location[1];
            this.dragTarget.notifyListeners(anra.EVENT.MouseDrag, e);
        }
    },
    dispatchMouseUp:function (event) {
        var location = this.getRelativeLocation(event);
        if (this.mouseState == anra.EVENT.MouseDrag) {
            var e = new anra.event.Event(anra.EVENT.DragEnd, location);
            e.prop = {drag:this.dragTarget, target:this.focusOwner};
            this.dragTarget.notifyListeners(anra.EVENT.DragEnd, e);
            if (this.dragTarget != this.focusOwner)
                this.focusOwner.notifyListeners(anra.EVENT.DragEnd, e);
        }
        this.mouseState = anra.EVENT.MouseUp;
        e = new anra.event.Event(anra.EVENT.MouseUp, location);
        this.focusOwner.notifyListeners(anra.EVENT.MouseUp, e);
        this.dragTarget = null;
    },
    dispatchMouseIn:function (event) {
        var location = this.getRelativeLocation(event);
        var e = new anra.event.Event(anra.EVENT.MouseIn, location);
        this.focusOwner.notifyListeners(anra.EVENT.MouseIn, e);
    },
    dispatchMouseOut:function (event) {
        var loc = this.getRelativeLocation(event);
        if (anra.Rectangle.contains(this.focusOwner.bounds, loc[0], loc[1]))
            return;
        var e = new anra.event.Event(anra.EVENT.MouseOut, loc);
        this.focusOwner.notifyListeners(anra.EVENT.MouseOut, e);
    },
    dispatchMouseOutScreen:function (event) {
//        this.mouseState = anra.EVENT.MouseOut;
//        this.dragTarget = null;
    },
    dispatchDoubleClick:function (event) {
        var location = this.getRelativeLocation(event);
        var e = new anra.event.Event(anra.EVENT.MouseDoubleClick, location);
        this.focusOwner.notifyListeners(anra.EVENT.MouseDoubleClick, e);
    },
    dispatchKeyDown:function (event) {
        var e = new anra.event.KeyEvent(anra.EVENT.KeyDown, this.getRelativeLocation(event), event);
        var f = this.focusOwner == null ? this.display : this.focusOwner;
        f.notifyListeners(e.type, e);
    },
    dispatchKeyUp:function (event) {
        var e = new anra.event.KeyEvent(anra.EVENT.KeyUp, this.getRelativeLocation(event), event);
        var f = this.focusOwner == null ? this.display : this.focusOwner;
        f.notifyListeners(e.type, event);
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
