/*
 * 和canvas有关的类
 *
 */
/*生命周期*/
anra.DESTROY = -1;
anra.CREATE = 0;
anra.START = 1;
anra.RESUME = 2;
anra.PAUSE = 3;
anra.STOP = 4;

/*状态*/
anra.status = {
    DEAD:-1,
    MOVING:1,
    WAITING:2,
    ATTARKING:3,
    JUMPING:4
};


anra.event.EventDispatcher = Base.extend({
    canvas:null,
    constructor:function (canvas) {
        this.canvas = canvas;
    },
    focusOwner:null,
    mouseState:0,
    dispatchMouseDown:function (event) {
        this.mouseState = anra.EVENT.MouseDown;
        var e = new anra.event.Event(anra.EVENT.MouseDown);
        var location = this.getRelativeLocation(event);
        e.x = location[0];
        e.y = location[1];
        var widget = this.getWidgetByEvent(event);
        widget.notifyListeners(anra.EVENT.MouseDown, e);
        widget.setFocus();

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
            this.getWidgetByEvent(event).notifyListeners(anra.EVENT.MouseMove, e);
        }

        if (this.focusOwner != null && (this.mouseState == anra.EVENT.MouseDrag)) {
            if (this.getWidgetByEvent(event) == this.focusOwner) {
                e = new anra.event.Event(anra.EVENT.MouseDrag);
                e.x = location[0];
                e.y = location[1];
                this.getWidgetByEvent(event).notifyListeners(anra.EVENT.MouseDrag, e);
            }
        }
    },
    dispatchMouseUp:function (event) {
        var location = this.getRelativeLocation(event);
        this.mouseState = anra.EVENT.MouseUp;
        var e = new anra.event.Event(anra.EVENT.MouseUp, location);
        this.getWidgetByLocation(location).notifyListeners(anra.EVENT.MouseUp, e);
    },
    dispatchDoubleClick:function (event) {
        var location = this.getRelativeLocation(event);
        var e = new anra.event.Event(anra.EVENT.MouseDoubleClick, location);
        this.getWidgetByLocation(location).notifyListeners(anra.EVENT.MouseDoubleClick, e);
    },
    dispatchKeyDown:function (event) {
        var e = new anra.event.KeyEvent(anra.EVENT.KeyDown, this.getRelativeLocation(event), event);
        this.getWidgetByEvent(event).notifyListeners(e.type, e);
    },
    dispatchKeyUp:function (event) {
        var e = new anra.event.KeyEvent(anra.EVENT.KeyUp, this.getRelativeLocation(event), event);
        this.getWidgetByEvent(event).notifyListeners(e.type, e);
    },
    dispatchTouchStart:function (event) {
        var location = this.getRelativeLocation(event.touches[0]);
        var e = new anra.event.TouchEvent(anra.EVENT.TouchStart, location, event);
        this.getWidgetByLocation(location).notifyListeners(anra.EVENT.TouchStart, e);
    },
    dispatchTouchMove:function (event) {
        var location = this.getRelativeLocation(event.touches[0]);
        if (location[0] == null)
            return;
        var e = new anra.event.TouchEvent(anra.EVENT.TouchMove, location, event);
        this.getWidgetByLocation(location).notifyListeners(anra.EVENT.TouchMove, e);
    },
    dispatchTouchEnd:function (event) {
        var location = this.getRelativeLocation(event.touches[0]);
        if (location[0] == null)
            return;
        var e = new anra.event.TouchEvent(anra.EVENT.TouchEnd, location, event);
        this.getWidgetByLocation(location).notifyListeners(anra.EVENT.TouchEnd, e);
    },
    setFocusOwner:function (o) {
        this.focusOwner = o;
    },
    getRelativeLocation:function (event) {
        return this.canvas.getRelativeLocation(event);
    },
    getWidgetByLocation:function (location) {
        return this.canvas.findWidgetOnXY(location[0], location[1]);
    },
    getWidgetByEvent:function (event) {
        var location = this.getRelativeLocation(event);
        return this.canvas.findWidgetOnXY(location[0], location[1]);
    }
});
/**
 *画布
 */
