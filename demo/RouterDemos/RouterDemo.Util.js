/**
 * RouterDemo 工具类
 */



calculatePath = function (point) {
    if (point == null)
        return [];

    var points = [];
    while (point.parent) {
        points.unshift(relativeToAbsolute(point));
        point = point.parent;
    }
    points.unshift(relativeToAbsolute(point));

    return points;
};
Util.calculatePath = calculatePath;

absoluteToRelative = function (point) {
    if (point == null)
        return null;

    var resultPoint = new Point();

    resultPoint.x = Math.floor(point.x / WIDTH);
    resultPoint.y = Math.floor(point.y / WIDTH);

    return resultPoint;
};
Util.absoluteToRelative = absoluteToRelative;

relativeToAbsolute = function (point) {
    if (point == null)
        return null;

    var resultPoint = new Point();

    resultPoint.x = point.x * WIDTH + WIDTH / 2;
    resultPoint.y = point.y * WIDTH + WIDTH / 2;

    return resultPoint;
};
Util.relativeToAbsolute = relativeToAbsolute;

equals = function (arg1, arg2) {
    if (typeof arg1 != typeof arg2)
        return false;

    var type = typeof arg1;

    if (type == 'undefined')
        return false;

    if (type == 'string' || type == 'number' || type == 'boolean')
        if (arg1 == arg2)
            return true;
        else
            return false;

    if (arg1 == null && arg2 == null)
        return true;

    for (var key in arg1)
        if (!this.equals(arg1[key], arg2[key]))
            return false;

    return true;
};
Util.equals = equals;

getMapPoint = function (x, y) {
    var key = x + '_' + y;

    if (MapStruct.struct.has(key))
        return MapStruct.get(key);

    MapStruct.struct.put(key, new Point(x, y));

    return MapStruct.get(key);
};
Util.getMapPoint = getMapPoint;

isValid = function (point) {
    if (MapStruct.wallStruct.has(point.toString()))
        return false;

    if (point.x < 0 || point.y < 0 || point.x > VERTIVAL_VALUE || point.y > VERTIVAL_VALUE)
        return false;

    return true;
};
Util.isValid = isValid;

isValidWithDiagonal = function (point, parent) {
    if (!isValid(point))
        return false;

    if (MapStruct.wallStruct.has(parent.x + '_' + point.y) &&
        MapStruct.wallStruct.has(point.x + '_' + parent.y))
        return false;

    return true;
};
Util.isValidWithDiagonal = isValidWithDiagonal;

addSortedList = function (point, list) {
    var high = list.length - 1,
        low = 0,
        mid;

    if (high < 0) {
        list.push(point);
        return;
    }

    while (low <= high) {
        mid = Math.floor((high + low) / 2);

        if (list[mid].getValue('f') > point.getValue('f'))
            low = mid + 1;
        else
            high = mid - 1;
    }

    list.insert(point, low);
};
Util.addSortedList = addSortedList;

calculateG = function (point, prePoint) {
    var key = point.getValue('g') == null ? 'g' : 'newG';
    if (!DIAGONAL) {
        point.setValue(key, RE + prePoint.getValue('g'));
        return;
    }

    if (point.x != prePoint.x && point.y != prePoint.y)
        point.setValue(key, BE + prePoint.getValue('g'));
    else
        point.setValue(key, RE + prePoint.getValue('g'));
};
Util.calculateG = calculateG;

octileG = function (point, prePoint) {
    point.setValue(point.getValue('g') == null ? 'g' : 'newG',
        octile(point, prePoint) + prePoint.getValue('g'));
};
Util.octileG = octileG;

octile = function (sourcePoint, parentPoint) {
    var dx = Math.abs(sourcePoint.x - parentPoint.x),
        dy = Math.abs(sourcePoint.y - parentPoint.y);

    var F = (Math.SQRT2 - 1) * RE;
    return (dx < dy) ? F * dx + dy * RE : F * dy + dx * RE;
}
Util.octile = octile;

manhattanDistance = function (sourcePoint, targetPoint) {
    return Math.abs(sourcePoint.x - targetPoint.x) * RE + Math.abs(sourcePoint.y - targetPoint.y) * RE
};

eulerDistance = function (sourcePoint, targetPoint) {
    var x = Math.abs(sourcePoint.x - targetPoint.x) * RE,
        y = Math.abs(sourcePoint.y - targetPoint.y) * RE;

    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

hasForcedNeighbor = function (point, dx, dy) {
    var x = point.x,
        y = point.y,
        north, east, south, west, k;

    if (dx * dy != 0) {
        north = y + dy; east = x + dx;
        south = y - dy; west = x - dx;
        
        if (isValid(new Point(west, north)) && !isValid(new Point(west, y)) ||
            isValid(new Point(east, south)) && !isValid(new Point(x, south)))
            return true;
    } else {
        north = y + dx; east = x + dy;
        south = y - dx; west = x - dy;
        k = DIAGONAL ? 1 : 0;
        
        if (isValid(new Point(east + k*dx, north + k*dy)) && !isValid(new Point(east - dx + k*dx, north - dy + k*dy)) ||
            isValid(new Point(west + k*dx, south + k*dy)) && !isValid(new Point(west - dx + k*dx, south - dy + k*dy)))
            return true;
    }

    return false;
};
Util.hasForcedNeighbor = hasForcedNeighbor;

addPointList = function (x, y, list) {
    if (isValid(new Point(x, y)))
        list.unshift(getMapPoint(x, y))
};
