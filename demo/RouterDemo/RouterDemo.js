
DynamicMapEditor = anra.gef.Editor.extend({
    background: '#FFFFFF',
    editorParts: null,

    input2model: function (input, rootModel) {
        
        /*设置地图信息*/
        MapStruct.setMapStruct(input.width, input.vnum, input.hnum);

        source.refresh();
        target.refresh();
        
        rootModel.addChild(source);
        rootModel.addChild(target);
    },
    createEditPart: function (context, model) {
        if (this.editorParts == null)
            this.editorParts = new Map();
 
        var part,
            type = model.getValue('type'); 
        
        part = new EditPartResiger[type]();

        part.model = model;
        this.editorParts.put(model.id, part);
        return part;
    },
    getCustomPolicies: function () {
        this.put('createWall', new CreateWallPolicy());
        this.put(anra.gef.LAYOUT_POLICY, new anra.gef.LayoutPolicy());
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
        var x = source.getValue('x'),
            y = source.getValue('y');
        
        if(this.source == null)
            this.source = new Point();            
            
        this.source.setPosition(x, y);
        this.struct.put(x + '_' + y, this.source);
        
        return this.source;
    },
    getTarget : function() {
        var x = target.getValue('x'),
            y = target.getValue('y');
        
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