anra.Canvas = anra.Display.extend({
    gc:NaN,
    scenes:[],
    currentScene:0,
    dispatcher:null,
    constructor:function (id) {
        if (typeof(id) == "undefined" || id == null) {
            alert("wrong id");
        }
        this.id = id;
        this.element = document.getElementById(id);
        this.gc = this.element.getContext('2d');
        anra.Platform.regist(anra.Platform.DISPLAY, this);
        this.dispatcher = new anra.event.EventDispatcher(this);
        this.init(this.element, this.dispatcher);
    },
    init:function (e, dispatcher) {
        //TODO
        this.dispatcher.setFocusOwner(this);
        e.onmousedown = function (event) {
            dispatcher.dispatchMouseDown(event);
        };
        e.onmousemove = function (event) {
            dispatcher.dispatchMouseMove(event);
        };

        e.onmouseup = function (event) {
            dispatcher.dispatchMouseUp(event);
        };

        e.ondblclick = function (event) {
            dispatcher.dispatchDoubleClick(event);
        };

        EventUtil.addEventHandler(e, 'keyup', function (event) {
            dispatcher.dispatchKeyUp(event);
        });
        EventUtil.addEventHandler(e, 'keydown', function (event) {
            dispatcher.dispatchKeyDown(event);
        });
        EventUtil.addEventHandler(e, 'touchmove', function (event) {
            dispatcher.dispatchTouchMove(event);
        });
        EventUtil.addEventHandler(e, 'touchend', function (event) {
            dispatcher.dispatchTouchEnd(event);
        });
        EventUtil.addEventHandler(e, 'touchstart', function (event) {
            dispatcher.dispatchTouchStart(event);
        });
    },
    getCurrentScene:function () {
        if (this.scenes.length == 0)
            this.error("canvas has no scene");
        return this.scenes[this.currentScene];
    },
    destroy:function () {
        anra.Platform.unregist(anra.Platform.DISPLAY);
    },
    setFocusOwner:function (o) {
        this.dispatcher.setFocusOwner(o);
    },
    findWidgetOnXY:function (x, y) {
        var scene = this.getCurrentScene();
        if (scene == null)
            return null;
        return scene.findWidgetOnXY(x, y);
    }
});

/**
 *绘制器
 */
anra.Painter = Base.extend({
    id:null,
    frameRate:15,
    lifeCycle:anra.STOP,
    canvas:null,
    timer:0,
    setCanvas:function (c) {
        this.canvas = c;
    },
    start:function () {
        if (typeof(this.canvas) == "undefined" || this.canvas == null) {
            alert("render has no canvas");
            return;
        }
        this.canvas.element.focus();
        if (this.lifeCycle != anra.STOP) {
            alert("render is started");
            return;
        }
        this.lifeCycle = anra.CREATE;
        var o = this;
        anra.Platform.regist(anra.Platform.PAINTER, this);
        this.id = setInterval(function () {
            o.run();
        }, this.frameRate);
    },
    pause:function () {
        clearInterval(this.id);
        this.lifeCycle = anra.PAUSE;
        this.run();
    },
    resume:function () {
        this.lifeCycle = anra.RESUME;
        this.id = setInterval(this.run, this.frameRate);
    },
    stop:function () {
        this.lifeCycle = anra.STOP;
        //this.run();
        clearInterval(this.id);
        anra.Platform.unregist(anra.Platform.PAINTER, this);
    },
    run:function () {
        var scene = this.canvas.getCurrentScene();
        switch (this.lifeCycle) {
            case anra.CREATE:
                if (scene.onCreate(this.canvas.element, this.canvas.gc))
                    this.lifeCycle = anra.START;
                break;
            case anra.START:
                if (scene.onStart(this.canvas.element, this.canvas.gc))
                    this.lifeCycle = anra.RESUME;
                break;
            case anra.RESUME:
                if (this.timer++ == 999)
                    this.timer = 0;
                scene.onResume(this.canvas.element, this.canvas.gc);
                break;
            case anra.PAUSE:
                scene.onPause(this.canvas.element, this.canvas.gc);
                break;
            case anra.STOP:
                if (scene.onStop(this.canvas.element, this.canvas.gc))
                    this.lifeCycle = anra.DESTROY;
                break;
            case anra.DESTROY:
                scene.onDestroy(this.canvas.element, this.canvas.gc);
                break;
        }

    }
});

