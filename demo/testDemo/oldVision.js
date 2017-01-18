ManhattanRouter = Base.extend({
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
    }
});
CommonRouterProcessor = Base.extend({
    verticalDir: [[0, 1], [1, 0], [0, -1], [-1, 0]],
    diagonalDir: [[1, 1], [1, -1], [-1, -1], [-1, 1]],

    absoluteToRelative: function (point) {
        if (point == null)
            return;

        var newPoint = {
            x: null,
            y: null
        };

        newPoint.x = Math.floor(point.x / MapNodeModel.width);
        newPoint.y = Math.floor(point.y / MapNodeModel.width);

        return newPoint;
    },

    relativeToAbsolute: function (point) {
        if (point == null)
            return;

        var newPoint = {
            x: null,
            y: null
        };

        newPoint.x = point.x * MapNodeModel.width + MapNodeModel.width / 2;
        newPoint.y = point.y * MapNodeModel.width + MapNodeModel.width / 2;

        return newPoint;
    },
    isValid: function (point) {
        if (point.x > 0 && point.y > 0 &&
            !MapStruct.struct.has(point.x + '_' + point.y))
            return true;
        else
            return false;
    }
});

BFSRouterProcessor = CommonRouterProcessor.extend({
    process: function (line) {
        var queue = new Array(); //处理队列

        var origin = this.absoluteToRelative(line.getStartPoint());
        var aim = this.absoluteToRelative(line.getEndPoint());

        var processEdge = null; //处理边
        var targetPoint = null;
        var insertPoint = {
            x: null,
            y: null
        };
        var processPath = new Map();
        var tempX = null;
        var tempY = null;
        var tempKey = null;
        var recordCrossMess = [];
        var points = [];
        //var findingNode;

        var flag = false;

        queue.push([origin, origin]);

        MapStruct.clear();

        while (queue.length > 0) {
            processEdge = Tools.deepCopy(queue.pop());
            targetPoint = Tools.deepCopy(processEdge[1]);

            if (processPath.has(targetPoint.x + '_' + targetPoint.y))
                continue;

            processPath.put(targetPoint.x + '_' + targetPoint.y, processEdge[0]);

            if (!Tools.equals(processEdge[0], origin) || !Tools.equals(targetPoint, origin))
                MapStruct.FindingStruct.push(Tools.deepCopy(targetPoint));

            if (Tools.equals(targetPoint, aim)) {
                flag = true;
                break;
            }


            /*findingNode = [];
            findingNode[0] = Tools.deepCopy(targetPoint);*/
            for (var i = 0; i < this.verticalDir.length; i++) {
                tempX = targetPoint.x + this.verticalDir[i][0];
                tempY = targetPoint.y + this.verticalDir[i][1];
                tempKey = tempX + '_' + tempY;

                if (tempX >= 0 && tempY >= 0 &&
                    !MapStruct.struct.has(tempKey)) {
                    insertPoint.x = tempX;
                    insertPoint.y = tempY;
                    queue.insert([targetPoint, Tools.deepCopy(insertPoint)], 0);
                    //findingNode.push(Tools.deepCopy(insertPoint));
                    recordCrossMess[i] = 1;
                } else
                    recordCrossMess[i] = 0;
            }
            recordCrossMess[this.verticalDir.length] = recordCrossMess[0];

            for (var i = 0; i < this.diagonalDir.length; i++) {
                tempX = targetPoint.x + this.diagonalDir[i][0];
                tempY = targetPoint.y + this.diagonalDir[i][1];
                tempKey = tempX + '_' + tempY;

                if (tempX >= 0 && tempY >= 0 &&
                    !MapStruct.struct.has(tempKey) &&
                    (recordCrossMess[i] + recordCrossMess[i + 1]) > 0) {
                    insertPoint.x = tempX;
                    insertPoint.y = tempY;
                    queue.insert([targetPoint, Tools.deepCopy(insertPoint)], 0);
                    //findingNode.push(Tools.deepCopy(insertPoint));
                }
            }
            /*MapStruct.FindingStruct.put(targetPoint.x + '_' + targetPoint.y, findingNode);
            model.setValue('findNode', targetPoint.x + '_' + targetPoint.y);*/
        }

        points.push(this.relativeToAbsolute(aim));
        targetPoint = Tools.deepCopy(aim);
        if (flag) {
            while (!Tools.equals(targetPoint, origin)) {
                targetPoint = Tools.deepCopy(processPath.get(targetPoint.x + '_' + +targetPoint.y));
                points.insert(this.relativeToAbsolute(targetPoint));
            }
        } else
            return [origin, origin];
        return points;
    }
});

