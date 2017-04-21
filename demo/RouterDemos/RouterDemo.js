
DynamicMapEditor = anra.gef.Editor.extend({
    background: '#FFFFFF',
    editorParts: null,

    registActions:function () {
        var editor = this;
        this.actionRegistry.regist({
            id:1,
            name:'undo',
            type:ACTION_STACK,
            key:'ctrl+z',
            run:function () {
                editor.cmdStack.undo();
            },
            calculateEnable:function (node) {
                return  editor.cmdStack.canUndo();
            }
        }).regist({
                id:2,
                type:ACTION_SELECTION,
                key:'delete',
                name:'删除',
                image:'delete.gif',
                run:function () {
                    var selection = editor.rootEditPart.selection;
                    var cmd = this.createDeleteCommand(selection);
                    if (cmd != null)
                        editor.execute(cmd);
                    editor.rootEditPart.setSelection(null);
                },
                createDeleteCommand:function (node) {
                    if (node instanceof WallPart) {
                        return new DeleteWallCommand(editor.rootEditPart, node);
                    }
                },
                calculateEnable:function (node) {
                    return node instanceof anra.gef.NodeEditPart || node instanceof anra.gef.LineEditPart;
                }
            }).regist({
                id:3,
                type:ACTION_SELECTION,
                name:'redo',
                key:'ctrl+y',
                run:function () {
                    editor.cmdStack.redo();
                },
                calculateEnable:function (node) {
                    return  editor.cmdStack.canRedo();
                }
            }).regist({
                id:4,
                type:ACTION_SELECTION,
                key:'escape',
                run:function () {
                    editor.setActiveTool(editor.getDefaultTool());
//                    editor.cmdStack.redo();
                }
            });
        ;
    },
    input2model: function (input, rootModel) {
        
        /*设置地图信息*/
        MapStruct.setMapStruct(input.width, input.vnum, input.hnum);

        source.refresh();
        target.refresh();
        
        rootModel.addChild(target);
        rootModel.addChild(source);
    },
    createEditPart: function (context, model) {
        if (this.editorParts == null)
            this.editorParts = new Map();
 
        var part,
            type = model.get('type');
        
        part = new EditPartResiger[type]();

        part.model = model;
        this.editorParts.put(model.id, part);
        return part;
    },
    getCustomPolicies: function () {
        this.put('createWall', new CreateWallPolicy());
        //this.put(anra.gef.LAYOUT_POLICY, new anra.gef.LayoutPolicy());
        this.put(anra.gef.LAYOUT_POLICY, new NewDray());
    },
    startRouter : function() {
        if (this.isFind == null) {
            this.isFind = false;
        }
        
        if (this.isFind) {
            //摧毁线
        }
        
        //生成线
    },
    resetSize : function(width) {
        if (width == WIDTH) {
            return;
        }
        
        if (width <= 0 || width > 125) {
            return;
        }
        
        WIDTH = width;
        source.refresh();
        target.refresh();
        this.rootEditPart.getEditPart(source).refreshVisual();
        this.rootEditPart.getEditPart(target).refreshVisual();
        
        var keys = MapStruct.wallStruct.keys();
        if (keys.length <= 0) {
            return;
        }
        
        var i = 0;
        for (; i< keys.length; i++) {
            var model = this.rootModel.children.get(keys[i]);
            model.refresh();
            this.rootEditPart.getEditPart(model).refreshVisual();
        }
    },
    clearWall : function() {
        var keys = MapStruct.wallStruct.keys();
        if (keys.length <= 0) { 
            return;
        }
        
        var rootModel = this.rootModel, i = 0;
        for(;i < keys.length; i++) {
            rootModel.children.remove(keys[i]);
        }
        
        MapStruct.wallStruct = new Map();
        this.rootEditPart.refresh();
    },
    createWalls : function(num) {
        var x, y, s = MapStruct.getSource(), t = MapStruct.getTarget();
        while (num > 0) {
            x = Math.floor(Math.random() * MapStruct.verticalValue);
            y = Math.floor(Math.random() * MapStruct.horizontalValue);
            var p = new Point(x, y);
            if (MapStruct.wallStruct.has(p.toString())) {
                continue;
            }
            
            if (p.equals(s) || p.equals(t)) {
                return;
            }
            
            var m = new WallNodeModel(x*WIDTH, y*WIDTH);
            this.rootModel.addChild(m);
            MapStruct.wallStruct.put(p.toString(), new Point(x,y));
            num--;
        }
        
        this.rootEditPart.refresh();
    }
});

/*Map Struct*/
MapStruct = Base.extend({
    verticalValue: 60,
    horizontalValue: 60,
    constructor: function () {
        this.struct = new Map();
        this.wallStruct = new Map();
    },
    setMapStruct : function(width, vnum, hnum) {
        WIDTH = width || WIDTH;
        this.verticalValue = vnum || VERTIVAL_VALUE;
        this.horizontalValue = hnum || HORIZONTAL_VALUE;
    },
    get : function(key) {
        return this.struct.get(key);
    },
    getSource : function() {
        var x = source.get('x'),
            y = source.get('y');
        
        if(this.source == null)
            this.source = new Point();            
            
        this.source.setPosition(x, y);
        this.struct.put(x + '_' + y, this.source);
        
        return this.source;
    },
    getTarget : function() {
        var x = target.get('x'),
            y = target.get('y');
        
        if(this.target == null)
            this.target = new Point();
        
        this.target.setPosition(x, y);
        this.struct.put(x + '_' + y, this.target);
        
        return this.target;
    },
    getNeighbors : function(point) {
        if(point == null)
            return null;
        
        var result = [], x = point.x, y = point.y;
        var north = Util.getMapPoint(x, y + 1), 
            west  = Util.getMapPoint(x - 1, y),
            south = Util.getMapPoint(x, y - 1),
            east  = Util.getMapPoint(x + 1, y);
        
        if(Util.isValid(north)) result.unshift(north);
        if(Util.isValid(west))  result.unshift(west);
        if(Util.isValid(south)) result.unshift(south);
        if(Util.isValid(east))  result.unshift(east);
        
        if(!DIAGONAL)
            return result;
        
        var northeast = Util.getMapPoint(x + 1, y - 1),
            northwest = Util.getMapPoint(x - 1, y - 1),
            southwest = Util.getMapPoint(x - 1, y + 1), 
            southeast = Util.getMapPoint(x + 1, y + 1);
        
        if(Util.isValidWithDiagonal(northeast, point)) result.unshift(northeast);
        if(Util.isValidWithDiagonal(northwest, point)) result.unshift(northwest);
        if(Util.isValidWithDiagonal(southwest, point)) result.unshift(southwest);
        if(Util.isValidWithDiagonal(southeast, point)) result.unshift(southeast);
        
        return result;
    },
    clear : function() {
        this.struct.clear();
        this.target = null;
        this.source = null;
    }
});
MapStruct = new MapStruct();

/*模型分类*/
_SOURCE = 1;
_TARGET = 2;
_MAP = 3;

EditPartResiger = {
    1 : SourcePart,
    2 : TargetPart,
    3 : WallPart
};

/*地图信息*/
WIDTH = 50;
VERTIVAL_VALUE = 60;
HORIZONTAL_VALUE = 60;







testClass = Base.extend({
    constructor : function() {
        this.p = {};
        var t = this;
        var x = this.p;
        Object.defineProperty(t, "p", {
            get : function () {
                console.log('sdss');
                return x
            },
            set : function(val) {
                t.p = val;
            }
        });
    }
});