/**
 *地形绘制器,config是一个二维数组，每个值都是一个地形码，用于在地形注册器里提取对应的地形绘制类
 */
anra.LandPainter = Base.extend({
    registry:null,
    config:null,
    create:function (o, gc) {
    },
    paint:function (scene, o, gc) {
        if (this.registry == null) {
            alert("anra.LandReader error: registry can not be null");
            return;
        }
        if (this.config == null) {
            alert("anra.LandReader error: config can not be null");
            return;
        }
        for (var i = 0; i < this.config.length; i++) {
            for (var j = 0; j < this.config[i].length; j++) {
                var land = this.registry.get(this.config[i][j]);
                land.paint(o, gc, scene);
            }
        }
    }
});

/**
 *地形注册器
 */
anra.LandRegistry = Base.extend({
    pool:null,
    constructor:function () {
        this.pool = new Map();
    },
    create:function () {
    },
    regist:function (land) {
        this.pool.set(land.id, land);
    },
    get:function (key) {
        return this.pool.get(key);
    }
});
/**
 *进度条
 */
anra.ProgressBar = Base.extend({
    total:0,
    title:"loading",
    o:null,
    gc:null,
    x:0,
    y:0,
    font:"35px 微软雅黑",
    color:"#777",
    current:0,
    tasks:[],
    currentTask:0,
    isDone:false,
    constructor:function (o, gc) {
        this.o = o;
        this.gc = gc;
    },
    beginTask:function () {
        this.paint(this.title + " 0%");
    },
    worked:function (p) {
        this.current += this.work;
        this.paint(this.title + " " + this.current + "%");
    },
    done:function () {
        this.paint(this.title + " 100%");
        this.isDone = true;
    },
    paint:function (text) {
        this.gc.clearRect(0, 0, this.o.width, this.o.height);
        this.gc.save();
        this.gc.fillStyle = this.color;
        this.gc.font = this.font;
        this.gc.fillText(text, this.x, this.y);
        this.gc.restore();
    },
    /*指针指向下一个任务*/
    next:function () {
        this.currentTask++;
        if (this.tasks.length - 1 <= this.currentTask) {
            this.done();
            return;
        }
    },
    /*处理当前任务*/
    progress:function () {
        if (this.getCurrentTask() == null) {
            return false;
        }
        switch (this.getCurrentTask().status) {
            case anra.CREATE:
                this.title = this.getCurrentTask().title;
                this.getCurrentTask().init();
                this.getCurrentTask().status = anra.RESUME;
                break;
            case anra.RESUME:
                this.getCurrentTask().run(this);
                break;
            case anra.STOP:
                return false;
        }
        return true;
    },
    getCurrentTask:function () {
        return this.tasks[this.currentTask];
    },
    addTask:function (task) {
        this.tasks.unshift(task);
        this.total += task.total;
    }
});
/**
 * 进度条任务
 */
anra.ProgressTask = Base.extend({
    total:100,
    title:"",
    target:[],
    currentTarget:0,
    status:anra.CREATE,
    run:function (progress) {

    }
});

/**
 *场景
 */