GreedRouterProcess = CommonRouterProcessor.extend({
    getNodeKey: function (node) {
        return node.x + '_' + node.y;
    },
    NodeToPoint: function (node) {
        var p = {
            x: null,
            y: null
        };
        p.x = node.x;
        p.y = node.y;
        return p;
    },
    process: function (line) {
        var queue = new Array();
        var flag = false;

        var origin = this.absoluteToRelative(line.getStartPoint());
        var aim = this.absoluteToRelative(line.getEndPoint());

        var startNode = {
            x: null,
            y: null,
            distance: 0,
            parentX: null,
            parentY: null
        };
        startNode.x = startNode.parentX = origin.x;
        startNode.y = startNode.parentY = origin.y;
        startNode.distance = Math.abs(aim.x - origin.x) + Math.abs(aim.y - origin.y);
        var targetNode = null;
        var tempNode = {
            x: null,
            y: null,
            distance: null,
            parentX: null,
            parentY: null
        };
        var recordCrossMess = [];
        var parentPoint = {
            x: null,
            y: null
        };
        var tempPoint = null;

        var distance = null;

        var tempX = null;
        var tempY = null;

        var processPath = new Map();

        queue.push(startNode);
        MapStruct.clear();

        while (queue.length > 0) {
            targetNode = Tools.deepCopy(queue.pop());
            //console.log(targetNode.x + ',' + targetNode.y);
            //console.log(queue.length);

            if (processPath.has(this.getNodeKey(targetNode)))
                continue;

            parentPoint.x = targetNode.parentX;
            parentPoint.y = targetNode.parentY;

            processPath.put(this.getNodeKey(targetNode), Tools.deepCopy(parentPoint));

            if (parentPoint.x != origin.x || parentPoint.y != origin.y)
                MapStruct.FindingStruct.push(Tools.deepCopy(parentPoint));

            if (targetNode.x == aim.x && targetNode.y == aim.y) {
                flag = true;
                break;
            }
            for (var i = 0; i < this.verticalDir.length; i++) {
                tempX = targetNode.x + this.verticalDir[i][0];
                tempY = targetNode.y + this.verticalDir[i][1];
                if (tempX >= 0 && tempY >= 0 &&
                    !MapStruct.struct.has(tempX + '_' + tempY)) {
                    distance = Math.abs(tempX - aim.x) + Math.abs(tempY - aim.y);

                    tempNode.x = tempX;
                    tempNode.y = tempY;
                    tempNode.distance = distance;
                    tempNode.parentX = targetNode.x;
                    tempNode.parentY = targetNode.y;

                    if (queue.length > 0) {
                        var l = queue.length;
                        var j = l - 1;
                        while (l == queue.length && j >= 0) {
                            if (queue[j].distance > distance)
                                queue.insert(Tools.deepCopy(tempNode), j + 1);
                            j--;
                        }

                        if (l == queue.length)
                            queue.insert(Tools.deepCopy(tempNode), 0);
                    } else
                        queue.push(Tools.deepCopy(tempNode));

                    recordCrossMess[i] = 1;

                } else
                    recordCrossMess[i] = 0;
            }

            recordCrossMess[this.verticalDir.length] = recordCrossMess[0];

            for (var i = 0; i < this.diagonalDir.length; i++) {
                tempX = targetNode.x + this.diagonalDir[i][0];
                tempY = targetNode.y + this.diagonalDir[i][1];

                if (tempX >= 0 && tempY >= 0 &&
                    !MapStruct.struct.has(tempX + '_' + tempY) &&
                    (recordCrossMess[i] + recordCrossMess[i + 1]) > 0) {
                    distance = Math.abs(tempX - aim.x) + Math.abs(tempY - aim.y);

                    tempNode.x = tempX;
                    tempNode.y = tempY;
                    tempNode.distance = distance;
                    tempNode.parentX = targetNode.x;
                    tempNode.parentY = targetNode.y;

                    if (queue.length > 0) {
                        var l = queue.length;
                        var j = l - 1;
                        while (l == queue.length && j >= 0) {
                            if (queue[j].distance > distance)
                                queue.insert(Tools.deepCopy(tempNode), j + 1);
                            j--;
                        }

                        if (l == queue.length)
                            queue.insert(Tools.deepCopy(tempNode), 0);
                    } else
                        queue.push(Tools.deepCopy(tempNode));
                }
            }

        }

        var points = [];
        tempPoint = Tools.deepCopy(aim);

        if (flag) {
            while (!Tools.equals(tempPoint, origin)) {
                points.insert(this.relativeToAbsolute(tempPoint), 0);
                tempPoint = Tools.deepCopy(processPath.get(this.getNodeKey(tempPoint)));
            }
            points.insert(this.relativeToAbsolute(origin), 0);
        } else {
            points = [origin, origin];
        }

        return points;
    }
});

