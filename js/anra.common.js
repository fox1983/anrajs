Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    if (typeof val == 'number') {
        this.splice(val, 1);
    }
};
Array.prototype.removeObject = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.remove(index);
    }
};

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
};

function Map() {

    var mapObj = {};
    var size = 0;
    this.size = function () {
        return size;
    };

    this.set = function (key, value) {
        size++;
        mapObj[key] = value;
    };

    this.remove = function (key) {
        if (mapObj.hasOwnProperty(key)) {
            delete mapObj[key];
            size--;
        }
    };

    this.get = function (key) {
        if (mapObj.hasOwnProperty(key)) {
            return mapObj[key];
        }
        return null;
    };

    this.keys = function () {
        var keys = [];
        for (var k in mapObj) {
            keys.push(k);
        }
        return keys;
    };

    // 遍历map
    this.forEach = function (fn) {
        for (var k in mapObj) {
            if (fn(mapObj[k], k)) {
                break;
            }
        }
    };

    this.toString = function () {
        var str = "{";
        for (var k in mapObj) {
            str += "\"" + k + "\" : \"" + mapObj[k] + "\",";
        }
        str = str.substring(0, str.length - 1);
        str += "}";
        return str;
    }

}


/*
 * common name space definition
 *
 *
 */
var anra = anra || {
    common:function () {
    },
    util:{}
};
/*图片加载器，用于内存管理*/
anra.ImageRegistry = Base.extend({
    images:new Map(),
    regist:function (imageURL) {
        var img = this.images.get(imageURL);
        if (img == null) {
            img = new Image();
            img.src = imageURL;
            this.images.set(imageURL, img);
        }
        return img;
    },
    isLoaded:function (imageURL) {
        var img = this.images.get(imageURL);
        if (img == null)
            img = this.regist(imageURL);
        if (img.complete)
            return true;
        return false;
    },
    get:function (imageURL) {
        return this.images.get(imageURL);
    },
    clear:function () {
        this.images.clear();
    }
});

anra.ImageRegistry = new anra.ImageRegistry();


/**
 *全局使用
 */
anra.Platform = {
    pool:new Map(),
    regist:function (key, object) {
        this.pool.set(key, object);
    },
    get:function (key) {
        return this.pool.get(key);
    },
    unregist:function (key) {
        this.pool.delete(key);
    },
    getCurrentScene:function () {
        var canvas = this.get(this.DISPLAY);
        return canvas.scenes[canvas.currentScene];
    },
    getDisplay:function () {
        return this.get(this.DISPLAY);
    },
    error:function (e) {
        this.getDisplay.error(e);
    }
};

/**
 *矩形工具类
 * @type {Object}
 */
anra.Rectangle = {
    contains:function (rect, x, y) {
        return (x >= rect.x) && (y >= rect.y) && x < (rect.x + rect.width) && y < (rect.y + rect.height);
    },
    distance:function (r1, r2) {
        return Math.sqrt((r1[0] - r2[0]) * (r1[0] - r2[0]) + (r1[1] - r2[1]) * (r1[1] - r2[1]));
    }
};

anra.Platform.DISPLAY = 0;
anra.Platform.PAINTER = 1;

/**
 * 显示器
 * @type {*}
 */
