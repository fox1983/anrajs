DeleteWallCommand = anra.ChainedCompoundCommand.extend({
    constructor: function(root, node) {
        this.commandList = [];
        
        MapStruct.wallStruct.remove(node.model.id);
        this.add(new anra.gef.DeleteNodeCommand(root, node));
    }
});