/**
 * 用于代理寻路过程
 *
 */

FindingTool = Base.extend({
    constructor: function () {
        this.findingSub = new Map();
    },
    isValid : function() {
        if(this.keyList == null || this.keyList.length == 0)
            return false;
        return true;
    },
    setType: function (key, color) {
        if (this.colorMap == null) {
            this.colorMap = new Map();
            this.keyList = [];
        }

        if (!this.colorMap.has(key))
            this.keyList.push(key);

        this.colorMap.put(key, color);
    },
    addFindingPoint: function (key, point) {
        if (this.colorMap == null || !this.colorMap.has(key))
            return;

        var arr, l;

        if (!this.findingSub.has(key))
            this.findingSub.put(key, new Array());

        arr = this.findingSub.get(key);
        l = arr.length;

        if (l == 0) {
            var temp = [];
            temp.unshift(point);
            arr.unshift(temp);
            return;
        }

        arr[0].unshift(point);
    },
    addFindingPause: function (key) {
        if (this.colorMap == null || !this.colorMap.has(key))
            return;

        var arr = this.findingSub.get(key);
        
        if (arr == null) 
            arr = new Array();
        
        arr.unshift(new Array());
    },
    addBatchPause: function () {
        for (var i = 0; i < this.keyList.length; i++)
            this.addFindingPause(this.keyList[i]);
    },
    clear: function () {
        this.findingSub.clear();
    },
    reset : function() {
        this.colorMap = new Map();
        this.keyList = [];
    }
});
FindingTool = new FindingTool();

Slyle = {
/*    Single : {
        Point.inOpen : 'green'
    }*/
}