SingleASRouterProcesser = CommonRouterProcessor.extend({
    removePoint(point, array, aMap) {
        var index;
        var value = aMap.get(point.x + '_' + point.y);
        /*        for(var i = array.length - 1; i >= 0; i--) {
                    if(Tools.equals(point, array[i])) {
                        index = i;
                        break;
                    }
                }*/
        var low = 0,
            high = array.length - 1,
            mid;
        while (low <= high) {
            mid = Math.floor((low + high) / 2);

            if (Tools.equals(array[mid], point)) {
                index = mid;
                break;
            }

            if (aMap.get(array[mid].x + '_' + array[mid].y) < value)
                mid = high - 1;

            if (aMap.get(array[mid].x + '_' + array[mid].y) > value)
                mid = low + 1;
        }

        array.remove(index);
    },
    insertSorted(point, value, array, aMap) {
        var insertIndex;
        var high = array.length - 1,
            low = 0,
            mid;

        if (high < 0) {
            array.push(Tools.deepCopy(point));
            return;
        }

        while (low <= high) {
            mid = Math.floor((high + low) / 2);

            if (aMap.get(array[mid].x + '_' + array[mid].y) > value)
                low = mid + 1;
            else
                high = mid - 1;
        }

        array.insert(Tools.deepCopy(point), low);
    },
    process: function (line) {
        var flag = false;
        var closed = new Array();
        var open = new Array(); //用于排序
        var openMap = new Map(); //用于查询
        var processPath = new Map();
        var points = [];

        var origin = this.absoluteToRelative(line.getStartPoint());
        var aim = this.absoluteToRelative(line.getEndPoint());

        var currentPoint = null;
        var tempPoint = {
            x: null,
            y: null
        };

        var tempX = null;
        var tempY = null;
        var hValue = null;
        var phValue = null;
        var recordCrossMess = [];

        open.push(origin);
        openMap.put(origin.x + '_' + origin.y, Math.abs(origin.x - aim.x) + Math.abs(origin.y - aim.y));

        while (open.length > 0) {
            currentPoint = Tools.deepCopy(open.pop());
            phValue = openMap.get(currentPoint.x + '_' + currentPoint.y);
            openMap.remove(currentPoint.x + '_' + currentPoint.y);
            closed.push(Tools.deepCopy(currentPoint));

            if (Tools.equals(currentPoint, aim)) {
                flag = true;
                break;
            }

            for (var i = 0; i < this.verticalDir.length; i++) {
                tempPoint.x = currentPoint.x + this.verticalDir[i][0];
                tempPoint.y = currentPoint.y + this.verticalDir[i][1];

                if (!this.isValid(tempPoint)) {
                    recordCrossMess[i] = 0;
                    continue;
                }

                recordCrossMess[i] = 1;

                hValue = phValue + 1 + Math.abs(tempPoint.x - aim.x) + Math.abs(tempPoint.y - aim.y) - Math.abs(currentPoint.x - aim.x) - Math.abs(currentPoint.y - aim.y);


                if (openMap.has(tempPoint.x + '_' + tempPoint.y) && openMap.get(tempPoint.x + '_' + tempPoint.y) > hValue) {
                    this.removePoint(tempPoint, open, openMap);
                    openMap.remove(tempPoint.x + '_' + tempPoint.y);
                }

                if (!openMap.has(tempPoint.x + '_' + tempPoint.y)) {
                    openMap.put(tempPoint.x + '_' + tempPoint.y, hValue);
                    this.insertSorted(tempPoint, hValue, open, openMap);
                    processPath.put(tempPoint.x + '_' + tempPoint.y, currentPoint);
                }

                recordCrossMess[this.verticalDir.length] = recordCrossMess[0];

                for (var i = 0; i < this.diagonalDir.length; i++) {
                    tempPoint.x = currentPoint.x + this.diagonalDir[i][0];
                    tempPoint.y = currentPoint.y + this.diagonalDir[i][1];

                    if (!this.isValid(tempPoint) || recordCrossMess[i] + recordCrossMess[i + 1] == 0)
                        continue;

                    hValue = phValue + 1 + Math.abs(tempPoint.x - aim.x) + Math.abs(tempPoint.y - aim.y) - Math.abs(currentPoint.x - aim.x) - Math.abs(currentPoint.y - aim.y);

                    if (openMap.has(tempPoint.x + '_' + tempPoint.y) && openMap.get(tempPoint.x + '_' + tempPoint.y) > hValue) {
                        this.removePoint(tempPoint, open, openMap);
                        openMap.remove(tempPoint.x + '_' + tempPoint.y);
                    }

                    if (!openMap.has(tempPoint.x + '_' + tempPoint.y)) {
                        openMap.put(tempPoint.x + '_' + tempPoint.y, hValue);
                        this.insertSorted(tempPoint, hValue, open, openMap);
                        if (!Tools.equals(processPath.get(currentPoint.x + '_' + currentPoint.y), tempPoint))
                            processPath.put(tempPoint.x + '_' + tempPoint.y, currentPoint);
                    }
                }

            }

            /*    var a=[
                    [[0,0],[0,1],[0,1],[0,1]],
                    [[0,0],[0,1],[0,1],[0,1],[0,1]],
                    [[0,0],[0,1],[0,1],[0,1],[0,1],[0,0],[0,1],[0,1],[0,1],[0,1]],
                ]
                
                editPart.editor.MapStruct
                
                Arrays.prototype.iteractor.next
                MapStruct.applyRedNode(a){
                    
                    function x(a,i){
                        handleing=true;
                        var r=a[i++]
                        
                        for(){
                            new NodeModel(r[])
                        
                            root.refresh(*);
                            
                        }
                        if(i<?)
                        setTimeout(x(a,i++),500);else handleing=false;
                    }(a,0)
                    
                }*/

            console.log('---------------------');

            currentPoint = Tools.deepCopy(aim);
            if (!flag) {
                while (!Tools.equals(currentPoint, origin)) {
                    points.unshift(this.relativeToAbsolute(currentPoint));
                    currentPoint = Tools.deepCopy(processPath.get(currentPoint.x + '_' + currentPoint.y));
                }
                points.unshift(this.relativeToAbsolute(currentPoint));
            } else
                points = [origin, origin];

            return points;
        }
    }
});

