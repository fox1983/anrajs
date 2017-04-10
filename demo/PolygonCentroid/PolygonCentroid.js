/**
 * Created with JetBrains WebStorm.
 * User: Hasee
 * Date: 17-2-21
 * Time: 下午2:15
 * To change this template use File | Settings | File Templates.
 */

PolygonCentroid = anra.gef.Editor.extend({

    input2model:function (input, rootModel) {
        var nm = new anra.gef.NodeModel();
        nm.set('points', input);
        nm.editPartClass = PolygonPart;
        rootModel.addChild(nm);
    }


});

PolygonPart = anra.gef.NodeEditPart.extend({
    /**
     * 用于同步model和figure。
     */
    refreshVisual:function () {
        if (this.model != null && this.figure != null) {
            this.figure.points = this.model.get('points');
        }
        this.figure.paint();
    },
    createEditPolicies:function () {
        this.installEditPolicy('Centroid', new CentroidPolicy());
    },
    createFigure:function () {
        return new PolygonFigure();
    }
});

CentroidPolicy = anra.gef.AbstractEditPolicy.extend({
    handle:null,
    class:'CentroidPolicy',
    activate:function () {
        this.handle = new CentroidHandle(this.getHost());
        this.getHandleLayer().addChild(this.handle);
    },
    deactivate:function () {
        this.getHandleLayer().removeChild(this.handle);
    }
});

CentroidHandle = anra.Handle.extend(anra.svg.Circle).extend({
    refreshLocation:function (figure) {
        var r = cal(figure.points);
        this.setBounds({x:r.x, y:r.y, width:10}, true);
    },
    initProp:function () {
        this.setAttribute({
            fill:'red'
        });
    }
});

PolygonFigure = anra.gef.Figure.extend(anra.svg.Polyline).extend({
    initProp:function () {
        this.setAttribute({
            stroke:'rgb(30,146,94)',
            fill:'none',
            'stroke-width':'2'
        });
    }
});


function a(pl) {
    var r = 0;
    for (var i = 0, len = pl.length - 1; i < len; i++) {
        var p = pl[i];
        var p1 = pl[i + 1];
        r += p.x * p1.y - p1.x * p.y;
    }
    return r / 2;
}

function x(pl, a) {
    var r = 0;
    for (var i = 0, len = pl.length - 1; i < len; i++) {
        var p = pl[i];
        var p1 = pl[i + 1];
        r += (p.x + p1.x) * (p.x * p1.y - p1.x * p.y);
    }
    return r / 6 / a;
}

function y(pl, a) {
    var r = 0;
    for (var i = 0, len = pl.length - 1; i < len; i++) {
        var p = pl[i];
        var p1 = pl[i + 1];
        r += (p.y + p1.y) * (p.x * p1.y - p1.x * p.y);
    }
    return r / 6 / a;
}

function cal(pl) {
    var A = a(pl);
    return {x:x(pl, A), y:y(pl, A)};
}