anra.Scene = anra.Composite.extend({
    id:"scene",
    class:"anra.Scene",
    roles:null,
    items:null,
    lifeCycle:anra.STOP,
    infoPanel:null,
    landPainter:null,
    /*屏幕位置信息*/
    screenX:0,
    screenY:0,
    progressBar:null,
    imageRegistry:null,
    constructor:function () {
        this.roles = new Map();
        this.items = new Map();
    },
    setFocus:function () {
        anra.Platform.getDisplay().setFocusOwner(this);
    },
    createProgressBar:function (o, gc) {
        if (this.progressBar == null) {
            this.progressBar = new anra.ProgressBar(o, gc);
        }
        return this.progressBar;
    },
    loading:function (o, gc) {
        if (!this.progressBar.progress()) {
            this.progressBar.next();
        }
        return this.progressBar.isDone;
    },
    addRole:function (p) {
        var list = this.roles.get(p.camp);
        if (list == null) {
            list = [];
            this.roles.set(p.camp, list);
        }
        list.push(p);
        p.parent = this;
    },
    onCreate:function (o, gc) {
        if (this.lifeCycle == anra.STOP) {

            // 初始化进度条
            this.createProgressBar(o, gc);
            // 初始化图片注册器
            var imageRegistry = anra.ImageRegistry;

            //TODO 地形加载
            if (this.landPainter != null && this.landPainter.registry !== null) {
                var landPool = this.landPainter.registry.pool;
                if (landPool != null && landPool.size > 0) {
                    var landInitTask = new anra.ProgressTask();
                    landInitTask.title = '加载地形';
                    landInitTask.total = landPool.size;

                    landInitTask.init = function () {
                        var t = this.target;
                        landPool.forEach(function (e) {
                            t.push(e);
                        });
                    };
                    landInitTask.run = function (progress) {
                        if (this.currentTarget == this.target.length - 1) {
                            this.status = anra.STOP;
                            return;
                        }
                        var t = this.target[this.currentTarget];
                        var loaded = t.imageURL != null ? imageRegistry.isLoaded(t.imageURL) : true;
                        if (loaded) {
                            progress.worked(1);
                            this.currentTarget++;
                            return;
                        }
                    };
                    this.progressBar.addTask(landInitTask);
                }
            }

            this.lifeCycle = anra.CREATE;
            if (this.landPainter != null) {
                this.landPainter.create(this, o, gc);
            }
            this.create(o, gc);
            var scene = this;

            this.roles.forEach(function (value, key) {
                for (var i = 0; i < value.length; i++) {
                    value[i].create(scene, o, gc);
                }
            });

//            anra.util.handle(this.roles, function (ev) {
//                ev.create(scene, o, gc);
//            });

            return true;
        }
        return false;
    },
    onStart:function (o, gc) {
        if (!this.loading(o, gc)) {
            return false;
        }
        if (this.lifeCycle == anra.CREATE) {
            this.lifeCycle = anra.RESUME;
            this.start(o, gc);
//            anra.util.handle(this.roles, function (ev) {
//                ev.start(o, gc);
//            });

            this.roles.forEach(function (value, key) {
                for (var i = 0; i < value.length; i++) {
                    value[i].start(o, gc);
                }
            });

            return true;
        }
        return false;
    },
    onResume:function (o, gc) {
        if (this.lifeCycle = anra.RESUME) {
            gc.clearRect(0, 0, o.width, o.height);
            if (this.landPainter != null) {
                this.landPainter.paint(this, o, gc);
            }
            this.updateInfo(o, gc);
            this.resume(o, gc);
            this.roles.forEach(function (value, key) {
                for (var i = 0; i < value.length; i++) {
                    value[i].act();
                    value[i].paint(o, gc);
                }
            });
        }
        return false;
    },
    onPause:function () {
        return false;
    },
    onStop:function () {
        return false;
    },
    onDestroy:function () {
        return false;
    },
    create:function (o, gc) {
        return true;
    },
    start:function () {
    },
    resume:function (o, gc) {

    },
    stop:function () {
    },
    destroy:function () {
    },
    updateInfo:function (o, gc) {
    },
    findWidgetOnXY:function (x, y) {
        //TODO findWidgetOnXY
        var target = null;
        this.roles.forEach(function (o) {
            if (target != null)
                return;
            for (var i = 0; i < o.length; i++) {
                var t = o[i];
                if (anra.Rectangle.contains(t, x, y)) {
                    target = t.findWidgetOnXY(x, y);
                    return true;
                }
            }
        });

        this.items.forEach(function (o) {
            if (target != null)
                return;
            for (var i = 0; i < o.length; i++) {
                var t = o[i];
                if (anra.Rectangle.contains(t, x, y)) {
                    target = t.findWidgetOnXY(x, y);
                    return true;
                }
            }
        });
        if (target != null)
            return target;
        return this;
    }
});

