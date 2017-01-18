/*routerProcessor*/
CommonRouterProcessor = Base.extend({
    /*方向字典*/
    verticalDir: [[0, 1], [1, 0], [0, -1], [-1, 0]],
    diagonalDir: [[1, 1], [1, -1], [-1, -1], [-1, 1]],
    allDir: [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]],
    /*起始与终点*/
    origin: null,
    aim: null,
    /*寻路成功标志*/
    flag: false,
    /*返回的寻路结果*/
    points: null,

    /*相对点与绝对点转换*/
    absoluteToRelative: function (point) {
        if (point == null)
            return null;

        var resultPoint = {
            x: null,
            y: null
        };

        resultPoint.x = Math.floor(point.x / MapNodeModel.width);
        resultPoint.y = Math.floor(point.y / MapNodeModel.width);

        return resultPoint;
    },
    relativeToAbsolute: function (point) {
        if (point == null)
            return null;

        var resultPoint = {
            x: null,
            y: null
        };

        resultPoint.x = point.x * MapNodeModel.width + MapNodeModel.width / 2;
        resultPoint.y = point.y * MapNodeModel.width + MapNodeModel.width / 2;

        return resultPoint;
    },
    /*初始化起始点与终点*/
    initPoints: function (line) {
        if (line == null)
            return;

        this.origin = this.absoluteToRelative(line.getStartPoint());
        this.aim = this.absoluteToRelative(line.getEndPoint());
    },
    /*验证点在地图上的有效性*/
    isValid: function (point) {
        if (point == null)
            return false;

        if (point.x <= 0 || point.y <= 0 ||
            MapStruct.struct.has(point.x + '_' + point.y))
            return false;

        if (point.isVertical()) {
            point.setValue('direction', 'vertical');
            return true;
        }

        point.setValue('direction', 'diagonal');

        if (!MapStruct.struct.has(point.parent.x + '_' + point.y) || !MapStruct.struct.has(point.x + '_' + point.parent.y))
            return true;

        return false;
    },
    /*默认路由：曼哈顿路由*/
    process: function (line) {
        var sp = line.getStartPoint(),
            ep = line.getEndPoint();

        var mid = (sp.x + ep.x) / 2;
        var p1 = {
            x: mid,
            y: sp.y
        };

        var p2 = {
            x: mid,
            y: ep.y
        };

        return [sp, p1, p2, ep];
    },
    /*提供通过Point实例返回point[]数组的方法*/
    calculatePoints: function (point) {
        if (point == null || point.x != this.aim.x || point.y != this.aim.y) {
            this.points = [this.origin, this.origin];
            return;
        }

        this.points = [];
        while (!point.equalsWithPosition(this.origin)) {
            this.points.unshift(this.relativeToAbsolute(point));
            point = point.parent;
        }
        this.points.unshift(this.relativeToAbsolute(point));
    },
    getPoints: function () {
        if (this.flag == true) {
            this.calculatePoints(this.aimPoint);
        } else
            this.points = [this.origin, this.origin];

        return this.points;
    }
});

BFSRouterProcessor = CommonRouterProcessor.extend({
    notFind: 0,
    inQueue: 1,
    visited: 2,
    process: function (line) {
        /*处理队列*/
        var processQueue = new Array();
        var state = new Map();

        this.initPoints(line);
        processQueue.push(new Point(this.origin));
        state.put(processQueue.last().toString(), this.inQueue);

        /*寻路过程*/
        MapStruct.FindingStructClear();
        var findingPoint = [];

        while (processQueue.length > 0) {
            var currentPoint = processQueue.pop(processQueue);
            var tempFindingPoint = [];

            if (currentPoint.equalsWithPosition(this.aim)) {
                this.flag = true;
                this.aimPoint = currentPoint;
                break;
            }

            for (var i = 0, l = this.allDir.length; i < l; i++) {
                var tempPoint = new Point(null); //*
                tempPoint.setPosition(currentPoint.x + this.allDir[i][0], currentPoint.y + this.allDir[i][1]);
                tempPoint.setParent(currentPoint);

                if (!this.isValid(tempPoint))
                    continue;

                if (state.has(tempPoint.toString()) && state.get(tempPoint.toString()) != this.notFind)
                    continue;

                processQueue.unshift(tempPoint);
                state.put(tempPoint.toString(), this.inQueue);

                tempFindingPoint.unshift(tempPoint.createSimplePoint());
            }
            findingPoint.unshift(tempFindingPoint);
        }

        MapStruct.applyFindingPoints('green', findingPoint);
    }
});