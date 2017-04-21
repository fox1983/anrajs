/*Basic Router Processor(rp)*/
BasicRouterProcessor = Base.extend({
    constructor: function () {},

    /**
     * router计算前重置数据
     */
    reset: function () {
        this.start = MapStruct.getSource();
        this.end = MapStruct.getTarget();
        this.flag = false;
    },

    /**
     * 调用函数
     */
    process: function () {
        this.reset();
        this.router();
    },


    /**
     * 核心router函数
     */
    router: function () {},


    /**
     * 返回整条Path数组点
     * @returns {Array} 点数组
     */
    getPath: function () {},
    
    toString() {}
});

/*Single Router Processor(srp)*/
SingleRouterProcessor = BasicRouterProcessor.extend({
    constructor: function () {
        FindingTool.setType(Point.inOpen, 'green');
        FindingTool.setType(Point.inClosed, 'yellow');
    },
    addOpenList: function (point, list) {
        point.state = Point.inOpen;
        list.unshift(point);
        FindingTool.addFindingPoint(Point.inOpen, point);
    },
    getMinPoint: function (list) {
        var point = list.pop();
        point.state = Point.inClosed;
        FindingTool.addFindingPoint(Point.inClosed, point);

        return point;
    },
    getPath: function () {
        if (this.flag)
            //return Util.calculatePath(this.end);
            return simplify(this.end);
        else
            return null;
    }
});

/*Double*/
DoubleRouterProcessor = BasicRouterProcessor.extend({
    constructor: function () {
        FindingTool.setType(Point.inOpen | Point.forward, 'green');
        FindingTool.setType(Point.inClosed | Point.forward, 'yellow');
        FindingTool.setType(Point.inOpen | Point.backward, 'green');
        FindingTool.setType(Point.inClosed | Point.backward, 'yellow');
    },
    getPath: function ()　 {
        if (this.flag)
            return Util.calculatePath(this.forwardPoint).concat(Util.calculatePath(this.backwardPoint).reverse());

        return null;
    },
    getMinPoint: function (list) {
        var point = list.pop();
        point.state = (point.state - Point.inOpen) | Point.inClosed;
        FindingTool.addFindingPoint(point.state, point);

        return point;
    }
});

/*Breadth First Search*/
BFSRouterProcessor = SingleRouterProcessor.extend({
    constructor: function () {
        SingleRouterProcessor.prototype.constructor.call(this);
    },
    router: function () {
        var processQueue = new Array(),
            currentPoint, tempPoint, neighbors;

        this.addOpenList(this.start, processQueue);

        while (!processQueue.isEmpty()) {
            currentPoint = this.getMinPoint(processQueue);

            if (currentPoint == this.end) {
                this.flag = true;
                break;
            }

            neighbors = MapStruct.getNeighbors(currentPoint);
            while (tempPoint = neighbors.pop()) {

                if (tempPoint.state != Point.notFound)
                    continue;

                tempPoint.setParent(currentPoint);
                this.addOpenList(tempPoint, processQueue);
            }
            FindingTool.addBatchPause();
        }
    },
    toString : function() {
        return "BFSRouterProcessor";
    }
});

/*
 * for test
 */
TestHeapRouterProcessor = SingleRouterProcessor.extend({
    constructor: function() {
        SingleRouterProcessor.prototype.constructor.call(this);
    },
    router: function () {
        var openList = new heap(function(p1, p2) {
            return p1.get('f') - p2.get('f');
        }),
            currentPoint, tempPoint, neighbors;

        this.addOpenList(this.start, openList);

        while (!openList.isEmpty()) {
            currentPoint = this.getMinPoint(openList);

            if (currentPoint == this.end) {
                this.flag = true;
                break;
            }

            neighbors = MapStruct.getNeighbors(currentPoint);
            while (tempPoint = neighbors.pop()) {
                Util.calculateG(tempPoint, currentPoint);

                if (tempPoint.state == Point.inClosed)
                    continue;

                if (tempPoint.state == Point.inOpen)
                    this.removeFromOpen(tempPoint, openList);

                if (tempPoint.state == Point.notFound) {
                    tempPoint.setParent(currentPoint);
                    this.addOpenList(tempPoint, openList);
                }
            }

            FindingTool.addBatchPause();
        }
    },
    removeFromOpen: function (point, open) {
        if (point.get('newG') >= point.get('g'))
            return;

        //open.removeObject(point);
        open.remove(point);
        point.set('g', point.get('newG'));
        point.state = Point.notFound;
    },
    addOpenList: function (point, open) {
        point.state = Point.inOpen;
        this.calculateF(point, this.end);
        open.add(point);
        //Util.addSortedList(point, open);
        FindingTool.addFindingPoint(Point.inOpen, point);
    }
});


