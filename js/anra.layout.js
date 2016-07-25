/**
 * Created with JetBrains WebStorm.
 * User: Caiyu
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
        "numRows":1,
        "makeColumnsEqualWidth":false,      //列宽度是否相等，当为false，列宽度与部件的宽度一样
        "marginWidth":5,
        "marginHeight":5,
        "marginLeft":2,
        "marginTop":2,
        "marginRight":2,
        "marginBottom":2,
        "horizontalSpacing":15,
        "verticalSpacing":15,

        "marginTopUsed":0,
        "marginLeftUsed":0,

        "maxColumnWidth":0,
        "maxColumnHeight":0,
        "currentColumnNum":0

    },

    layout:function(p){

        var parArg = p.layoutManager.arg;

        parArg.currentColumnNum=0;
        parArg.marginLeftUsed = parArg.marginLeft;
        parArg.marginTopUsed = parArg.marginTop;


        for(var i = 0; i < p.children.length; i ++){
            var c = p.children[i];
            c.layoutData.x = 0;
            c.layoutData.y = 0;
            c.layoutData.compute(c,p);
            c.applyBounds();

        }
    },

    constructor:function(numColumns, makeColumnsEqualWidth, p) {
        var arg = this.arg;
        if (numColumns) {
            arg.numColumns = numColumns;
            if(makeColumnsEqualWidth){
                arg.maxColumnWidth = (p.getBounds().width - arg.marginLeft - arg.marginRight)/(1.0*numColumns);
            }

            
            arg.makeColumnsEqualWidth = makeColumnsEqualWidth;

        }
        arg.marginTopUsed = arg.marginTop;
        arg.marginLeftUsed = arg.marginLeft;
    }


});

/**
 *提供给Control
 * @type {*}
 */
anra.svg.GridData = Base.extend({
    widthReal:0,
    heightReal:0,

    width:0,
    height:0,

    //定义一个属性，设置该方格占用多少个横格子，只有当makeColumnsEqualWidth为true的时候才有用
    //并且设置的widthReal将不起作用
    usedColumn:0,
    usedRow:0,

    x:0,
    y:0,
    /**
     *
     * @param p     父容器
     * @param c     this的所属对象
     * @param widthReal 实际宽度（但显示在html不一定是实际的宽度）
     * @param heightReal  实际高度（但显示在html不一定是实际的高度）
     * @param usedColumn 占用列数
     * @param usedHeight 占用行数
     */
    constructor:function(p,c, widthReal, heightReal, usedColumn, usedHeight){
        this.widthReal = widthReal;
        this.heightReal = heightReal;
        this.usedColumn = usedColumn;
        this.usedHeight = usedHeight;


        this.compute(c,p);    //计算c的x,y，并且在必要时重新计算width、height
    },



    compute:function(c,p){
        //alert(this.usedColumn);
        this.width = this.widthReal;
        this.height = this.heightReal;

        var parArg = p.layoutManager.arg;

        var changeLine = false;

        var availableWidth = this.getAvailableWidth(p);   //求得本行可用宽度
        var availableHeight = this.getAvailableHeight(p);

        if(availableHeight<=0){
            this.width = 0;
            this.height = 0;
            return;
        }

        if(parArg.makeColumnsEqualWidth){    //列等宽
            //计算最大宽度和最大高度
            if(this.usedColumn == 0 || typeof(this.usedColumn) == 'undefined'){
                this.getMaxColumnW(parArg);
            }
            this.getMaxColumnH(parArg);

            if(parArg.currentColumnNum == parArg.numColumns ||
                (availableWidth >= 0 && availableWidth <= parArg.horizontalSpacing) ||
                        availableWidth<0){   //如果一行达到想要的数目则换行

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

            this.setXY(parArg);


            if(this.usedColumn > 0){
                this.width = this.usedColumn * parArg.maxColumnWidth;
            }

            //限定单位方格宽度不能超过parent
            if(this.width > availableWidth){
                if(this.usedColumn > 0){
                    this.width = p.getBounds().width - parArg.marginLeft - parArg.marginRight;
                }else{
                    this.width = availableWidth - parArg.horizontalSpacing;
                }
            }

            //限定单位方格高度不能超过parent
            if(this.height > availableHeight){
                this.height = availableHeight - parArg.verticalSpacing;
            }

            if(parArg.marginLeftUsed == parArg.marginLeft){
                if(this.usedColumn > 0){
                    parArg.marginLeftUsed += this.width;
                }else{
                    parArg.marginLeftUsed += parArg.maxColumnWidth;
                }
            }else{
                if(this.usedColumn > 0){
                    parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + this.width;
                }else{
                    parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + parArg.maxColumnWidth;
                }
            }


            if(changeLine){    //换行
                parArg.currentColumnNum = 1;
            }else{
                parArg.currentColumnNum ++;
            }

        }else{
            //计算最大高度
            this.getMaxColumnH(parArg);

            /**
             * 换行，换行的条件有：(1)当前行的数目等于预设的数目
             * (2)可用宽度大于等于0，小于等于行间距
             */
            if(parArg.currentColumnNum == parArg.numColumns ||
                (availableWidth >= 0 && availableWidth <= parArg.horizontalSpacing
                        || availableWidth<0)){  //本次换行
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
            this.setXY(parArg);

            //限定单位方格宽度不能超过parent
            if(this.width > availableWidth){
                this.width = availableWidth - parArg.horizontalSpacing;
            }

            //限定单位方格高度不能超过parent
            if(this.height > availableHeight){
                this.height = availableHeight - parArg.verticalSpacing;
            }


            if(parArg.marginLeftUsed == parArg.marginLeft){
                parArg.marginLeftUsed = parArg.marginLeftUsed+ this.width;
            }else{
                parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + this.width;
            }

            if(changeLine){    //换行
                parArg.currentColumnNum = 1;
            }else{
                parArg.currentColumnNum ++;
            }

        }
        //c.getBounds().x = this.x;
        //c.getBounds().y = this.y;
        //c.getBounds().width = this.width;
        //c.getBounds().height = this.height;
        debugger
        c.setBounds({
            x:this.x,
            y:this.y,
            width:this.width,
            height:this.height
        });
    },

    //==============
    getMaxColumnWH:function(parArg){
        if(parArg.maxColumnWidth < this.width){
            parArg.maxColumnWidth = this.width;
        }
        if(parArg.maxColumnHeight < this.height){

            parArg.maxColumnHeight = this.height;
        }
    },

    getMaxColumnW:function(parArg){
        if(parArg.maxColumnWidth < this.width){
            parArg.maxColumnWidth = this.width;
        }
    },

    getMaxColumnH:function(parArg){
        if(parArg.maxColumnHeight < this.height){

            parArg.maxColumnHeight = this.height;
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

    setXY:function(parArg){

        if(parArg.marginLeftUsed == parArg.marginLeft &&
            parArg.marginTopUsed == parArg.marginTop){    //这是第一行第一个

            this.x = parArg.marginLeftUsed;
            this.y = parArg.marginTopUsed;

        }else if(parArg.marginLeftUsed == parArg.marginLeft){           //这是第一列的

            this.x = parArg.marginLeftUsed;
            this.y = parArg.marginTopUsed + parArg.verticalSpacing;

        }else if(parArg.marginTopUsed == parArg.marginTop){             //这是第一行的

            this.x = parArg.marginLeftUsed + parArg.horizontalSpacing;
            this.y = parArg.marginTopUsed;

        }else{

            this.x = parArg.marginLeftUsed + parArg.horizontalSpacing;
            this.y = parArg.marginTopUsed + parArg.verticalSpacing;

        }

    }

    //==============

});