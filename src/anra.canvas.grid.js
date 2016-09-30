/**
 * 提供canvas需要的模版
 */
anra.grid = {};

/**
 *网格配置类
 */
anra.grid.Config = Base.extend({
    size:30
});
/**
 *网格场景
 */
anra.grid.GridScene = anra.Scene.extend({
    config:new anra.grid.Config(),
    create:function (o, gc) {
        return true;
    },
    resume:function (o, gc) {
        var h = o.width / this.config.size;

        /*绘制背景*/
        gc.save();
        gc.strokeStyle = '#111';
        for (var i = 1; i < h; i++) {

            gc.beginPath();
            gc.moveTo(0, i * this.config.size);
            gc.lineTo(o.width, i * this.config.size);
            gc.stroke();


            gc.beginPath();
            gc.moveTo(i * this.config.size, 0);
            gc.lineTo(i * this.config.size, o.height);
            gc.stroke();

        }
        gc.restore();
        return true;
    }
});


/**
 *网格路由器
 */
anra.grid.GridRouter = anra.Router.extend({
    position:null,
    constructor:function () {
        this.position = [];
    },
    route:function (x, y, tx, ty, speed) {
        this.nodes = [];
        this.speed = Math.round(speed / 1000 * 16);


        //TODO route
        this.i = Math.ceil(x / this.config.size);
        this.j = Math.ceil(y / this.config.size);
        this.ti = Math.ceil(tx / this.config.size) - 1;
        this.tj = Math.ceil(ty / this.config.size) - 1;

        var m = this.i, n = this.j;
        var arrived;
        var size = this.config.size;
        while (true) {
            arrived = 0;
            if (m == this.ti)
                arrived++;
            else
                m = m + (m > this.ti ? -1 : 1);

            if (n == this.tj)
                arrived++;
            else
                n = n + (n > this.tj ? -1 : 1);

            this.nodes.push([m * size, n * size]);
            if (arrived == 2)
                break;
        }
        this.nodes.pop(0);
    },
    isArrived:function (x, y, tx, ty) {
        return x == tx && y == ty;
    },
    next:function (x, y, tx, ty, speed) {
        if (!this.hasNext())
            return null;
        var node = this.nodes[this.currentNode];
        if (this.isArrived(x, y, node[0], node[1])) {
            node = this.nodes[++this.currentNode];
        }
        return node;
    },

    /*计算下一帧的位置*/
    applyMove:function (x, y, tx, ty, speed) {
        var s = this.speed;
        if (tx != x)
            x += s * (tx > x ? 1 : -1);
        if (Math.abs(tx - x) < s)
            x = x - Math.abs(tx - x);
        if (ty != y)
            y += s * (ty > y ? 1 : -1);
        if (Math.abs(ty - y) < s)
            y = y - Math.abs(ty - y);
        return [x, y];
    }
});


/**
 *网格地形绘制器
 */
anra.grid.LandPainter = anra.LandPainter.extend({
    create:function (scene, o, gc) {
        this.width = Math.ceil(o.width / scene.config.size);
        this.height = Math.ceil(o.height / scene.config.size);
    },
    paint:function (scene, o, gc) {
        var si = Math.ceil(scene.screenY / scene.config.size);
        var sj = Math.ceil(scene.screenX / scene.config.size);
        for (var i = si, iLen = this.height + si; i < iLen; i++) {
            if (i > this.config.length) {
                continue;
            }
            for (var j = sj, jLen = this.height + sj; j < jLen; j++) {
                if (this.config[i] == null) {
                    continue;
                }
                var land = this.registry.pool.get(this.config[i][j]);
                land.paint(o, gc, (j - sj) * scene.config.size, (i - si) * scene.config.size, scene.config.size, scene.config.size);
            }
        }
    }
});

/**
 *碰撞检查
 */
