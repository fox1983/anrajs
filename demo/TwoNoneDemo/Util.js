createId = function() {
    return Number(Math.random().toString().substr(3,5) + Date.now()).toString(36);
}
Util.createId = createId;