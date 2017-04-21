//Node
var createImageNodeConfig = function (attr) {
    var config = {
        canDrag: true,
        anchor: [
            {id: 0, dir: 'w', offset: -15},
            {id: 1, dir: 's', offset: 5}
        ],
        linkable : true,
        selectable : true,
        refresh: function () {
            if (this.model != null && this.figure != null) {
                var b = this.model.get('bounds');
                this.figure.bounds = {
                    x: b[0],
                    y: b[1],
                    width: b[2],
                    height: b[3]
                };
                this.figure.style.fill = this.model.get('color');
            }
            this.figure.paint();
        },
        policies: {
            'a': {
                activate: function () {
                    var editpart = this.getHost(),
                        imp = editpart.editor.config.children[editpart.model.get('type')].implement,
                        uuid = editpart.model.uuid;
                    
                    if (uuid == null) {
                        throw Error("uuid kong de")
                    }

                    if (imp) {
                        this.listener = function (e) {
                            var id = editpart.editor.config.id,
                                div = document.getElementById(id);

                            if (Platform.assist) {
                                var d = document.getElementById(imp.id);
                                d.removeChild(d.childNodes[0]);
                                d.removeChild(d.childNodes[0]);

                                if (Platform.isAssist(uuid)) {
                                    d.style.display = 'none';
                                    div.style.width = '100%';
                                    Platform.assist = null;
                                    return;
                                }
                            } else {
                                div.style.width = '50%';
                                document.getElementById(imp.id).style.display = '';
                            }

                            if (Platform.pool.has(uuid)) {
                                Platform.assist = Platform.pool.get(uuid);
                                Platform.assist.createContent(imp.id);
                            } else {
                                Platform.assist = new $AG.Editor(imp);
                                Platform.pool.put(uuid, Platform.assist);
                            }

                        };
                        this.getHostFigure().on(anra.EVENT.MouseDoubleClick, this.listener);
                    }
                },

                deactivate: function () {
                    if (this.listener) {
                        this.getHostFigure().off(anra.event.MouseDoubleClick, this.listener);
                    }
                }
            }
        },
        type: $AG.IMAGE,
        bounds: [0, 0, 50, 50]
    };

    return Object.assign(attr, config);
};

//implementation
var start = createImageNodeConfig({
    name: 'start',
    url: 'icons/palette_component_nodeStart.gif'
});

var end = createImageNodeConfig({
    name: 'end',
    url: 'icons/palette_component_nodeEnd.gif'
});

var eend = createImageNodeConfig({
    name: 'eend',
    url: 'icons/palette_component_nodeAbnormalEnd.gif'
});

var error = createImageNodeConfig({
    name: 'error',
    url: 'icons/palette_component_nodeErrorDelegate.gif'
});

var context = createImageNodeConfig({
    name: 'context',
    url: 'icons/palette_component_ComponentInvoke.gif'
});

var serivce = createImageNodeConfig({
    name: 'service',
    url: 'icons/palette_component_TradeInvoke.gif'
});

var mid = createImageNodeConfig({
    name: 'mid',
    url: 'icons/palette_component_transfer.gif'
});


var childEditor = {
    id: 'childEditor',
    children: {
        1: start,
        2: end,
        3: eend,
        4: error,
        5: context,
        6: serivce,
        7: mid
    },
    group: {
        0: {
            name: 'Basic Context',
            items: [1, 2, 3, 4, 5, 6, 7]
        },
        1: {
            name: 'PlatForm'
        },
        2: {
            name: 'Bank'
        },
        3: {
            name: 'Application'
        }
    }
};


//main
var commonNodeConfig = createImageNodeConfig({
    name: 'common',
    url: 'icons/palette_component_ServiceInvoke.gif',
    implement: childEditor
});

var serviceNodeConfig = createImageNodeConfig({
    name: 'service',
    url: 'icons/palette_component_stepCommonCpt.gif',
    implement: childEditor
});

var mainEditor = {
    id: 'mainEditor',
    children: {
        'commonNodeConfig': commonNodeConfig,
        'serviceNodeConfig': serviceNodeConfig
    },
    data : [
        {id : 244, type : 'commonNodeConfig', bounds:[300, 300, 50, 50]},
        {id : 245, type : 'serviceNodeConfig', bounds:[100, 100, 50, 50]}/*s,
        {id : 246, type : 'commonNodeConfig', bounds:[200, 200, 50, 50]}*/
    ],
    line : [
        {id : 'line1', source: 244, type: 0, target: 245, exit: 0, entr: 1}
    ],
    lines: {
        0: {
            style: {
                stroke: 'green',
                'stroke-width': 3
            },
            endMarker: {
                type: $AG.Marker.TRIANGLE,
                size: 5
            },
            type: $AG.LINE,
            router : createRouter({router : HeuristicRouter})
        }
    },
    group: {
        0: {
            name: 'Default Context',
            items: ['commonNodeConfig', 'serviceNodeConfig']
        },
        1: {
            name: 'Bank',
        },
        2: {
            name: 'Application'
        }
    }
};


