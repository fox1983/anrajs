function createRouter(config) {
    var o = Object.assign(config.router, config);
    return function(line, reader) {
        o.route(line, reader);
        return o.getPath();
    }
}

var HeuristicRouter = {
    route : function(line, reader) {
        
    },
    
    getNeighbors : function(x, y, reader) {
        
    },
    
    getPath : function() {
        
    }
}