HeapBSF = TestHeapRouterProcessor.extend({
    constructor: function() {
        TestHeapRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function(sourcePoint, targetPoint) {
        sourcePoint.set('f', sourcePoint.get('g'));
    },
    toString: function() {
        return "HeapBSF";
    }
});

HeapGreed = TestHeapRouterProcessor.extend({
    constructor: function () {
        TestHeapRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', DISTANCE(sourcePoint, targetPoint));
    },
    toString : function() {
        return "HeapGreed";
    }
});

HeapStar = TestHeapRouterProcessor.extend({
    constructor: function() {
        TestHeapRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function(sourcePoint, targetPoint) {
        sourcePoint.set('f', DISTANCE(sourcePoint, targetPoint) + sourcePoint.get('f'));
    },
    toString: function() {
        return "HeapStar";
    }
});



/*
Jump = SingleRouterProcessor.extend({
    constructor: function () {
        SingleRouterProcessor.prototype.constructor.call(this);
        FindingTool.setType('jump', 'pink');
        //FindingTool.setType('ne', 'blue');
    },
    router: function () {
        var processQueue = new Array(),
            currentPoint, tempPoint, neighbors, jump;

        processQueue.push(this.start);
        this.start.state = Point.inOpen;

        while (!processQueue.isEmpty()) {
            currentPoint = processQueue.pop();
            currentPoint.state = Point.inClosed;

            console.log('----------------------')
            console.log(currentPoint);
            if (currentPoint == this.end) {
                this.flag = true;
                break;
            }

            FindingTool.addFindingPoint(Point.inClosed, currentPoint);

            neighbors = this.getNeighbors(currentPoint);
            while (tempPoint = neighbors.pop()) {
                console.log(tempPoint.x + ',' + tempPoint.y)
                //FindingTool.addFindingPoint('ne', tempPoint);
                jump = this.j(tempPoint, currentPoint);
                if (jump) {
                    if (jump.state == Point.inClosed)
                        continue;
                    this.calculateG(jump, currentPoint);

                    if (jump.state == Point.inOpen && jump.get('newG') < jump.get('g')) {
                        processQueue.removeObject(jump);
                        jump.state = Point.notFound;
                    }

                    if (jump.state == Point.notFound) {
                        this.calculateH(jump, this.end);
                        jump.setParent(currentPoint);
                        Util.addSortedList(jump, processQueue);
                        FindingTool.addFindingPoint(Point.inOpen, jump);
                    }
                }

            }

            FindingTool.addBatchPause();
        }
    },
    calculateH: function (sourcePoint, targetPoint) {
        sourcePoint.set('h', DISTANCE(sourcePoint, targetPoint) + sourcePoint.get('g'));
    },
    calculateG: function (point, prePoint) {
        var key = point.get('g') == null ? 'g' : 'newG';
        if (!DIAGONAL) {
            point.set(key, RE + prePoint.get('g'));
            return;
        }

        var l = this.octile(Math.abs(point.x - prePoint.x), Math.abs(point.y - prePoint.y));
        if (point.x != prePoint.x && point.y != prePoint.y)
            point.set(key, l + prePoint.get('g'));
        else
            point.set(key, l + prePoint.get('g'));
    },
    j: function (point, fpoint) {
        var dx = point.x - fpoint.x,
            dy = point.y - fpoint.y,
            x = point.x,
            y = point.y;
        if (!Util.isValid(point))
            return null;

        FindingTool.addFindingPoint('jump', point);
        FindingTool.addBatchPause();

        if (point == this.end)
            return point;

        if (dx != 0) {
            if (Util.isValid(new Point(x, y - 1)) && !Util.isValid(new Point(fpoint.x, y - 1)) ||
                Util.isValid(new Point(x, y + 1)) && !Util.isValid(new Point(fpoint.x, y + 1)))
                return point;
        } else if (dy != 0) {
            if (Util.isValid(new Point(x - 1, y)) && !Util.isValid(new Point(x - 1, fpoint.y)) ||
                Util.isValid(new Point(x + 1, y)) && !Util.isValid(new Point(x + 1, fpoint.y)))
                return point;
            if (this.j(Util.getMapPoint(x + 1, y), point) ||
                this.j(Util.getMapPoint(x - 1, y), point))
                return point;
        } else
            throw new Error("gggggg");

        return this.j(Util.getMapPoint(x + dx, y + dy), point);
    },
    octile: function (dx, dy) {
        var F = Math.SQRT2 - 1;
        return (dx < dy) ? F * dx + dy : F * dy + dx;
    },
    getNeighbors: function (point) {
        var result = [];
        var x = point.x,
            y = point.y;

        var ox = this.end.x - x,
            oy = this.end.y - y;
        if (point.parent) {
            var dx = (x - point.parent.x) / Math.max(Math.abs(x - point.parent.x), 1),
                dy = (y - point.parent.y) / Math.max(Math.abs(y - point.parent.y), 1);

            if (dx != 0) {
                
                if (oy > 0) {
                
                if (Util.isValid(Util.getMapPoint(x, y + 1)))
                    result.push(Util.getMapPoint(x, y + 1));

                if (Util.isValid(Util.getMapPoint(x, y - 1)))
                    result.push(Util.getMapPoint(x, y - 1));
                } else {
                  if (Util.isValid(Util.getMapPoint(x, y - 1)))
                    result.push(Util.getMapPoint(x, y - 1));

                if (Util.isValid(Util.getMapPoint(x, y + 1)))
                    result.push(Util.getMapPoint(x, y + 1));  
                }

                if (Util.isValid(Util.getMapPoint(x + dx, y)))
                    result.push(Util.getMapPoint(x + dx, y));
            } else if (dy != 0) {
                
                if (ox > 0) {
                
                if (Util.isValid(Util.getMapPoint(x + 1, y)))
                    result.push(Util.getMapPoint(x + 1, y));

                if (Util.isValid(Util.getMapPoint(x - 1, y)))
                    result.push(Util.getMapPoint(x - 1, y));
                }
                else {
                    if (Util.isValid(Util.getMapPoint(x - 1, y)))
                    result.push(Util.getMapPoint(x - 1, y));

                if (Util.isValid(Util.getMapPoint(x + 1, y)))
                    result.push(Util.getMapPoint(x + 1, y));
                }

                if (Util.isValid(Util.getMapPoint(x, y + dy)))
                    result.push(Util.getMapPoint(x, y + dy));
            }
        } else {
            result = this.getDNS(point, ox, oy);
        }

        return result;
    },
    getDNS: function (point, ox, oy) {
        var result = [],
            x = point.x,
            y = point.y;
        var north = Util.getMapPoint(x, y - 1),
            west = Util.getMapPoint(x - 1, y),
            south = Util.getMapPoint(x, y + 1),
            east = Util.getMapPoint(x + 1, y);

        if (oy > 0) {
            if (Util.isValid(south)) result.unshift(south);
            if (Util.isValid(north)) result.unshift(north);
        } else {
            if (Util.isValid(north)) result.unshift(north);
            if (Util.isValid(south)) result.unshift(south);
        }

        if (ox > 0) {
            if (Util.isValid(east)) result.unshift(east);
            if (Util.isValid(west)) result.unshift(west);
        } else {
            if (Util.isValid(west)) result.unshift(west);
            if (Util.isValid(east)) result.unshift(east);
        }
        return result;
    }
});
*/