anra.grid.CrushListener = {
    actChanged:function (evt) {
        if (evt.type == anra.status.MOVING) {
//            var roles = evt.scene.roles;
//            anra.util.handle(roles, function (v) {
//                if (evt.source.x == v.x && evt.source.y == v.y) {
//                    evt.source.crush(v);
//                }
//
//            }, {
//                accept:function (key) {
//                    /*排除同阵营*/
//                    return key == evt.source.camp;
//                }
//            });
        }
    }
};


/**
 * A*路由
 *
 */
anra.grid.AStarRouter = anra.grid.GridRouter.extend({
    levels:null,
    constructor:function () {
        this.levels = new Map();
    },
    clear:function () {
        this.nodes = [];
        this.openList = null;
        this.closedList = null;
    },
    route:function (x, y, tx, ty, speed) {
        var startTime = new Date().getTime();
        var scene = anra.Platform.getCurrentScene();
        //初始化速度
        this.speed = Math.round(speed / 1000 * 16);

        //TODO 绝对坐标转变为网格坐标

        var si = Math.ceil(scene.screenX / this.config.size);
        var sj = Math.ceil(scene.screenY / this.config.size);

        this.i = Math.ceil(x / this.config.size) + si;
        this.j = Math.ceil(y / this.config.size) + sj;
        this.ti = Math.ceil(tx / this.config.size) - 1 + si;
        this.tj = Math.ceil(ty / this.config.size) - 1 + sj;


        //地形注册机
        this.landConfig = scene.landPainter.config;
        var targetLandId = this.landConfig[this.tj][this.ti];

        var level = this.levels.get(targetLandId);
        if (level == null) {
            this.clear();
            return;
        }

        this.nodes = [];
        var openList = [];
        var closedList = [];
        this.openList = openList;
        this.closedList = closedList;

        //TODO
        var startNode = ANodeFactory.create(this, this.i, this.j);
        var endNode = ANodeFactory.create(this, this.ti, this.tj);
        openList.push(startNode);
        var minFNode = null;

        var BIopenList = [];
        BIopenList.push(endNode);
        var BIclosedList = [];
        var BIminFNode = null;
        var middleNode = null;

        while (true) {
            minFNode = anra.AStarUtil.findMinNode(openList);
            openList.removeObject(minFNode);
            if (!closedList.contains(minFNode))
                closedList.push(minFNode);

            if (closedList.length > 500) {
                return;
            }
            if (minFNode == null || minFNode.equals(endNode))
                break;
            anra.AStarUtil.search(this, minFNode, openList, closedList, endNode);
            BIminFNode = anra.AStarUtil.findMinNode(BIopenList);
            BIopenList.removeObject(BIminFNode);
            if (!BIclosedList.contains(BIminFNode))
                BIclosedList.push(BIminFNode);

            if (BIclosedList.length > 500) {
                return;
            }
            if (BIminFNode == null || BIminFNode.equals(startNode))
                break;
            anra.AStarUtil.search(this, BIminFNode, BIopenList, BIclosedList, startNode);
            for (var i = 0; i < openList.length; i++) {
                for (var j = 0; j < BIopenList.length; j++) {
                    if (BIopenList[j].equals(openList[i])) {
                        BIminFNode = BIopenList[j];
                        minFNode = openList[i];
                        middleNode = minFNode;
                        break;
                    }
                }
                if (middleNode)
                    break;
            }
            if (middleNode)
                break;
        }
        if (minFNode != null) {
            n = BIminFNode.parent;
            var tmp = [];
            while (true) {
                if (n == null)
                    break;
                tmp.push(n);
                n = n.parent;
            }
            tmp[0].parent = minFNode;
            for (var i = tmp.length - 1; i > 0; i--) {
                tmp[i].parent = tmp[i - 1];
            }
            minFNode = tmp[tmp.length - 1];
            anra.AStarUtil.smooth(this, minFNode, startNode);
            this.minFNode = minFNode;
        }

        var size = this.config.size;
        var n = minFNode.parent;
        if (n != null)
            while (true) {
                this.nodes.push([n.i * size, n.j * size]);
                n = n.parent;
                if (n == null)
                    break;
            }
        this.nodes.reverse();
        // this.nodes.pop(0);
        this.nodes.push([this.ti * size, this.tj * size]);

        console.log("time:" + (new Date().getTime() - startTime));
    }
});

