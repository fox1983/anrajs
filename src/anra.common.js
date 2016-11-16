Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    if (typeof val == 'number') {
        var o = this[val];
        this.splice(val, 1);
        return o;
    } else {
        this.removeObject(val);
        return val;
    }
};
Array.prototype.insert = function (item, index) {
    this.splice(index, 0, item);
};
/**
 * 移除数组中的指定对象
 * @param val
 */
Array.prototype.removeObject = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.remove(index);
    }
};
Array.prototype.isEmpty = function () {
    return this.length == 0;
};
Array.prototype.last = function () {
    return this[this.length - 1];
};
//Object.prototype.equals = function (o) {
//    if (this == o)return true;
//    if (typeof(o) == 'object') {
//        var tp = Object.getOwnPropertyNames(this);
//        var op = Object.getOwnPropertyNames(o);
//        if (tp.length != op.length)return false;
//        for (var i = 0; i < tp.length; i++) {
//            var n = tp[i];
//            if (this[n] != o[n])
//                return false;
//        }
//        return true;
//    }
//    return false;
//};

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
};

Map = HashMap;
Map.prototype.put = Map.prototype.set;


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

SELECTED = 0;
SELECTED_NONE = 1;
SELECTED_PRIMARY = 2;
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
    ready:false,
    focus:null,
    regist:function (key, object) {
        this.pool.set(key, object);
        if (!this.ready)
            this.init();
    },
    init:function () {
        //全局事件
        var p = this;
        document.onkeydown = function (event) {
            var d = p.focus;
            if (d != null && d.dispatcher != null)
                d.dispatcher.dispatchKeyDown(event);
        };

        document.onkeyup = function (event) {
            var d = p.focus;
            if (d != null && d.dispatcher != null)
                d.dispatcher.dispatchKeyUp(event);
        };
        this.ready = true;
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
        this.getDisplay().error(e);
    }
};

/**
 *矩形工具类
 * @type {Object}
 */
