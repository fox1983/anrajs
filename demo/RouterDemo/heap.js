function heap(compare) {
    this._compare = compare || this._defaultCompare;
    this._queue = [];
    this._count = 0;
}

heap.prototype.init = function (arr) {
    if (!(arr instanceof Array))
        throw new Error('it is not array');
    this._count = arr.length;
    this.init(arr);
}

heap.prototype.add = function (obj) {
    if (obj == null)
        throw new Error('object is null');

    var i = this._count++;
    if (i == 0)
        this._queue[0] = obj;
    else
        this._siftUp(i, obj);
}

heap.prototype.clear = function () {
    this._queue = [];
}

heap.prototype.cotains = function (obj) {
    return this._queue.indexOf(obj) == -1 ? false : true;
}

heap.prototype.peek = function () {
    if (this._count == 0)
        throw new Error('heap is Empty');

    return this._queue[0];
}

heap.prototype.poll = function () {
    if (this._count == 0)
        throw new Error('heap is Empty');

    var result = this._queue[0];

    if (--this._count != 0)
        this._siftDown(0, this._queue[this._count]);

    return result;
}

//test 
heap.prototype.pop = heap.prototype.poll;

heap.prototype.remove = function (obj) {
    var i = this._queue.indexOf(obj);
    if (i == -1)
        return false;

    this._removeAt(i);
    return true;
}

heap.prototype.size = function () {
    return this._count;
}

heap.prototype.isEmpty = function() {
    return this._count == 0;
}

heap.prototype._defaultCompare = function (x, y) {
    if (typeof x === 'number' && typeof y === 'number') {
        return x - y;
    }
    x = y.toString();
    y = y.toString();

    if (x == y) {
        return 0;
    }

    return x > y ? 1 : -1;
}

/**
 * 建堆函数: 花费时间O(n)
 * 1.从倒数第二层依次从下至上做上移动作
 * h为高度，n为节点数量，h = logn
 * ①2^0(h-0) + 2^1(h-1) + ...... + 2^(h-2)(h-(h-2)),即ak=2^k(h-k)=h2^k - k2^k
 * {(2^k)' = k2^(k-1),∑k2^k = 2*∑(2^k)' = (k+1)2^(k+1)}
 * Sk=h[2^(k+1)-2] - (k+1)2^(k+1),将k=[0,h-2]代入，得到2^(h-1) - h < 2^h = n
 * ②Sn = 1 + c + c^2 + ... + c^n + ... < (1-c^n)/(1-c) < 1/(1-c)
 *   Sn' = 1 + 2c^1 + 3c^2 + . . . . < 1/(1-c)^2
 * 1*2^(h-2) + 2*2^(h-3) + 3*2^(h-4) + ....... + h*2^0 = 2^(h-2)[1 + 2*0.5 + 3*0.5^2 + ... + h*0.5^(h-1)] < 2^(h-2) * 1/(1 - 0.5)^2 = 2^h = n
 * @private
 * @param {Arrayrr} arr 与比较器相对应的数组
 */
heap.prototype._constructHeap = function (arr) {
    var size = this._count,
        queue = this._queue,
        i;
    for (i = (size >> 1) - 1; i >= 0; i--) {
        this._siftDown(i, queue);
    }
}

/**
 * @Param 删除元素的数组下标
 *        前提条件是保证下标元素存在
 * @Desc  只是对下标进行操作，实际并没有删除
 *        如果使用heap规模保持一定，效果不错
 *        如果一次性增加很多，慢慢删除，对空间有一定影响
 */
heap.prototype._removeAt = function (index) {
    var queue = this._queue, size = this._count;
    if (--size != 0) {
        queue[index] = queue[size];
        this._siftDown(index, queue[index]);
    }
}

/**
 * 堆中上移函数
 * @private
 * @param {number} i   相对的数据下标
 * @param {object} obj 上移对象     
 */
heap.prototype._siftUp = function (i, obj) {
    var parent, parentIndex,
        compare = this._compare,
        queue = this._queue;
    while (i > 0) {
        parentIndex = ((i + 1) >> 1) - 1;
        parent = queue[parentIndex];
        if (compare(obj, parent) >= 0)
            break;
        queue[i] = parent;
        i = parentIndex;
    }
    queue[i] = obj;
}


/**
 * 堆中下移函数
 * @private
 * @param {number} i   相对的数据下标0
 * @param {object} obj 下移对象
 */
heap.prototype._siftDown = function (i, obj) {
    var lchildIndex = (i << 1) + 1,
        rchildIndex, minIndex = lchildIndex,
        size = this._count,
        compare = this._compare,
        queue = this._queue;

    while (lchildIndex < size) {
        rchildIndex = lchildIndex + 1;
        if (rchildIndex < size) {
            minIndex = compare(queue[rchildIndex], queue[lchildIndex]) < 0 ?
                rchildIndex : lchildIndex;
        }

        if (compare(obj, queue[minIndex]) <= 0)
            break;

        queue[i] = queue[minIndex];
        i = minIndex;
        lchildIndex = (i << 1) + 1;
    }
    queue[i] = obj;
}

heap.prototype.test = function() {
    var i;
    for (i = 0; i < 10; i++) {
        this.add(Math.random() * 100);
    }
    
    for (i = 0; i < 10; i++) {
        console.log(this.poll());
    }
}
