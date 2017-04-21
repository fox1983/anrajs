$AG.Editor.prototype.createPalette = function (id) {
    var i = id + 'Plt';
    var div = document.createElement('div');
    div.setAttribute('id', id + 'Plt');
    div.style.position = 'relative';
    div.style.width = '10%';
    div.style.height = '100%';
    div.style.float = 'left';
    div.style.backgroundColor = '#CCCCCC';

    //工具
    var selectTool = document.createElement('button'),
        linkTool = document.createElement('button'),
        
        sm, lm, editor = this;

    selectTool.setAttribute('class', 'pltItem');
    selectTool.onmousedown = function () {
        editor.setActiveTool(editor.getDefaultTool());
    };
    sm = document.createElement('img');
    sm.setAttribute('src', 'icons/select.gif');
    selectTool.appendChild(sm);

    linkTool.setAttribute('class', 'pltItem');
    
    //linetext
    var lineTool = new $AG.LineTool({id: 3, type: 0,target: 5, entr: 7, exit: 6});
    
    linkTool.onmousedown = function () {
        if (editor.getActiveTool() == lineTool) {
            editor.setActiveTool(editor.getDefaultTool());
        } else
            editor.setActiveTool(lineTool);
        return false;
    };
    lm = document.createElement('img');
    lm.setAttribute('src', 'icons/link.gif');
    linkTool.appendChild(lm);

    div.appendChild(selectTool);
    div.appendChild(linkTool);
    div.appendChild(document.createElement('p'));

    //组
    var group = this.config.group;
    if (group) {
        var g, items;

        for (var i in group) {
            g = document.createElement('p');
            g.innerHTML = group[i].name;
            div.appendChild(g);

            items = group[i].items;
            if (items) {
                for (var j = 0; j < items.length; j++) {
                    div.appendChild(this.createPaletteItem(items[j]));
                    div.appendChild(document.createTextNode(editor.config.children[items[j]].name));
                    div.appendChild(document.createElement('p'));
                }
            }
            div.appendChild(document.createElement('p'));
        }
    }
    this.element.appendChild(div);
    return new anra.gef.Palette(i);
};

$AG.Editor.prototype.createPaletteItem = function (type) {
    var config = this.config.children[type],
        item, editor = this;

    if (config == null) {
        throw '没有这种类型的Node';
    }

    item = document.createElement('img');
    item.setAttribute('class', 'pltItem');
    item.setAttribute('src', config.url);

    item.onmousedown = function () {
        var json = {
                id: createID(),
                name: config.name,
                type: type,
                bounds: config.bounds
            },
            node = new anra.gef.NodeModel();

        node.props = json;
        editor.setActiveTool(new anra.gef.CreationTool(node));
        return true;
    };

    item.ondragstart = function () {
        return false;
    }
    
    return item;
};

$AG.Editor.prototype.initRootEditPart = function (editPart) {
    editPart.addEditPartListener(new ReaderListener());
};



var createID = (function () {
    var count = 0;
    return function () {
        return count++;
    }
})();



Platform = {
    main : null,
    assist : null,
    pool : new Map(),
    isAssist : function(id) {
        return this.pool.get(id) == this.assist;
    }
};
