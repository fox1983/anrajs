/*生成障碍策略*/
CreateWallPolicy = anra.gef.Policy.extend({
    activate: function () {
        var host = this.getHost();
        this.listener = function (e) {
            var x = e.x,
                y = e.y,
                editor = host.editor,
                mn = new WallModel();
            
            mn.setSize(editor.width, editor.height);
            mn.setAbsolutePosition(x, y);
            editor.struct.put(mn.id, mn);
            editor.rootModel.addChild(mn);
            
            host.refresh();
        };
        this.getHost().getFigure().addListener(anra.EVENT.MouseDown, this.listener);
    },
    deactivate: function () {
        this.getHost().getFigure().removeListener(anra.EVENT.MouseDown, this.listener);
    }
});

//test
LayoutPolicy = anra.gef.LayoutPolicy.extend({
    constructor:function() {
        anra.gef.LayoutPolicy.prototype.constructor.call(this);
    },
    getCommand:function (request) {
        var t = this.editParts;
        if (t instanceof WallEditPart) {
            return null;
        }
        
        if (REQ_DELETE_DEPENDANT == request.type)
            return this.getDeleteDependantCommand(request);
        if (REQ_ADD == request.type)
            return this.getAddCommand(request);
        if (REQ_ORPHAN_CHILDREN == request.type)
            return this.getOrphanChildrenCommand(request);
        if (REQ_MOVE_CHILDREN == request.type)
            return this.getMoveChildrenCommand(request);
        if (REQ_MOVE == request.type)
            return this.getMoveCommand(request);
        if (REQ_CLONE == request.type)
            return this.getCloneCommand(request);
        if (REQ_CREATE == request.type)
            return this.getCreateCommand(request);
        return null;
    }
});