/**
 *路由器
 */
anra.Router = Base.extend({
    x:0,
    y:0,
    h:0,
    scene:null,
    arrived:false,
    nodes:[],
    currentNode:0,
    /*计算路由，可以是算出一个节点列表（节点需要均匀分布），或者提供一个位移公式*/
    route:function (x, y, tx, ty, speed) {
        var absX = Math.abs(x - tx);
        var absY = Math.abs(y - ty);
        var h = Math.sqrt(absX * absX + absY * absY);
        this.h = speed / h;
    },
    /*是否已经抵达当前节点*/
    isArrived:function (x, y, tx, ty) {
        return x == tx && y == ty;
    },
    /*是否还有下一个节点*/
    hasNext:function (x, y, tx, ty) {
        return this.currentNode < this.nodes.length;
    },
    /*获取下一个节点，返回null则没有下一个节点*/
    next:function (x, y, tx, ty, speed) {

    },
    /*计算下一帧的位置*/
    applyMove:function (x, y, tx, ty, speed) {
        var s = 5;

        if (tx != x)
            x += s * (tx > x ? 1 : 0 - 1);

        if (ty != y)
            y += s * (ty > y ? 1 : 0 - 1);

        return [x, y];
    }

});

/**
 *角色
 */
anra.Role = anra.Composite.extend({
    id:"role",
    camp:0,
    speed:600,
    scene:null,
    isActive:true,
    lifeCycle:anra.STOP,
    status:anra.status.WAITING,
    router:null,
    actions:null,
    animations:null,
    actListeners:null,
    xOffset:0,
    yOffset:0,
    constructor:function () {
        this.actions = new Map();
        this.animations = new Map();
        this.router = new anra.Router();
    },
    setFocus:function () {
        anra.Platform.getDisplay().setFocusOwner(this);
    },
    create:function (scene, o, gc) {
        this.scene = scene;
        if (this.router != null)
            this.router.scene = scene;
        console.log("Role " + this.id + " create");

        this.registActions();
    },
    registActions:function () {
        //TODO 注册默认事件
        var action = new anra.MoveAction();
        this.actions.set(action.id, action);

        action = new anra.WaitingAction();
        this.actions.set(action.id, action);
    },
    start:function (o, gc) {
        console.log("Role " + this.id + " start");
    },
    paint:function (o, gc) {
        gc.fill();
        gc.save();
        gc.fillStyle = 'yellow';
        gc.globalAlpha = 0.3;
        gc.fillRect(this.x + this.xOffset, this.y + this.yOffset, this.width + this.xOffset, this.height + this.yOffset);
        gc.restore();
        if (this.image != null)
            gc.drawImage(this.image, this.x + this.xOffset, this.y + this.yOffset, this.width + this.xOffset, this.height + this.yOffset);
    },
    tx:this.x,
    ty:this.y,
    /*下达移动指令*/
    move:function (targetX, targetY) {
        this.tx = targetX;
        this.ty = targetY;
        this.router.route(this.x, this.y, this.tx, this.ty, this.speed);
        this.router.currentNode = 0;
        this.setStatus(anra.status.MOVING);
    },
    /*滞空时间，高度，距离*/
    jump:function (time, height, distance) {
        //this.yOffset=30;
        //this.setStatus(anra.status.JUMPING);
    },
    /*下达等待指令*/
    wait:function () {
        this.status = anra.status.WAITING;
        this.tx = this.x;
        this.ty = this.y;
    },
    /*决定下一帧的动作*/
    act:function () {
        if (!this.isActive)
            return;

        var action = this.actions.get(this.status);
        if (action != null) {
            action.run(this);
        } else {
            this.doCustomAction(this.status);
        }

        var anime = this.animations.get(this.status);
        if (anime != null) {
            anime.play(this);
        }
    },
    setStatus:function (status) {
        if (this.status != status) {
            var oldStatus = this.status;
            this.status = status;
            this.fireActChange({oldStatus:oldStatus, newStatus:this.status, source:this, scene:this.scene});
        }
    },
    doCustomAction:function (status) {
        //TODO do custom action
        //console.log("custom:"+status);
    },
    addActListener:function (listener) {
        if (this.actListeners == null)
            this.actListeners = [];
        this.actListeners.push(listener);
    },
    removeActListener:function (listener) {
        if (this.actListeners != null)
            this.actListeners.pop(listener);
    },
    fireActChange:function (evt) {
        if (this.actListeners != null)
            for (var i = 0, len = this.actListeners.length; i < len; i++) {
                this.actListeners[i].actChanged(evt);
            }
    },
    crush:function (target) {
    },
    dispose:function () {
        this.scene.roles.get(this.camp).pop(this);
        this.actions.clear();
    },
    findWidgetOnXY:function (x, y) {
        return this;
    }
});


