HeuristicUtil = {
    addSortedList: function (node, list) {
        var high = list.length - 1,
            low = 0,
            mid;

        if (high < 0) {
            list.push(node);
            return;
        }

        while (low <= high) {
            mid = Math.floor((high + low) / 2);

            if (list[mid].f > node.f) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        list.insert(node, low);
    },

    calculatePath: function (node) {
        if (node == null)
            return [];

        var nodes = [];
        while (node.parent) {
            nodes.unshift(node);
            node = node.parent;
        }
        nodes.unshift(node);

        return nodes;
    }
};