DyGreedRouterProcess = CommonRouterProcessor.extend({
    getNodeKey: function (node) {
        return node.x + '_' + node.y;
    },
    NodeToPoint: function (node) {
        var p = {
            x: null,
            y: null
        };
        p.x = node.x;
        p.y = node.y;
        return p;
    },
    process: function (line, model) {
        var queue = new Array();
        var flag = false;

        var origin = this.absoluteToRelative(line.getStartPoint());
        var aim = this.absoluteToRelative(line.getEndPoint());

        var startNode = {
            x: null,
            y: null,
            distance: 0,
            parentX: null,
            parentY: null
        };
        startNode.x = startNode.parentX = origin.x;
        startNode.y = startNode.parentY = origin.y;
        startNode.distance = Math.abs(aim.x - origin.x) + Math.abs(aim.y - origin.y);
        var targetNode = null;
        var tempNode = {
            x: null,
            y: null,
            distance: null,
            parentX: null,
            parentY: null
        };
        var recordCrossMess = [];
        var parentPoint = {
            x: null,
            y: null
        };
        var tempPoint = null;
        var distance = null;
        var tempX = null;
        var tempY = null;
        var processPath = new Map();

        var f = [];
        
        queue.push(startNode);

        while (queue.length > 0) {
            var g = [];
            targetNode = Tools.deepCopy(queue.pop());
            if (processPath.has(this.getNodeKey(targetNode)))
                continue;

            parentPoint.x = targetNode.parentX;
            parentPoint.y = targetNode.parentY;

            processPath.put(this.getNodeKey(targetNode), Tools.deepCopy(parentPoint));

            if (targetNode.x == aim.x && targetNode.y == aim.y) {
                flag = true;
                break;
            }

            for (var i = 0; i < this.verticalDir.length; i++) {
                tempX = targetNode.x + this.verticalDir[i][0];
                tempY = targetNode.y + this.verticalDir[i][1];
                if (tempX >= 0 && tempY >= 0 &&
                    !MapStruct.struct.has(tempX + '_' + tempY)) {
                    distance = Math.abs(tempX - aim.x) + Math.abs(tempY - aim.y);

                    tempNode.x = tempX;
                    tempNode.y = tempY;
                    tempNode.distance = distance;
                    tempNode.parentX = targetNode.x;
                    tempNode.parentY = targetNode.y;

                    if (queue.length > 0) {
                        var l = queue.length;
                        var j = l - 1;
                        while (l == queue.length && j >= 0) {
                            if (queue[j].distance > distance)
                                queue.insert(Tools.deepCopy(tempNode), j + 1);

                            j--;
                        }

                        if (l == queue.length)
                            queue.insert(Tools.deepCopy(tempNode), 0);
                    } else
                        queue.push(Tools.deepCopy(tempNode));
                    
                    g.push(Tools.deepCopy(tempNode));

                    recordCrossMess[i] = 1;

                } else
                    recordCrossMess[i] = 0;
            }

            recordCrossMess[this.verticalDir.length] = recordCrossMess[0];

            for (var i = 0; i < this.diagonalDir.length; i++) {
                tempX = targetNode.x + this.diagonalDir[i][0];
                tempY = targetNode.y + this.diagonalDir[i][1];

                if (tempX >= 0 && tempY >= 0 &&
                    !MapStruct.struct.has(tempX + '_' + tempY) &&
                    (recordCrossMess[i] + recordCrossMess[i + 1]) > 0) {
                    distance = Math.abs(tempX - aim.x) + Math.abs(tempY - aim.y);

                    tempNode.x = tempX;
                    tempNode.y = tempY;
                    tempNode.distance = distance;
                    tempNode.parentX = targetNode.x;
                    tempNode.parentY = targetNode.y;

                    if (queue.length > 0) {
                        var l = queue.length;
                        var j = l - 1;
                        while (l == queue.length && j >= 0) {
                            if (queue[j].distance > distance)
                                queue.insert(Tools.deepCopy(tempNode), j + 1);
                            j--;
                        }

                        if (l == queue.length)
                            queue.insert(Tools.deepCopy(tempNode), 0);
                    } else
                        queue.push(Tools.deepCopy(tempNode));
                    g.push(Tools.deepCopy(tempNode));
                }
            }
            f.push(g);
        }
        
        var ed = this.editPart;
        (function x(f) {
            var r = f.shift();
            while(!r.isEmpty()) {
                var e = r.shift();
                
                console.log(e.x + ',' + e.y);
                
                var fx= new anra.svg.Control();
                fx.setBounds({
                    x:e.x*40,
                    y:e.y*40,
                    width:40,
                    height:40
                });
                fx.setAttribute({
                    fill:'green'
                });
                fx.setOpacity(0.5);
                ed.getRoot().getHandleLayer().addChild(fx);
//                var m = new FindingModel();
//                m.initFindingModel();
//                m.setPosition(e.x, e.y);
//                ed.getRoot().model.addChild(m);
//                ed.getRoot().refresh();
            }
            if(!f.isEmpty())
                setTimeout(function(){x(f);}, 500);
        })(f);

        var points = [];
        tempPoint = Tools.deepCopy(aim);

        if (flag) {
            while (!Tools.equals(tempPoint, origin)) {
                points.insert(this.relativeToAbsolute(tempPoint), 0);
                tempPoint = Tools.deepCopy(processPath.get(this.getNodeKey(tempPoint)));
            }
            points.insert(this.relativeToAbsolute(origin), 0);
        } else {
            points = [origin, origin];
        }

        return points;
    }
});