/**
 *碰撞检查
 */
anra.CrushListener = anra.Listener.extend({
    actChanged:function (evt) {
        if (evt.type == anra.status.MOVING) {
            var roles = evt.scene.roles;
            anra.util.handle(roles, function (v) {
                if ((evt.source.x > v.x ? (evt.source.x - v.x < evt.source.width) : (v.x - evt.source.x < v.width))
                    && (evt.source.y > v.y ? (evt.source.y - v.y < evt.source.height) : (v.y - evt.source.y < v.height))) {
                    evt.source.crush(v);
                }
            }, {
                accept:function (key) {
                    /*排除同阵营*/
                    return key == evt.source.camp;
                }
            });
        }
    }
});

/**
 *层 Layer
 */
anra.Layer = {
    /*定位器*/
    locator:{},
    paint:function (evt) {

    }
};

/**
 *动作
 */
anra.MoveAction = anra.Action.extend({
    id:anra.status.MOVING,
    run:function (role) {
        this.preRun(role);
        var node = role.router.next(role.x, role.y, role.tx, role.ty, role.speed);
        if (node == null) {
            role.setStatus(anra.status.WAITING);
        } else {
            var r = role.router.applyMove(role.x, role.y, node[0], node[1], role.speed);
            role.x = r[0];
            role.y = r[1];
        }
    },
    preRun:function(role){

    }
});

anra.MoveSceneAction = anra.Action.extend({
    id:anra.status.MOVING,
    run:function (role) {
        this.beforeRun(role);
        var node = role.router.next(role.scene.x, role.scene.y, role.scene.tx, role.scene.ty, role.speed);
        if (node == null) {
            role.setStatus(anra.status.WAITING);
        } else {
            var r = role.router.applyMove(role.scene.x, role.scene.y, node[0], node[1], role.speed);
            role.scene.x = r[0];
            role.scene.y = r[1];
        }

        this.afterRun(role);
    }
});

anra.WaitingAction = anra.Action.extend({
    id:anra.status.WAITING,
    run:function (role) {
        //console.log("wait");
    }
});
anra.JumpAction = anra.Action.extend({
    id:anra.status.JUMPING,
    run:function (role) {
        var node = role.router.next(role.x, role.y, role.tx, role.ty, role.speed);
        if (node == null) {
            role.setStatus(anra.status.WAITING);
        } else {
            var r = role.router.applyMove(role.x, role.y, node[0], node[1], role.speed);
            role.x = r[0];
            role.y = r[1];
        }//TODO JUMP
    }
});

/**
 *动画
 */
