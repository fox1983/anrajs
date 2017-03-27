RectFigure = anra.gef.Figure.extend({
    constructor: function () {
        anra.gef.Figure.prototype.constructor.call(this);
    },
    init: function () {
        //TODO 根据情况修改
                this.registAnchors([
                    {
                        id: START,
                        dir: anra.CENTER,
                        offset: null
                    },
                    {
                        id: END,
                        dir: anra.CENTER,
                        offset: null
                    }
                ]);
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