/**
 *A*工具类
 */
anra.AStarUtil = {
    findMinNode:function (openList) {
        if (openList.length == 0)
            return null;
        else if (openList.length == 1)
            return openList[0];
        openList.sort(function (a, b) {
            return a.f() - b.f();
        });
        return openList[0];
    },
    /*搜索*/
    search:function (router, node, openList, closedList, endNode) {
        var nodes = this.findAroundNode(router, node);
        if (nodes == null)
            return;
        for (var i = 0; i < 8; i++) {
            if (nodes[i] == null || nodes[i].level == null)continue;
            nodes[i].g = (i > 3 ? nodes[i].level[0]
                : nodes[i].level[1]) + node.g;
            nodes[i].h = this.caculateH(nodes[i], endNode);
            if (closedList.contains(nodes[i])) {
                continue;
            }
            if (!openList.contains(nodes[i])) {
                openList.push(nodes[i]);
                nodes[i].parent = node;
            } else {
                var idx = openList.indexOf(nodes[i]);
                var n = openList[idx];
                if (nodes[i].g < n.g) {
                    openList.remove(idx);
                    closedList.push(n);
                    nodes[i].parent = n.parent;
                    openList.splice(idx, 0, nodes[i]);
                }
            }
        }
    },
    /*查找指定节点周围的可用节点*/
    findAroundNode:function (router, node) {
        if (node == null)return null;
        var nodes = [];

        nodes[0] = ANodeFactory.create(router, node.i, node.j + 1);
        nodes[1] = ANodeFactory.create(router, node.i, node.j - 1);
        nodes[2] = ANodeFactory.create(router, node.i + 1, node.j);
        nodes[3] = ANodeFactory.create(router, node.i - 1, node.j);

        nodes[4] = ANodeFactory.create(router, node.i - 1, node.j + 1);
        nodes[5] = ANodeFactory.create(router, node.i + 1, node.j - 1);
        nodes[6] = ANodeFactory.create(router, node.i + 1, node.j + 1);
        nodes[7] = ANodeFactory.create(router, node.i - 1, node.j - 1);

        return nodes;
    },
    caculateH:function (p, endNode) {
        return (Math.abs(endNode.i - p.i) + Math.abs(endNode.j
            - p.j))
            * p.level[0];
    },
    /*裁剪多余节点*/
    smooth:function (router, node, startNode) {
        var fatherNode, currentNode = node, grandNode;
        // 去除共线(暂时关闭，在特殊情况会导致找不到最佳路径)
        while (false) {
            fatherNode = currentNode.parent;
            if (fatherNode == null)
                break;
            grandNode = fatherNode.parent;
            if (grandNode == null)
                break;
            // if ((fatherNode.i == currentNode.i && currentNode.i == grandNode.i)
            //         || (fatherNode.j == currentNode.j && currentNode.j == grandNode.j)) {
            if (fatherNode.level == grandNode.level && (grandNode.i - currentNode.i ) * (fatherNode.j - currentNode.j) == (grandNode.j - currentNode.j) * (fatherNode.i - currentNode.i)) {
                currentNode.parent = grandNode;
            } else
                currentNode = fatherNode;
        }
        currentNode = node;

        //优化速度，统计一个双向链表出来，最差结果可以提高3倍速度
        fatherNode = currentNode;
        var lastNode, childNode;
        while (true) {
            if (fatherNode == null)
                break;
            if (fatherNode.parent == null) {
                lastNode = fatherNode;
                break;
            }
            fatherNode.parent.child = fatherNode;
            fatherNode = fatherNode.parent;
        }

        while (true) {
            childNode = lastNode;
            while (true) {
                if (childNode == null || childNode.equals(currentNode) || childNode.equals(currentNode.parent))
                    break;

                var result = this.connectable(router, currentNode, childNode);
                if (typeof result == 'boolean') {
                    if (result) {
                        currentNode.parent = childNode;
                        break;
                    }
                } else {
                    //TODO
                    currentNode.parent = result;
                    result.parent = childNode;
                    break;
                    // grandNode=result;
                }
                childNode = childNode.child;
            }
            currentNode = currentNode.parent;
            if (currentNode == null)
                break;

        }

    },
    /*source和target之间无障碍物则认为可连线*/
    connectable:function (router, source, target) {
        /*
         *分四种情况处理： 
         * 1、i相等 查询横坐标为i，纵坐标落在j1和j2之间的所有点
         * 2、j相等 查询纵坐标为j，横坐标落在i1和i2之间的所有点
         * 3、(i1-i2)==(j1-j2)
         * 4、其他
         */
        if (source.level.toString() != target.level.toString())
            return false;

        /*偏移量*/
        var ioffset = Math.abs(source.i - target.i);
        var joffset = Math.abs(source.j - target.j);

        /*变化趋势*/
        var dx = source.i > target.i ? -1 : 1;
        var dy = source.j > target.j ? -1 : 1;

        /*初始值*/
        var m = source.i, n = source.j;
        var level;

        if (ioffset != joffset && ioffset != 0 && joffset != 0) {
            if (ioffset == 1 || joffset == 1)
                return false;
            //计算折点
            var bendPoint1, bendPoint2;
            if (ioffset > joffset) {
                var i1 = target.i - dx * joffset, i2 = source.i + dx * joffset;
                bendPoint1 = ANodeFactory.create(router, i1, source.j);
                bendPoint2 = ANodeFactory.create(router, i2, target.j);
            } else {
                var j2 = source.j + dy * ioffset, j1 = target.j - dy * ioffset;
                bendPoint1 = ANodeFactory.create(router, source.i, j1);
                bendPoint2 = ANodeFactory.create(router, target.i, j2);
            }
            if (bendPoint1 != null && this.connectable(router, source, bendPoint1) && this.connectable(router, bendPoint1, target)) {
                return bendPoint1;
            }
            if (bendPoint2 != null && this.connectable(router, source, bendPoint2) && this.connectable(router, bendPoint2, target)) {
                return bendPoint2;
            }
            return false;
        } else {
            while (true) {
                if (m != target.i)
                    m = m + dx;
                if (n != target.j)
                    n = n + dy;
                level = ANodeFactory.getLandLevel(router, m, n);
                if (level == null) {
                    return false;
                }
                if (m == target.i && n == target.j)
                    break;
            }
        }
        return true;
    }
};

/**
 *A*节点
 */
anra.grid.ANode = Base.extend({
    parent:null,
    i:0,
    j:0,
    g:0,
    h:0,
    level:null,
    constructor:function () {
        this.level = [];
    },
    f:function () {
        return this.g + this.h;
    },
    equals:function (o) {
        if (o == null)
            return null;
        return this.i == o.i && this.j == o.j;
    }
});

ANodeFactory = {
    getLandLevel:function (router, i, j) {
        var scene = anra.Platform.getCurrentScene();
        var landConfig = scene.landPainter.config;
        var lc_columns = landConfig[j];
        if (lc_columns == null) {
            return null;
        }
        var landId = lc_columns[i];

        if (isNaN(landId) || landId == null) {
            return null;
        }
        var level = router.levels.get(landId);
        return level;

    },
    create:function (router, i, j) {
        var node = new anra.grid.ANode();
        var level = this.getLandLevel(router, i, j);
        if (level == null)return null;
        node.level = level;
        node.i = i;
        node.j = j;
        return node;
    }
};
