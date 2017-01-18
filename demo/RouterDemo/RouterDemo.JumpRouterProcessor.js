/**
 * Jump Point Search Router Processor
 */
JumpPointSearchBasic = SingleASRouterProcesser.extend({
    constructor: function () {
        SingleRouterProcessor.prototype.constructor.call(this);
    },
    router: function () {
        var openList = [],
            current, temp, neighbors, jump;

        this.addOpenList(this.start, openList);

        while (!openList.isEmpty()) {
            current = this.getMapPoint(openList);

            if (current == this.end) {
                this.flag = true;
                break;
            }

            neighbors = this.getNeighbors(current);

            while (temp = neighbors.pop()) {
                if (!jump = this.findJumpPoint(temp, current))
                    continue;

                Util.octileG(jump, current);

                if (jump.state == Point.inClosed)
                    continue;

                if (jump.state == Point.inOpen)
                    this.removeFromOpen(jump, openList);

                if (jump.state == Point.notFound) {
                    jump.setParent(current);
                    this.addOpenList(jump, openList);
                }
            }
        }
    },
    addOpenList: function (point, open) {
        point.state = Point.inOpen;
        this.calculateF(point, this.end);
        Util.addSortedList(point, open);
        FindingTool.addFindingPoint(Point.inOpen, point);
    },
    removeFromOpen: function (point, open) {
        if (point.getValue('newG') >= point.getValue('g'))
            return;

        open.removeObject(point);
        point.setValue('g', point.getValue('newG'));
        point.state = Point.notFound;
    },
    getNeighbors: function (point) {
        if (point.parent == null)
            return MapStruct.getNeighbors(point);

        if (DIAGONAL)
            return this.getNeighborsDiagonal(point);
        else
            return this.getNeighborsNoDiagonal(point);

    },
    findJumpPoint: function (point, parentParent) {
        if (DIAGONAL)
            this.jumpDiagonal(point, parentParent);
        else
            this.jumpNoDiagonal(point, parentParent);
    },
    getNeighborsDiagonal: function (point) {
        var result = [],
            parent = point.parent,
            x = point.x,
            y = point.y,
            dx, dy,
            isValid = Util.isValid,
            isValidWithDiagonal = Util.isValidWithDiagonal,
            getMapPoint = Util.getMapPoint;

        dx = (x - parent.x) / Math.max(Math.abs(x - parent.x), 1);
        dy = (y - parent.y) / Math.max(Math.abs(y - parent.y), 1);

        if (dx * dy != 0) {
            addPointList(x     , y + dy, result);
            addPointList(x + dx, y     , result);
            
            if (isValidWithDiagonal(new Point(x + dx, y + dy), point))
                result.unshift(getMapPoint(x + dx, y + dy));
            
            if (!isValid(new Point(x - dx, y)) && isValid(new Point(x, y + dy)))
                result.unshift(getMapPoint(x - dx, y + dy));
            
            if (!isValid(new Point(x, y - dy)) && isValid(new Point(x + dx, y)))
                result.unshift(x + dx, y - dy);\
        } else {
            if (isValid(new Point(x + dx, y + dy))) {
                result.unshift(getMapPoint(x + dx, y + dy));
                if(!isValid(new Point(x + dy, y + dx)))
                    result.unshift(getMapPoint(x + dy + dx, y + dx + dy));
                if(!isValid(new Point(x - dy, y - dx)))
                    result.unshift(getMapPoint(x - dy + dx, y - dx + dy));
            }
        }
        
        return result;

    },
    getNeighborsNoDiagonal: function (point) {
        var result = [],
            parent = point.parent,
            x = point.x,
            y = point.y,
            dx, dy;

        dx = (x - parent.x) / Math.max(Math.abs(x - parent.x), 1);
        dy = (y - parent.y) / Math.max(Math.abs(y - parent.y), 1);

        addPointList(x - dy, y - dx, result);
        addPointList(x + dy, y + dx, result);
        addPointList(x + dx, y + dy, result);

        return result;
    },
    jumpDiagonal: function (point, parentParent) {
        var dx = point.x - parentParent.x,
            dy = point.y - parentParent.y,
            px = parentParent.x,
            py = parentParent.y,
            getMapPoint = Util.getMapPoint,
            isValidWithDiagonal = Util.isValidWithDiagonal,
            hasForcedNeighbor = Util.hasForcedNeighbor;

        if (!Util.isValid(point))
            return null;

        if (point == this.end)
            return point;

        if (hasForcedNeighbor(point, dx, dy))
            return point;
        else if (dx * dy != 0) {
            if (this.jumpDiagonal(getMapPoint(x + dx, y), point) || this.jumpDiagonal(getMapPoint(x, y + dy), point))
                return point;
        }

        if (isValidWithDiagonal(new Point(x + dx, y + dy), point))
            this.jumpDiagonal(getMapPoint(x + dx, y + dy), point);
        else
            return null;
    },
    jumpNoDiagonal: function (point, parentParent) {
        var dx = point.x - parentParent.x,
            dy = point.y - parentParent.y,
            px = parentParent.x,
            py = parentParent.y,
            getMapPoint = Util.getMapPoint,
            hasForcedNeighbor = Util.hasForcedNeighbor;

        if (!Util.isValid(point))
            return null;

        if (point == this.end)
            return point;

        if (hasForcedNeighbor(point, dx, dy))
            return point;
        else if (dy != 0) {
            if (this.jumpNoDiagonal(getMapPoint(x + 1, y), point) ||
                this.jumpNoDiagonal(getMapPoint(x - 1, y), point))
                return point;
        } else
            throw new Error("error");

        return this.jumpNoDiagonal(getMapPoints(x + dx, y + dy), point);
    }
});


Jump = JumpPointSearchBasic.extend({
    constructor: function () {
        JumpPointSearchBasic.prototype.constructor.call(this);
    },
    calculateF: function (sourcePoint, targetPoint) {
        sourcePoint.setValue('f', sourcePoint.getValue('g') + DIAGONAL(sourcePoint, targetPoint));
    }
});
