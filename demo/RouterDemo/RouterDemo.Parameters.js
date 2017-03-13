/*路由列表*/
RouterList = {
    0: BFSRouterProcessor,
    1: BFS,
    2: Greed,
    3: AStar,
    4: DoubleBFS,
    5: DoubleGreed,
    6: DoubleAStar,
    7: DoReAs,
    8: Jump,
    9: HeapBSF,
    10: HeapGreed,
    11: HeapStar
};

/*距离计算方式*/
DistanceList= {
    0: manhattanDistance,
    1: eulerDistance
};

/*注册router*/
ROUTER = RouterList[7];

/*注册距离计算方式*/
DISTANCE = DistanceList[0];

/*寻路延迟*/
DELAY = 50;

/*用于计算的斜边长度与直角边长度*/
BE = 14;
RE = 10;

/*是否可以走斜边*/
DIAGONAL = true;