/**
 * Created with JetBrains WebStorm.
 * User: Hasee
 * Date: 16-7-14
 * Time: 上午9:51
 * To change this template use File | Settings | File Templates.
 */
/**
 * 网格布局,提供给Composite使用
 * @type {*}
 */
//anra.svg.GridLayout.numColumns = 3;
//anra.svg.GridLayout.makeColumnsEqualWidth=false;

anra.svg.GridLayout = anra.svg.Layout.extend({

    arg:{

        "numColumns":1,             //列数目
        "makeColumnsEqualWidth":false,      //列宽度是否相等，当为false，列宽度与部件的宽度一样
        "marginWidth":5,
        "marginHeight":5,
        "marginLeft":5,
        "marginTop":5,
        "marginRight":5,
        "marginBottom":5,
        "horizontalSpacing":5,
        "verticalSpacing":5,

        "marginTopUsed":0,
        "marginLeftUsed":0,

        "maxColumnWidth":0,
        "maxColumnHeight":0,
        "currentColumnNum":0

    },

    getMaxColumnWH:function(chBounds,parArg){
        if(parArg.maxColumnWidth < chBounds.width){
            parArg.maxColumnWidth = chBounds.width;
        }
        if(parArg.maxColumnHeight < chBounds.height){

            parArg.maxColumnHeight = chBounds.height;
        }
    },

    getMaxColumnW:function(chBounds,parArg){
        if(parArg.maxColumnWidth < chBounds.width){
            parArg.maxColumnWidth = chBounds.width;
        }
    },

    getMaxColumnH:function(chBounds,parArg){
        if(parArg.maxColumnHeight < chBounds.height){

            parArg.maxColumnHeight = chBounds.height;
        }
    },

    getAvailableWidth:function(p){
        return p.getBounds().width - p.layoutManager.arg.marginRight
            - p.layoutManager.arg.marginLeftUsed;   //求得本行可用宽度
    },

    getAvailableHeight:function(p){
        return p.getBounds().height - p.layoutManager.arg.marginBottom
            - p.layoutManager.arg.marginTopUsed;
    },

    getXY:function(parArg, chBounds){

            if(parArg.marginLeftUsed == parArg.marginLeft &&
                parArg.marginTopUsed == parArg.marginTop){    //这是第一行第一个

                chBounds.x = parArg.marginLeftUsed;
                chBounds.y = parArg.marginTopUsed;

            }else if(parArg.marginLeftUsed == parArg.marginLeft){           //这是第一列的

                chBounds.x = parArg.marginLeftUsed;
                chBounds.y = parArg.marginTopUsed + parArg.verticalSpacing;

            }else if(parArg.marginTopUsed == parArg.marginTop){             //这是第一行的

                chBounds.x = parArg.marginLeftUsed + parArg.horizontalSpacing;
                chBounds.y = parArg.marginTopUsed;

            }else{

                chBounds.x = parArg.marginLeftUsed + parArg.horizontalSpacing;
                chBounds.y = parArg.marginTopUsed + parArg.verticalSpacing;

            }

    },



    compute:function(c,p){
        var chBounds = c.getBounds();
        var parArg = p.layoutManager.arg;

        var changeLine = false;

        var availableWidth = this.getAvailableWidth(p);   //求得本行可用宽度
        var availableHeight = this.getAvailableHeight(p);

        if(availableHeight<=0){
            c.getBounds().width = 0;
            c.getBounds().height = 0;
            return;
        }

        if(parArg.makeColumnsEqualWidth){    //列等宽

            //计算最大宽度和最大高度
            this.getMaxColumnWH(chBounds,parArg);


            if(parArg.currentColumnNum == parArg.numColumns ||
                        (availableWidth >= 0 && availableWidth <= parArg.horizontalSpacing)){   //如果一行达到想要的数目则换行
                changeLine = true;

                parArg.marginLeftUsed = parArg.marginLeft;

                if(parArg.marginTopUsed == parArg.marginTop){
                    parArg.marginTopUsed += parArg.maxColumnHeight;
                }else{
                    parArg.marginTopUsed = parArg.marginTopUsed + parArg.verticalSpacing
                                    + parArg.maxColumnHeight;
                }

            }
            availableWidth = this.getAvailableWidth(p);
            availableHeight = this.getAvailableHeight(p);

            this.getXY(parArg,chBounds);

            //限定单位方格宽度不能超过parent
            if(chBounds.width > availableWidth){
                chBounds.width = availableWidth - parArg.horizontalSpacing;
                //temp = chBounds.width;
            }

            //限定单位方格高度不能超过parent
            if(chBounds.height > availableHeight){
                chBounds.height = availableHeight - parArg.verticalSpacing;
            }

            if(parArg.marginLeftUsed == parArg.marginLeft){
                parArg.marginLeftUsed += parArg.maxColumnWidth;
            }else{
                parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + parArg.maxColumnWidth;
            }


            if(changeLine){    //换行
                parArg.currentColumnNum = 1;
            }else{
                parArg.currentColumnNum ++;
            }

        }else{
            //计算最大高度
            this.getMaxColumnH(chBounds,parArg);

            /**
             * 换行，换行的条件有：(1)当前行的数目等于预设的数目
             * (2)可用宽度大于等于0，小于等于行间距
             */
            if(parArg.currentColumnNum == parArg.numColumns ||
                                    (availableWidth >= 0 && availableWidth <= parArg.horizontalSpacing)){  //本次换行
                //设定换行标识
                changeLine = true;

                //换行后左已用宽度等于左边缘
                parArg.marginLeftUsed = parArg.marginLeft;

                //换行后上已用宽度等于上已用宽度加上最大高度
                if(parArg.marginTopUsed == parArg.marginTop){
                    parArg.marginTopUsed = parArg.marginTopUsed+parArg.maxColumnHeight;
                }else{
                    parArg.marginTopUsed = parArg.marginTopUsed+parArg.maxColumnHeight+parArg.verticalSpacing;
                }

            }
            //重新计算可用宽度和高度
            availableWidth = this.getAvailableWidth(p);
            availableHeight = this.getAvailableHeight(p);
            //计算坐标
            this.getXY(parArg,chBounds);

            //限定单位方格宽度不能超过parent
            if(chBounds.width > availableWidth){
                chBounds.width = availableWidth - parArg.horizontalSpacing;
            }

            //限定单位方格高度不能超过parent
            if(chBounds.height > availableHeight){
                chBounds.height = availableHeight - parArg.verticalSpacing;
            }


            if(parArg.marginLeftUsed == parArg.marginLeft){
                parArg.marginLeftUsed = parArg.marginLeftUsed+ chBounds.width;
            }else{
                parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + chBounds.width;
            }

            if(changeLine){    //换行
                parArg.currentColumnNum = 1;
            }else{
                parArg.currentColumnNum ++;
            }

        }
    },

    layout:function(p){

        var parArg = p.layoutManager.arg;

        parArg.currentColumnNum=0;
        parArg.marginLeftUsed = parArg.marginLeft;
        parArg.marginTopUsed = parArg.marginTop;


        for(var i = 0; i < p.children.length; i ++){
            var c = p.children[i];
            c.getBounds().x = 0;
            c.getBounds().y = 0;
            this.compute(c,p);
            c.applyBounds();
        }


    },

    constructor:function(numColumns, makeColumnsEqualWidth) {
        if (numColumns /*&& makeColumnsEqualWidth || numColumns && !makeColumnsEqualWidth*/) {
            this.arg.numColumns = numColumns;
            this.arg.makeColumnsEqualWidth = makeColumnsEqualWidth;

        }
        this.arg.marginTopUsed = this.arg.marginTop;
        this.arg.marginLeftUsed = this.arg.marginLeft;
    }
});

/**
 *提供给Control
 * @type {*}
 */
anra.svg.GridData = Base.extend({

    constructor:function(p,c){
        p.layoutManager.compute(c,p);
        c.applyBounds();
    }

});