anra.anime = {
    CYCLE:0,
    FALLBACK:1
};
anra.Animation = Base.extend({
    /*10帧切换一次图片*/
    duration:8,
    images:null,
    currentImage:0,
    strategy:anra.anime.FALLBACK,
    postion:1,
    constructor:function () {
        this.images = [];
    },
    addImage:function (imageURL) {
        var img = anra.ImageRegistry.regist(imageURL);
        if (img == null) {
            alert("invalid imageURL: " + imageURL);
            retun;
        }
        this.images.push(img);
    },
    play:function (role) {
        if (this.images.length == 0)
            return;
        var r = anra.Platform.get(anra.Platform.PAINTER);
        if (r.timer % this.duration == 0) {
            this.currentImage += this.postion;
            if (this.currentImage == this.images.length - 1) {
                this.postion = -1;
            } else if (this.currentImage == 0) {
                this.postion = 1;
            }
            role.image = this.images[this.currentImage];
        }
    }
});

anra.Land = anra.Composite.extend({
    paint:function (scene, o, gc, x, i, j) {
    }
});

anra.ActorRouter = anra.Router.extend({

});
/*控制器基类*/
anra.Controller = anra.Role.extend({
    target:null,
    constructor:function (target) {
        this.actions = new Map();
        this.animations = new Map();
        this.target = target;
    }
});

/*方向按键*/
anra.DirectionKeys = anra.Controller.extend({
    registActions:function () {
        var player = this.target;
        var handle=this.handle;
        this.scene.addKeyListener(new anra.Listener(function (ev) {
            if (ev.type == anra.EVENT.KeyDown){
                handle(player,ev.keyCode);
                player.setStatus(ev.keyCode);
            }
        }));
    },
    handle:function(role,keyCode){

    },
    paint:function (o, gc) {

    }
});



var EventUtil = new Object();

/**//*
 此方法用来给特定对象添加事件，oTarget是指定对象,sEventType是事件类型，如click、keydown等，     fnHandler是事件回调函数
 /**/
EventUtil.addEventHandler = function (oTarget, sEventType, fnHandler) {
    //firefox情况下
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    }
    //IE下
    else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    }
    else {
        oTarget["on" + sEventType] = fnHandler;
    }
};
/*
 此方法用来移除特定对象的特定事件，oTarget是指定对象,sEventType是事件类型，如click、keydown等，fnHandler是事件回调函数
 /*  */
EventUtil.removeEventHandler = function (oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = null;
    }
};
/*
 格式化事件，因为IE和其他浏览器下获取事件的方式不同并且事件的属性也不尽相同，通过此方法提供一个一致的事件
 */
EventUtil.formatEvent = function (oEvent) {
    //isIE和isWin引用到一个js文件，判断浏览器和操作系统类型
    if (isIE && isWin) {
        oEvent.charCode = (oEvent.type == "keypress") ? oEvent.keyCode : 0;
        //IE只支持冒泡，不支持捕获
        oEvent.eventPhase = 2;
        oEvent.isChar = (oEvent.charCode > 0);
        oEvent.pageX = oEvent.clientX + document.body.scrollLeft;
        oEvent.pageY = oEvent.clientY + document.body.scrollTop;
        //阻止事件的默认行为
        oEvent.preventDefault = function () {
            this.returnValue = false;
        };
        //将toElement,fromElement转化为标准的relatedTarget
        if (oEvent.type == "mouseout") {
            oEvent.relatedTarget = oEvent.toElement;
        } else if (oEvent.type == "mouseover") {
            oEvent.relatedTarget = oEvent.fromElement;
        }
        //取消冒泡
        oEvent.stopPropagation = function () {
            this.cancelBubble = true;
        };
        oEvent.target = oEvent.srcElement;
        //添加事件发生时间属性，IE没有
        oEvent.time = (new Date).getTime();
    }
    return oEvent;
};
EventUtil.getEvent = function () {
    if (window.event) {
        //格式化IE的事件
        return this.formatEvent(window.event);
    } else {
        return EventUtil.getEvent.caller.arguments[0];
    }
};
