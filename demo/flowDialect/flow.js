/**
 * Created with JetBrains WebStorm.
 * User: Hasee
 * Date: 16-11-7
 * Time: 下午4:14
 * To change this template use File | Settings | File Templates.
 */
/**/
SYSTEM=

MyEditor = anra.gef.Editor.extend({
    models:null,
    editParts:null,
    background:'#191919',
    /**
     *根据context（前一个EditPart）和model（数据）生成EditPart（控制器）
     * @param context
     * @param model
     * @return {*}
     */
    createEditPart:function (context, model) {
        if (this.editParts == null)
            this.editParts = new Map();

        var part;
        /*根据type字段来确定节点类型*/
        var type=model.getValue('type');
        if (type== SYSTEM) {
            part = new CoreEditPart();
            CORE_EDIT_PART = part;
        } else
            part = new NodeEditPart();
        part.model = model;
        this.editParts.put(model.id, part);
        return part;
    },
    handleInput:function (input) {
        this.models = new Map();
        var nodes = input['nodes'];

        var coreModel = new anra.gef.NodeModel();
        coreModel.setProperties({
            id:0,
            type:CORE
        });
        this.models.set(coreModel.id, coreModel);
        for (var i = 0; i < nodes.length; i++) {
            nm = new anra.gef.NodeModel();
            nm.setProperties(nodes[i]);

            var line = {};
            nm.addSourceLine(line);
            coreModel.addTargetLine(line);

            this.models.set(nodes[i].id, nm);
        }
        return input;
    },
    initRootEditPart:function (editPart) {
        editPart.modelChildren = this.models.values();
        editPart.refresh();
    }
});