anra.Display = Base.extend({
    id:"default canvas",
    element:null,
    postEvent:function (e) {
    },
    error:function (msg) {
        alert(msg);
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
})
;
/**
 * 控件
 * @type {*}
 */
anra.Widget = Base.extend({
    id:"",
    image:null,
    x:0,
    y:0,
    width:20,
    height:20,
    eventTable:null,
    paint:function () {
    },
    dispose:function () {
    },
    error:function (msg) {
        this.display.error(this.id + ":" + msg);
    },
    addListener:function (eventType, listener) {
        if (listener == null)anra.Platform.getDisplay().error("listener can not be null");
        if (this.eventTable == null)this.eventTable = new anra.event.EventTable();
        this.eventTable.hook(eventType, listener);
    },
    removeListener:function (eventType, listener) {
        if (listener == null)anra.Platform.getDisplay().error("listener can not be null");
        if (this.eventTable == null)return;
        this.eventTable.unhook(eventType, listener);
    },
    notifyListeners:function (eventType, event, isGlobalEvent) {
        if (this.parent != null && this.eventTable != null && !isGlobalEvent && anra.BubbleEvent.contains(eventType)) {
            var ls = this.eventTable.getListeners(eventType);
            if (ls == null || ls.length == 0) {
                this.parent.notifyListeners(eventType, event, isGlobalEvent);
                return;
            }
        }
        if (event == null) event = new anra.event.Event();
        event.type = eventType;
        event.widget = this;
        event.display = anra.Platform.getDisplay();
        if (event.time == 0) {
            event.time = new Date().getTime();
        }
        ;
        if (isGlobalEvent) {
            anra.Platform.getDisplay().postEvent(event);
        } else {
            if (this.eventTable != null)
                this.eventTable.sendEvent(event);
        }
    }

})
;
anra.Control = anra.Widget.extend({
    parent:null,
    addMouseListener:function (listener) {
        if (listener == null) this.error("NullPointException anra.Control#addMouseListener");
        this.addListener(anra.EVENT.MouseDown, listener);
        this.addListener(anra.EVENT.MouseUp, listener);
        this.addListener(anra.EVENT.MouseDoubleClick, listener);
    },
    addKeyListener:function (listener) {
        if (listener == null) this.error("NullPointException anra.Control#addKeyListener");
        this.addListener(anra.EVENT.KeyDown, listener);
        this.addListener(anra.EVENT.KeyUp, listener);
    },
    addTouchListener:function (listener) {
        if (listener == null) this.error("NullPointException anra.Control#addTouchListener");
        this.addListener(anra.EVENT.TouchStart, listener);
        this.addListener(anra.EVENT.TouchMove, listener);
        this.addListener(anra.EVENT.TouchEnd, listener);
    }
});
anra.Composite = anra.Control.extend({
    selection:null,
    /*找到指定位置的控件*/
    findWidgetOnXY:function (x, y) {
    },
    setSelection:function (o) {
        this.selection = o;
    }
});


/**
 * 监听
 * @type {*|void}
 */
anra.Listener = Base.extend({
    func:null,
    constructor:function (func) {
        this.func = func;
    },
    handleEvent:function (event) {
        if (this.func != null)
            this.func(event);
    }
});

anra.KeyListener = anra.Listener.extend({
    handleEvent:function (event) {
        if (event.type == anra.EVENT.KeyDown) {
            this.handleKeyDownEvent(event);
        } else if (event.type == anra.EVENT.KeyUp) {
            this.handleKeyDownUp(event);
        }
    },
    handleKeyDownEvent:function (event) {
    }, handleKeyDownUp:function (event) {
    }
});

/**
 * 动作
 * @type {*|Object}
 */
anra.Action = Base.extend({id:"", run:function () {
}});

/**
 *事件定义
 */
anra.event = anra.event || {};
anra.EVENT = {
    NONE:0,
    MouseDown:1,
    MouseUp:2,
    MouseOver:3,
    MouseIn:4,
    MouseOut:5,
    MouseDoubleClick:6,
    MouseDrag:7,
    MouseMove:8,
    KeyDown:9,
    KeyUp:10,
    TouchStart:11,
    TouchMove:12,
    TouchEnd:13
};
var E = anra.EVENT;
/**
 *以下事件，如果当前元素没有监听，则冒泡到父级
 * @type {Array}
 */
anra.BubbleEvent = [
    E.MouseDown, E.MouseUp, E.MouseMove, E.MouseDoubleClick
];

anra.event.Event = Base.extend({
    widget:null,
    type:0,
    x:undefined,
    y:undefined,
    constructor:function (obj, location) {
        this.type = obj || anra.EVENT.NONE;
        if (location != null && location.length == 2) {
            this.x = location[0 ];
            this.y = location[1];
        }
    },
    getType:function () {
        return this.type;
    },
    getWidget:function () {
        return this.widget;
    }
});

anra.event.KeyEvent = anra.event.Event.extend({
    key:undefined,
    keyCode:undefined,
    constructor:function (obj, location, event) {
        this.type = obj || anra.EVENT.NONE;
        if (location != null && location.length == 2) {
            this.x = location[0 ];
            this.y = location[1];
        }
        if (event != null) {
            this.keyCode = event.keyCode;
        }
    }
});
anra.event.TouchEvent = anra.event.Event.extend({
    touches:[],
    constructor:function (obj, location, event) {
        this.type = obj || anra.EVENT.NONE;
        if (location != null && location.length == 2) {
            this.x = location[0];
            this.y = location[1];
        }
        if (event != null) {
            this.touches = event.touches;
        }
    }
});
anra.event.EventTable = Base.extend({
    types:null,
    listeners:null,
    level:0,
    constructor:function () {
        this.types = [];
        this.listeners = [];
    },
    getListeners:function (eventType) {
        var result = [];
        for (var i = 0; i < this.types.length; i++) {
            if (this.types [i] == eventType) {
                result.push(this.listeners [i]);
            }
        }
        return result;
    },
    hook:function (eventType, listener) {
        if (isNaN(eventType))
            anra.Platform.getDisplay.error("anra.event.EventTable#hook eventType should be number");
        this.types.push(eventType);
        this.listeners.push(listener);
    },
    unhook:function (eventType, listener) {
        for (var i = 0; i < this.types.length; i++) {
            if (this.types[i] == eventType && this.listeners[i] == listener) {
                remove(i);
                return;
            }
        }
    },
    remove:function (i) {
        this.types.remove(i);
        this.listeners.remove(i);
    },
    sendEvent:function (event) {
        if (event.type == anra.EVENT.NONE)return;
        for (var i = 0; i < this.types.length; i++) {
            if (this.types[i] == event.type) {
                var l = this.listeners[i];
                if (l != null)
                    if (typeof(l) == 'function') {
                        l(event);
                    } else
                        l.handleEvent(event);
            }
        }
    },
    size:function () {
        return this.types.length;
    }
});
