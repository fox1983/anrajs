/*
 BaseRoute = Base.extend({
    route : function(start, end, reader) {
    
    },
    
    getPath : function() {
    
    }
 });
 */

var HeuristicRoute = {
    route: function (start, end, reader) {
        var openList = [], 
            currentNode, tempNode, neighbors, tempKey,
            startNode = new Node(start.x, start.y),
            endNode = new Node(end.x, end.y);
        
        this.state = new Map();
        reader.structure();
        
        this.flag = false,
        this.addOpenList(startNode, openList, endNode);
        
        while (!openList.isEmpty()) {
            currentNode = this.getMinPoint(openList);

            if (currentNode.equals(endNode)) {
                this.flag = true;
                this.end = endNode;
                break;
            }

            neighbors = this.getNeighbors(currentNode, reader);
            while (tempNode = neighbors.pop()) {
                this.calculateG(tempNode, currentNode);
                tempKey = tempNode.toString();

                if (this.state.has(tempKey) && this.state.get(tempKey) == Node.inClosed) {
                    continue;
                }

                if (this.state.has(tempKey) && this.state.get(tempKey) == Node.inOpen) {
                    this.removeFromOpen(tempNode, openList);
                }

                if (!this.state.has(tempKey) || this.state.get(tempKey) == Node.notFound) {
                    tempNode.setParent(currentNode);
                    this.addOpenList(tempNode, openList, endNode);
                }
            }
        }
    },

    getPath: function () {
        return this.flag ? HeuristicUtil.calculatePath(this.end) : null;
    },

    //ext
    addOpenList: function (node, list, end) {
        this.state.put(node.toString(), Node.inOpen);
        //this.calculateF(node, end);
        
        node.f = node.g + this.distance.calculate(node, end);
        HeuristicUtil.addSortedList(node, list);
    },

    removeFromOpen: function (node, list) {
        if (node.newG >= node.g) {
            return;
        }

        list.removeObject(node);
        node.g = node.newG;
        this.state.put(node.toString(), Node.notFound);
    },

    getMinPoint: function (list) {
        var node = list.pop();
        this.state.put(node.toString(), Node.inClosed);

        return node;
    },

    getNeighbors: function (node, reader) {
        if (node == null) {
            return;
        }

        var result = [],
            x = node.x,
            y = node.y,
            north = reader.getNode(x, y + 1),
            west = reader.getNode(x - 1, y),
            south = reader.getNode(x, y - 1),
            east = reader.getNode(x + 1, y);

        if (!reader.isObstacle(north)) {result.unshift(north);}
        if (!reader.isObstacle(west))  {result.unshift(west);}
        if (!reader.isObstacle(south)) {result.unshift(south);}
        if (!reader.isObstacle(east))  {result.unshift(east);}

        if (this.diagonal) {
            var northeast = reader.getNode(x + 1, y - 1),
                northwest = reader.getNode(x - 1, y - 1),
                southwest = reader.getNode(x - 1, y + 1),
                southeast = reader.getNode(x + 1, y + 1);

            if (!reader.isObstacleWithDiagonal(northeast, node)){result.unshift(northeast);}
            if (!reader.isObstacleWithDiagonal(northwest, node)){result.unshift(northwest);}
            if (!reader.isObstacleWithDiagonal(southwest, node)){result.unshift(southwest);}
            if (!reader.isObstacleWithDiagonal(southeast, node)){result.unshift(southeast);}
        }
        
        return result;
    },

    calculateG: function (node, srnode) {
        var g, srg = srnode.g;

        //计算node到srnode的距离
        if (!this.diagonal) {
            g = RE;
        } else {
            g = (node.x != srnode.x && node.y != srnode.y ? BE : RE);
        }

        g += srnode.hasOwnProperty('g') ? srg : 0;

        if (node.hasOwnProperty('g')) {
            node.newG = g;
        } else {
            node.g = g;
        }
    }
};

RE = 10;
BE = 14;