anra.Rectangle = {
    contains:function (rect, x, y) {
        if (rect == null)
            return false;
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
//        alert(msg);
        throw msg;
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
        if (this.afterAddListener != null)this.afterAddListener();
    },
    removeListener:function (eventType, listener) {
        if (listener == null)anra.Platform.getDisplay().error("listener can not be null");
        if (this.eventTable == null)return;
        this.eventTable.unhook(eventType, listener);
        if (this.afterRemoveListener != null)this.afterRemoveListener();
    },
    notifyListeners:function (eventType, event, isGlobalEvent) {
        if (this.parent != null && !isGlobalEvent && anra.BubbleEvent.contains(eventType)) {
            var ls = this.eventTable == null ? null : this.eventTable.getListeners(eventType);
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
    constructor:function () {
        this._init();
    },
    _init:function () {
        if (this.init != null)this.init();
    },
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
    },
    selected:function (s) {
    }
});
anra.Composite = anra.Control.extend({
    selection:null,
    /*找到指定位置的控件*/
    findWidgetOnXY:function (x, y) {
    },
    setSelection:function (o) {
        if (this.selection != null)
            this.selection.setSelected(false);
        this.selection = o;
        this.selection.setSelected(true);
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
anra.Action = Base.extend({
    id:"", run:function () {
    }
});

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
    TouchEnd:13,
    DragStart:14,
    DragEnd:15
};
var E = anra.EVENT;
/**
 *以下事件，如果当前元素没有监听，则冒泡到父级
 * @type {Array}
 */
anra.BubbleEvent = [
    E.MouseDown, E.MouseUp, E.MouseMove, E.MouseDoubleClick, E.MouseDrag, E.DragEnd, E.DragStart
];

anra.event.Event = Base.extend({
    widget:null,
    type:0,
    x:undefined,
    y:undefined,
    prop:null,
    constructor:function (obj, location, prop) {
        this.type = obj || anra.EVENT.NONE;
        if (location != null && location.length == 2) {
            this.x = location[0];
            this.y = location[1];
        }
        this.prop = prop;
    }
});

anra.event.KeyEvent = anra.event.Event.extend({
    key:undefined,
    keyCode:undefined,
    constructor:function (obj, location, event) {
        if (event != null) {
            //            this.keyCode = event.keyCode;
            for (var k in event) {
                this[k] = event[k];
            }
        }
        this.type = obj || anra.EVENT.NONE;
        if (location != null && location.length == 2) {
            this.x = location[0];
            this.y = location[1];
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
    containsEvent:function (eventType) {

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
        this.types.push(eventType);
        this.listeners.push(listener);
    },
    unhook:function (eventType, listener) {
        for (var i = 0; i < this.types.length; i++) {
            if (this.types[i] == eventType && this.listeners[i] == listener) {
                this.remove(i);
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
/**
 * 命令
 * @type {*}
 */
anra.Command = Base.extend({

    execute:function () {
    },
    canExecute:function () {
        return true;
    },
    redo:function () {
        this.execute();
    },
    undo:function () {
    },
    canUndo:function () {
        return true;
    },
    dispose:function () {
    },
    chain:function (command) {
        if (command == null)
            return this;

        var result = new anra.ChainedCompoundCommand();
        result.add(this);
        result.add(command);
        return result;
    }
});
anra.ChainedCompoundCommand = anra.Command.extend({
    commandList:null,
    constructor:function () {
        this.commandList = [];
    },
    add:function (c) {
        if (c != null)this.commandList.push(c);
    },
    canExecute:function () {
        if (this.commandList.length == 0)
            return false;
        for (var i = 0, len = this.commandList.length; i < len; i++) {
            var cmd = this.commandList[i];
            if (cmd == null)
                return false;
            if (!cmd.canExecute())
                return false;
        }
        return true;
    },
    canUndo:function () {
        if (this.commandList.length == 0)
            return false;
        for (var i = 0, len = this.commandList.length; i < len; i++) {
            var cmd = this.commandList[i];
            if (cmd == null)
                return false;
            if (!cmd.canUndo())
                return false;
        }
        return true;
    },
    dispose:function () {
        for (var i = 0, len = this.commandList.length; i < len; i++) {
            this.commandList[i].dispose();
        }
    },
    execute:function () {
        for (var i = 0, len = this.commandList.length; i < len; i++) {
            this.commandList[i].execute();
        }
    },
    getCommands:function () {
        return this.commandList;
    },
    isEmpty:function () {
        return this.commandList == null || this.commandList.length == 0;
    },
    size:function () {
        return this.commandList.length;
    },
    chain:function (c) {
        this.add(c);
        return this;
    }
});
/**
 * 命令事件
 * @type {*}
 */
anra.CommandEvent = Base.extend({
    statck:null,
    command:null,
    state:null,
    constructor:function (stack, cmd, state) {
        this.stack = stack;
        this.command = cmd;
        this.state = state;
    }
});
PRE_EXECUTE = 1;
PRE_REDO = 2;
PRE_UNDO = 4;
POST_EXECUTE = 3;

/**
 * 动作注册器
 * @type {*}
 */
anra.ActionRegistry = Base.extend({
    handlers:null,
    keyHandle:function (e) {

    },
    registKeyHandler:function (key, action) {

    }

});

/**
 * 命令栈
 * @type {*}
 */
anra.CommandStack = Base.extend({
    redoable:null,
    undoable:null,
    listeners:null,
    saveLocation:0,
    constructor:function () {
        this.redoable = [];
        this.undoable = [];
        this.listeners = [];
    },
    addCommandStackEventListener:function (e) {
        if (e instanceof  anra.Listener)
            this.listeners.push(e);
    },
    canRedo:function () {
        return this.redoable.length > 0;
    },
    canUndo:function () {
        return this.undoable.length == 0 ? false : this.undoable.last.canUndo();
    },
    notifyListeners:function (command, state) {
        for (var i = 0; i < this.listeners.length; i++)
            this.listeners[i].handleEvent(event);
    },
    flush:function () {
        this.flushRedo();
        this.flushUndo();
        this.saveLocation = 0;
        this.notifyListeners();
    },
    flushRedo:function () {
        while (!this.redoable.isEmpty())
            this.redoable.pop().dispose();
    },
    flushUndo:function () {
        while (!this.undoable.isEmpty())
            this.undoable.pop().dispose();
    },
    execute:function (c) {
        if (c == null || !c.canExecute())
            return;
        this.flushRedo();
        this.notifyListeners(c, PRE_EXECUTE);
        try {
            c.execute();
            while (this.undoable.length > 0) {
                this.undoable.remove(0).dispose();
                if (this.saveLocation > -1)
                    this.saveLocation--;
            }
            if (this.saveLocation > this.undoable.length)
                this.saveLocation = -1;
            this.undoable.push(c);
        } finally {
            this.notifyListeners(c, POST_EXECUTE);
        }
    },
    markSaveLocation:function () {
        this.saveLocation = this.undoable.length;
    },
    isDirty:function () {
        return this.undoable.length != this.saveLocation;
    }
})
;
