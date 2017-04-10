/**
 * Strong Router Processor
 */

/**
 * 终极强壮版本srp(ssrp)
 * 说明：继承并重写calculateH函数，即open集排序依据H值的计算方式
 */
StrongSingleRouterProcessor = SingleRouterProcessor.extend({
    constructor: function () {
        SingleRouterProcessor.prototype.constructor.call(this);
    },
    router: function () {
        var openList = new Array(),
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

        open.removeObject(point);
        point.set('g', point.get('newG'));
        point.state = Point.notFound;
    },
    addOpenList: function (point, open) {
        point.state = Point.inOpen;
        this.calculateF(point, this.end);
        Util.addSortedList(point, open);
        FindingTool.addFindingPoint(Point.inOpen, point);
    }

});

/*喜闻乐见 SDRP*/
StrongDoubleRouterProcessor = DoubleRouterProcessor.extend({
    constructor: function () {
        DoubleRouterProcessor.prototype.constructor.call(this);
    },
    router: function () {
        var openList = new Array(),
            openBackList = new Array(),
            current, currentBack;

        this.addOpenList(this.start, openList, Point.forward);
        this.addOpenList(this.end, openBackList, Point.backward);

        while (!openList.isEmpty() && !openBackList.isEmpty()) {
            current = this.getMinPoint(openList);
            currentBack = this.getMinPoint(openBackList);

            if (this.flag = this.search(current, openList, Point.forward))
                break;

            if (this.flag = this.search(currentBack, openBackList, Point.backward))
                break;

            FindingTool.addBatchPause();
        }
    },
    addOpenList: function (point, open, direction) {
        point.state = Point.inOpen | direction;
        this.calculateF(point, direction == Point.forward ? this.end : this.start);
        Util.addSortedList(point, open);
        FindingTool.addFindingPoint(point.state, point);
    },
    search: function (point, open, direction) {
        var neighbors = MapStruct.getNeighbors(point),
            tempPoint;
        while (tempPoint = neighbors.pop()) {
            Util.calculateG(tempPoint, point);

            if ((tempPoint.state & direction) != direction &&
                (tempPoint.state & Point.notFound) != Point.notFound) {
                if (direction == Point.forward) {
                    this.forwardPoint = point;
                    this.backwardPoint = tempPoint;
                } else {
                    this.forwardPoint = tempPoint;
                    this.backwardPoint = point;
                }
                return true;
            }

            if ((tempPoint.state & Point.inClosed) == Point.inClosed)
                continue;

            if ((tempPoint.state & Point.inOpen) == Point.inOpen)
                this.removeFromOpen(tempPoint, open);

            if ((tempPoint.state & Point.notFound) == Point.notFound) {
                tempPoint.setParent(point);
                this.addOpenList(tempPoint, open, direction);
            }
        }
        return false;
    },
    removeFromOpen: function (point, open) {
        if (point.get('newG') >= point.get('g'))
            return;

        open.removeObject(point);
        point.set('g', point.get('newG'));
        point.state = Point.notFound;
    }
});


/*广度优先*/
BFS = StrongSingleRouterProcessor.extend({
    constructor: function () {
        StrongSingleRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', sourcePoint.get('g'));
    },
    toString : function() {
        return "BFS";
    }
});

/*贪婪*/
Greed = StrongSingleRouterProcessor.extend({
    constructor: function () {
        StrongSingleRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', DISTANCE(sourcePoint, targetPoint));
    },
    toString : function() {
        return "Greed";
    }
});

/*AStar*/
AStar = StrongSingleRouterProcessor.extend({
    constructor: function () {
        StrongSingleRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', DISTANCE(sourcePoint, targetPoint) + sourcePoint.get('g'));
    },
    toString: function() {
        return "AStar";
    }
});

DoubleBFS = StrongDoubleRouterProcessor.extend({
    constructor: function () {
        StrongDoubleRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', sourcePoint.get('g'));
    },
    toString: function() {
        return "DoubleBFS";
    }
});

DoubleGreed = StrongDoubleRouterProcessor.extend({
    constructor: function () {
        StrongDoubleRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', DISTANCE(sourcePoint, targetPoint));
    },
    toString: function() {
        return "DoubleGreed";
    }
});

DoubleAStar = StrongDoubleRouterProcessor.extend({
    constructor: function () {
        StrongDoubleRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', DISTANCE(sourcePoint, targetPoint) + sourcePoint.get('g'));
    },
    toString: function() {
        return "DoubleAStar";
    }
});

StrongRedirectDoubleRouterProcessor = DoubleRouterProcessor.extend({
    constructor: function () {
        DoubleRouterProcessor.prototype.constructor.call(this);
    },
    router: function () {
        var openList = new Array(),
            openBackList = new Array(),
            current, currentBack;

        this.addOpenList(this.start, this.end, openList, Point.forward);
        this.addOpenList(this.end, this.start, openBackList, Point.backward);

        while (!openList.isEmpty() && !openBackList.isEmpty()) {
            current = this.getMinPoint(openList);
            currentBack = this.getMinPoint(openBackList);

            if (this.flag = this.search(current, currentBack, openList, Point.forward))
                break;

            if (this.flag = this.search(currentBack, current, openBackList, Point.backward))
                break;

            FindingTool.addBatchPause();
        }
    },
    addOpenList: function (point, targetPoint, open, direction) {
        point.state = Point.inOpen | direction;
        this.calculateF(point, targetPoint);
        Util.addSortedList(point, open);
        FindingTool.addFindingPoint(point.state, point);
    },
    search: function (point, targetPoint, open, direction) {
        var neighbors = MapStruct.getNeighbors(point),
            tempPoint;
        while (tempPoint = neighbors.pop()) {
            Util.calculateG(tempPoint, point);

            if ((tempPoint.state & direction) != direction &&
                (tempPoint.state & Point.notFound) != Point.notFound) {
                if (direction == Point.forward) {
                    this.forwardPoint = point;
                    this.backwardPoint = tempPoint;
                } else {
                    this.forwardPoint = tempPoint;
                    this.backwardPoint = point;
                }

                return true;
            }

            if ((tempPoint.state & Point.inClosed) == Point.inClosed)
                continue;

            if ((tempPoint.state & Point.inOpen) == Point.inOpen)
                this.removeFromOpen(tempPoint, open);

            if ((tempPoint.state & Point.notFound) == Point.notFound) {
                tempPoint.setParent(point);
                this.addOpenList(tempPoint, targetPoint, open, direction);
            }
        }
        return false;
    },
    removeFromOpen: function (point, open) {
        if (point.get('newG') >= point.get('g'))
            return;

        open.removeObject(point);
        point.set('g', point.get('newG'));
        point.state = Point.notFound;
    }
});

DoReAs = StrongRedirectDoubleRouterProcessor.extend({
    constructor: function () {
        StrongRedirectDoubleRouterProcessor.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.set('f', DISTANCE(sourcePoint, targetPoint) + sourcePoint.get('g'));
    },
    toString: function() {
        return "DoReAs";
    }
});
