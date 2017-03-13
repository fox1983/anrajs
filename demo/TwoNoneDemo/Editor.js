TwoNoneEditor = anra.gef.Editor.extend({
    background: '#FFFFFF',
    editorParts: null,
    input2model: function (input, rootModel) {
        var start = new StartModel(),
            end = new EndModel();
        
        start.setSize(input.width, input.height);
        start.setRelativePosition(input.startPosition);
        end.setRelativePosition(input.endPosition);
        start.setToEnd(end);

        this.width = input.width;
        this.height = input.height;
        
        rootModel.addChild(start);
        rootModel.addChild(end);
    },
    registActions: function () {
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
            id: 2,
            type: ACTION_SELECTION,
            key: 'delete',
            name: '删除',
            image: 'delete.gif',
            run: function () {
                var selection = editor.rootEditPart.selection;
                var cmd = this.createDeleteCommand(selection);
                if (cmd != null)
                    editor.execute(cmd);
                editor.rootEditPart.setSelection(null);
            },
            createDeleteCommand: function (node) {
                if (node instanceof StartEditPart) {
                    var endNode = editor.rootEditPart.getEditPart(node.model.getEnd());
                    return new anra.gef.DeleteNodeAndLineCommand(editor.rootEditPart, [node, endNode]);
                }
                
                if (node instanceof WallEditPart) {
                    return new anra.gef.DeleteNodeAndLineCommand(editor.rootEditPart, node);
                }
            },
            calculateEnable: function (node) {
                return node instanceof anra.gef.NodeEditPart || node instanceof anra.gef.LineEditPart || node instanceof Array;
            }
        });
    },
    createEditPart: function (context, model) {
        if (this.editorParts == null) {
            this.editorParts = new Map();
        }

        var type = model.getValue('type'),
            editPart;

        editPart = new editPartRegistry[type]();
        editPart.model = model;
        this.editorParts.put(model.id, editPart);

        return editPart;
    },
    getCustomPolicies: function () {
        this.put('createWall', new CreateWallPolicy);
        this.put(anra.gef.LAYOUT_POLICY, new LayoutPolicy());
    }
});

editPartRegistry = {
    "start": StartEditPart,
    "end": 　EndEditPart,
    "wall": WallEditPart
};

START = "start";
END = "end";
WALL = "wall";
