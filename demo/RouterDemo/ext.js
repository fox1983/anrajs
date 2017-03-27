function enter(w, h) {
    /*
     *缺少判断 XyNeedToDo
     */
    this.width = w;
    this.hight = h;
    this._generate();
}

enter.prototype._generate = function () {
    this._rightTable = new Array();
    var x = 0,
        y,
        w = this.width,
        h = this.hight;
    //二维
    /*
    for (;x < w; x++) {
        //To赋值
        this._rightTable = new Array();
        for (y = 0; y < h; y++) {
            this._rightTable[this.w] = Math.random() * 100;
        }
    }*/
    //一维(后面处理有问题)
    var i = 0;
    for (; i < 　w * h; i++) {
        this._rightTable[i] = Math.random() * 100;
    }
}

enter.prototype.toMin = function () {
    //多维处理
    var i = 0,
        h = this.hight,
        w = this.width,
        extendCount = Math.max(w, h),
        extendX, extendY;
    //用什么记录？
    var minTable = Array();
    var absX, absY;
    for (; i < extendCount; i++) {        
        for (extendX = 0; extendX < i; extendX++) {
            absX = i * w + extendX;
            minTable[absX] = this._getWeight(absX, minTable, this.Min);
        }
        //To 下标计算
        for (extendY = 0; extendY < i + 1; extendY++) {
            absY = i + extendY * w;
            minTable[absY] = this._getWeight(absY, minTable, this.Min);
        }
    }
    console.log(minTable[w * h - 1]);
}

enter.prototype._getWeight = function (index, table, type) {
    var weight = type == this.Min ? Math.min : Math.max,
        w = this.width,
        h = this.hight,
        right = this._rightTable;

    if (index == 0) {
        return right[index];
    }

    if (index % w == 0) {
        return right[index] + table[index - w];
    }

    if (index < w) {
        return right[index] + table[index - 1];
    }

    return right[index] + weight(table[index - 1], table[index - w]);
}

enter.prototype.Min = 1 << 1;
enter.prototype.Max = 1 << 2;
