//config ;

/**
 * 生产寻路函数
 * @param   {RootEditPart} root   
 * @param   {Object}       config = {routeClass : BFS, diagonal : false, distance : M}
 * @returns {function}     router函数
 */
/*function createRouter(root, config) {
    var router = getRouter(config),
        reader = root.getReader();

    return function (line) {
        if (line.points == null || line.points.length < 2) {
            return null;
        }
        
        router.route(line.getStartPoint(), line.getEndPoint(), reader);
        var p1 = router.getPath();
        var p  = reader.getPath(p1);
        p.push(line.getEndPoint());
        p.unshift(line.getStartPoint());
        
        return p;
    };
};*/

/**
 * 生成路由实例
 */
function getRouter(config) {
    var r = routerRegister[config.route];
    r.diagonal = config.diagonal || false;
    r.distance = Distance[config.distance] || Distance['M'];

    return r;
}


ReaderListener = anra.gef.EditPartListener.extend({
    partActivated: function (editPart) {
        editPart.getReader = (function () {
            var reader = null;
            return function () {
                if (!reader) {
                    reader = new Reader();
                }
                return reader;
            }
        })();
    },

    partDeactivated: function (editpart) {
        delete editpart.getReader;
    },

    childAdded: function (child, index) {
        if (child instanceof anra.gef.NodeEditPart) {
            var root = child.getRoot();
            root.getReader().read(child);
            this.on(child);
        }
    },

    removingChild: function (child, index) {
        if (child instanceof anra.gef.NodeEditPart) {
            child.getRoot().getReader().remove(child);
        }
    },

    on: function (editPart) {
        var model = editPart.model,
            bounds = model.get('bounds'),
            oldBounds = [
                bounds[0],
                bounds[1],
                bounds[2],
                bounds[3]
            ],
            reader = editPart.getRoot().getReader();
        model.addPropertyListener(function () {
            reader.change(model.get('bounds'), oldBounds);
        }, 'bounds');
    }
});

function Reader() {
    this.struct = new Map();

    this._addList = [];
    this._deleteList = [];

    //暂时
    this.w = 25;
    this.maxWidth = 40;
    this.maxHeight = 40;

}
Reader.prototype.read = function (editPart) {
    if (!(editPart instanceof anra.gef.NodeEditPart)) {
        return;
    }

    var list = this._addList,
        b;

    if (editPart instanceof anra.gef.RootEditPart) {
        editPart.children.forEach(function (item, index, input) {
            b = item.model.get('bounds');
            list.push(b);
        });
    } else {
        b = editPart.model.get('bounds');
        list.push(b);
    }
};
Reader.prototype.remove = function (editPart) {
    if (editPart instanceof anra.gef.RootEditPart) {
        this.clear();
        return;
    }

    if (editPart instanceof anra.gef.NodeEditPart) {
        var b = editPart.model.get('bounds');
        this._deleteList.push(b);
    }
};
Reader.prototype.change = function (newBounds, oldBounds) {
    this._addList.push(newBounds);
    this._deleteList.push(oldBounds);
};
Reader.prototype.structure = function () {
    //先处理增加Bounds
    for (var i = 0; i < this._addList.length; i++) {
        this.process(this._addList[i], 1);
    }

    //处理删减的Bounds
    for (i = 0; i < this._deleteList.length; i++) {
        this.process(this._deleteList[i], -1);
    }


    this._addList = [];
    this._deleteList = [];
};
Reader.prototype.process = function (bounds, unit) {
    var w = this.w,
        sx = Math.floor(bounds[0] / w),
        sy = Math.floor(bounds[1] / w),
        ex = Math.floor((bounds[2] + bounds[0]) / w),
        ey = Math.floor((bounds[3] + bounds[1]) / w),
        count, key;
    
    for (var i = sx; i <= ex; i++) {
        for (var j = sy; j <= ey; j++) {
            key = i + '_' + j;
            if (!this.struct.has(key)) {
                this.struct.put(key, {
                    count: 0,
                    node: new Node(i, j)
                });
            } 
            this.struct.get(key).count = this.struct.get(key).count + unit;
        }
    }
};

Reader.prototype.isValid = function(x, y) {
    if (x < 0 || x > this.maxWidth || y < 0 || y > this.maxHeight) {
        return false;
    }
    
    return true;
};

Reader.prototype.getNode = function (x, y) {
    if (!this.isValid(x, y)) {
        return;
    }

    var key = x + '_' + y;

    if (!this.struct.has(key)) {
       this.struct.put(key, {
            count: 0,
            node: new Node(x, y)
        });
    }
    
    return this.struct.get(key).node;
};

Reader.prototype.getNodeWithAbs = function(x, y) {
    x = Math.floor(x / this.w);
    y = Math.floor(y / this.w);
    
    return this.getNode(x, y);
};

Reader.prototype.isObstacle = function(x, y) {
    if (!this.isValid(x, y)) {
        return true;
    }
    
    var key = x + '_' + y;
    if (!this.struct.has(key)) {
        return false;
    }
    
    if (this.struct.get(key).count == 0) {
        return false;
    } else {
        return true;
    }
};

Reader.prototype.getPath = function(path) {

    
    var result = [], w = this.w;
    
    for (var i = 0; i < path.length; i++) {
        result[i] = {x:path[i].x*w, y:path[i].y*w};
    }
    
    return result;
}

Reader.prototype.clear = function () {
    this.struct = new Map();

    this._addList = [];
    this._deleteList = [];
};


var bfs = {
    route: function (reader) {

    },

    getNeighbors: function (x, y) {

    },

    getPath: function () {

    }
};

var test = {
    route: function (start, end, reader) {
        //test 
        reader.structure();

        var sp = start,
            ep = end;
        var mid = (sp.x + ep.x) / 2;
        var p1 = {
            x: mid,
            y: sp.y
        };

        var p2 = {
            x: mid,
            y: ep.y
        };
        this.path = [sp, p1, p2, ep];
    },

    getPath: function () {
        return this.path;
    }
};

var routerRegister = {
    BFS: bfs,
    test: test
//    heur : HeuristicRoute
};

//计算方式
var Distance = {
    M: {
        calculate: function (start, end) {
            return Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
        }
    },

    E: {
        calculate: function (start, end) {
            var x = Math.abs(end.x - start.x),
                y = Math.abs(end.y - start.x);

            return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        }
    }
};


Node = Base.extend({
    x: null,
    y: null,
    parent: null,
    constructor: function (x, y) {
        this.x = x;
        this.y = y;
        this.state = Node.notFound;
    },
    setParent: function (node) {
        if (node instanceof Node) {
            this.parent = node;
        }
    },
    toString: function () {
        return this.x + '_' + this.y;
    },
    equals: function (o) {
        return o instanceof Node && o.x == this.x && o.y == this.y;
    }
});
Node.notFound = 1 << 1;
Node.inOpen = 1 << 2;
Node.inClosed = 1 << 3;
