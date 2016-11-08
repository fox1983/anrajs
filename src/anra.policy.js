/**
 * Created with JetBrains WebStorm.
 * User: Caiyu
 * Date: 16-7-20
 * Time: 上午9:45
 */

anra.gef.AbstractEditPolicy = anra.gef.Policy.extend({
});
anra.gef.SelectionPolicy = anra.gef.AbstractEditPolicy.extend({
    handles: [],
    selectionListener: null,
    activate: function () {
        this.base();
        this.addSelectionListener();
    },
    deactivate: function () {
        this.base();
        this.removeSelectionListener();
    },
    validatePolicy: function () {
        if (this.handles.length > 0) {
            for (var i = 0; i < this.handles.length; i++) {
                this.handles[i].refreshLocation();
            }
        }
    },
    addSelectionListener: function () {
        var SelectionEditPartListener = anra.EditPartListener.extend({
            selectedStateChanged: function () {
                switch (this.editPart.getSelected()) {
                    case SELECTED:
                        console.log("SELECTED");
                        break;
                    case SELECTED_NONE:
                        console.log("SELECTED_NONE");  //取消选中触发
                        this.policy.hideSelection();
                        break;
                    case SELECTED_PRIMARY:
                        console.log("SELECTED_PRIMARY");  //选中触发
                        this.policy.showPrimarySelection();
                        break;
                    default :
                }
            }
        });
        this.selectionListener = new SelectionEditPartListener(this.getHost(), this);
        this.getHost().addEditPartListener(this.selectionListener);
    },
    removeSelectionListener: function () {
        this.getHost().removeEditPartListener(this.selectionListener);
    },
    showPrimarySelection: function () {
        this.addSelectionHandles();
    },
    hideSelection: function () {
        this.removeSelectionHandles();
    },
    addSelectionHandles: function () {
        this.removeSelectionHandles();
        this.handles = this.createSelectionHandles();
        for (var i = 0; i < this.handles.length; i++) {

            this.getHost().getRoot().getLayer(anra.gef.RootEditPart.HandleLayer).addChild(this.handles[i]);
        }
    },
    removeSelectionHandles: function () {
        if (this.handles.isEmpty()) {
            return;
        }
        for (var i = 0; i < this.handles.length; i++) {

            this.getHost().getRoot().getLayer("Handle_Layer").removeChild(this.handles[i]);
        }
        this.handles = [];
    },
    createSelectionHandles: function () {

    }
});

anra.gef.ResizableEditPolicy = anra.gef.SelectionPolicy.extend({
    createSelectionHandles: function () {
        var handles = [];
        var editPart = this.getHost();
        handles.push(new anra.Handle(editPart, anra.Handle.NORTH));
        handles.push(new anra.Handle(editPart, anra.Handle.SOUTH));
        handles.push(new anra.Handle(editPart, anra.Handle.EAST));
        handles.push(new anra.Handle(editPart, anra.Handle.WEST));
        handles.push(new anra.Handle(editPart, anra.Handle.NORTH_EAST));
        handles.push(new anra.Handle(editPart, anra.Handle.NORTH_WEST));
        handles.push(new anra.Handle(editPart, anra.Handle.SOUTH_EAST));
        handles.push(new anra.Handle(editPart, anra.Handle.SOUTH_WEST));
        return handles;
    }

});
anra.gef.Policy.PRIMARY_DRAG_ROLE = "PrimaryDrag Policy";