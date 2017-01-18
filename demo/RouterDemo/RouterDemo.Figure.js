/**
 * Figure
 */

/*地图节点通用图形*/
RectFigure = anra.gef.Figure.extend({
    constructor: function () {
        anra.gef.Figure.prototype.constructor.call(this);
    },
    init: function () {
        this.registAnchors([
            {
                id: 'source',
                dir: anra.CENTER,
                offset: null
            },
            {
                id: 'target',
                dir: anra.CENTER,
                offset: null
            }
        ]);
    },
    initProp: function () {
        this.setAttribute({
            fill: this.model.getValue('color'),
            stroke: this.model.getValue('stroke')
        });
    },

    getTargetAnchor: function (line) {
        return {
            x: this.fattr('x') + this.fattr('width') / 2,
            y: this.fattr('y') + this.fattr('height') / 2
        };
    },

    getSourceAnchor: function (line) {
        return {
            x: this.fattr('x') + this.fattr('width') / 2,
            y: this.fattr('y') + this.fattr('height') / 2
        };
    }
});

/*线*/
CommonLine = anra.gef.Line.extend({
    init: function (model) {
        anra.gef.Line.prototype.init.call(this, model);
    },
    initProp: function () {
        this.setAttribute({
            fill: 'none',
            'stroke-width': 2,
            stroke: 'black'
        });
    },
    router: function (line) {
        if (!this.isLine(line))
            return null;

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
    isLine: function (line) {
        if (line.points == null || line.points.length < 2)
            return false;
        
        if(Util.equals(line.getStartPoint(), line.getEndPoint()))
            return false;

        return true;
    }
});

/*寻路过程handle*/
FindingPathHandle = anra.svg.Composite.extend({
    constructor: function (point, type) {
        anra.svg.Control.prototype.constructor.call(this);
        this.initProp();
        this.setPosition(point);
        this.setColor(type);
    },
    initProp: function () {
        /*this.setAttribute({
            'stroke-width': 2,
            stroke: 'black'
        });*/
        this.setOpacity(0.5);
    },
/*    createContent:function(){
        var text=anra.svg.Control.extend(anra.svg.Text);
        text=new text();
        text.setText(this.point.x + ',' + this.point.y);
        this.addChild(text)
        text.setBounds({x:15,y:15});
    },*/
    setPosition: function (point) {
        if (point == null)
            return;

        /*记录x与y*/
        this.point = point;

        this.setBounds({
            x: point.x * WIDTH,
            y: point.y * WIDTH,
            width: WIDTH,
            height: WIDTH
        });
    },
    setColor: function (type) {
        var color = FindingTool.colorMap.get(type);
        
        this.setAttribute({
            fill: color,
            stroke:'gray'
        });
    },
    toString : function() {
        return this.point.x + ',' + this.point.y;
    }
});