/**
 * @Desc 地图结构控制器
 * @Detail 封装Editor
 */
MapController = Base.extend({
    width : 25,
    height : 25,
    constructor: function(content) {
        //地图结构信息记录
        this.struct = new Map();
        //起点记录队列
        this._starts = [];
        this.defaultSetting(content);
    },
    defaultSetting: function(content) {
        if (this.editor == null) {
            this.editor = new TwoNoneEditor();
            this.editor.struct = this.struct;
        }
        
        var start = new Point(1, 1), end = new Point(10, 10), 
            input = {width: this.width, height: this.height, startPosition: start, endPosition: end};
        
        this.editor.setInput(input);
        this.editor.createContent(content);
    },
    createStart : function() {
        if (this.hasStart == null) {
            this.hasStart = false;
        }
        
        if (this.hasStart) {
            alert("添加终点");
            return;
        }
        var start = new StartModel(), end = new EndModel();
        
        //记录起点与终点
        this._starts.push(start);
        
        start.setSize(this.width, this.height);
        end.setSize(this.width, this.height);
        start.setToEnd(end);
        this.editor.setActiveTool(new anra.gef.CreationTool(start));
        this.hasStart = true;
        return false;
    },
    createEnd : function() {
        if (this.hasStart == null || !this.hasStart) {
            alert("添加起点");
            return;
        }
        
        //如果已添加起点，则相对对应的终点在数组的最后一个
        var end = this._starts.last().getEnd();
        
        this.editor.setActiveTool(new anra.gef.CreationTool(end));
        this.hasStart = false;
        return false;
    },
    createCustomWall : function(num) {
        var x, y, key, p;
        while(num > 0) {
            x = Math.floor(Math.random()*50);
            y = Math.floor(Math.random()*50);
            p = new Point(x, y);
            key = p.toString();
            
            if (this.struct.has(key)) {
                continue;
            }
            
            var model = new WallModel();
            model.setSize(this.width, this.height);
            model.setRelativePosition(p);
            model.id = key;
            this.editor.rootModel.addChild(model);
            num--;
        }
        console.log(this.editor.rootModel.children);
        this.editor.rootEditPart.refresh();
    }
});
LIMITED_MAP_WIDTH = 1000;
LIMITED_MAP_HEIGTH = 1000;