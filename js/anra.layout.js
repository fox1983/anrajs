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

    arg:null,

    layout:function(p){
        if(p.children == null){
            return;
        }

        var arg = p.layoutManager.arg;

        //清为原始数据
        arg.marginTopUsed = arg.marginTop;
        arg.marginLeftUsed = arg.marginLeft;
        arg.currentColumnNum = 0;
        arg.parent = p;
        arg.pWidth = p.getBounds().width;
        arg.pHeight = p.getBounds().height;
        arg.maxColumnWidth = 0;
        arg.maxColumnHeight = 0;


        //确定max
        for(var i = 0; i < p.children.length; i++){
            var c = p.children[i];
            if(typeof(c.layoutData.columns) == 'undefined' && c.layoutData.width > arg.maxColumnWidth){
                arg.maxColumnWidth = c.layoutData.width;
            }

            if(c.layoutData.rows > 0){
                    c.layoutData.height =
                        c.layoutData.rows * (arg.pHeight - arg.marginTop - arg.marginBottom)/(1.0 * arg.numRows)
            }

            if(c.layoutData.height > arg.maxColumnHeight){
                arg.maxColumnHeight = c.layoutData.height;
            }
        }
        for(var i = 0; i < p.children.length; i ++){
            var c = p.children[i];
            c.layoutData.x = 0;
            c.layoutData.y = 0;
            c.layoutData.compute(p.layoutManager.arg, c);
            c.applyBounds();
        }
    },

    constructor:function(numColumns, makeColumnsEqualWidth, p) {
        this.arg={
            "numColumns":1,             //列数目
            "numRows":NaN,        //默认undefined
            "makeColumnsEqualWidth":false,      //列宽度是否相等，当为false，列宽度与部件的宽度一样
            //"marginWidth":5,
            //"marginHeight":5,
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
            "currentColumnNum":0,
            "pWidth":0,
            "pHeight":0


        };
        var arg = this.arg;

        arg.parent = p;
        arg.numColumns = numColumns;
        arg.makeColumnsEqualWidth = makeColumnsEqualWidth;

        arg.marginTopUsed = arg.marginTop;
        arg.marginLeftUsed = arg.marginLeft;
        arg.pWidth = p.getBounds().width;
        arg.pHeight = p.getBounds().height;

        arg.currentColumnNum = 0;
    },

    setNumRows:function(numRows, p){
        var arg = this.arg;
        arg.numRows = numRows;
        //arg.maxColumnHeight = (p.getBounds().height - arg.marginTop - arg.marginBottom)/(1.0*numRows);
    }


});

/**
 *提供给Control
 * @type {*}
 */
anra.svg.GridData = Base.extend({

    width:0,
    height:0,

    x:0,
    y:0,

    constructor:function(width, height){
        this.width = width;
        this.height = height;
    },

    setColumns:function(columns){
        this.columns = columns;
    },

    setRows:function(rows){
        this.rows = rows;
    },

    compute:function(parArg, c){

        var changeLine = false;

        var availableWidth = this.getAvailableWidth(parArg);   //求得本行可用宽度
        var availableHeight = this.getAvailableHeight(parArg);

        if(availableHeight<=0){
            this.width = 0;
            this.height = 0;
            return;
        }

        if(parArg.makeColumnsEqualWidth){    //列等宽
            //计算最大宽度和最大高度
            if(this.columns > 0){
                this.width = ((parArg.pWidth - parArg.marginRight - parArg.marginLeft)/(1.0 * parArg.numColumns)) *this.columns;
                //alert(this.height+","+parArg.parent.bounds.height);
            }

            //换行
            if(parArg.currentColumnNum == parArg.numColumns){   //如果一行达到想要的数目则换行

                changeLine = true;

                parArg.marginLeftUsed = parArg.marginLeft;

                if(parArg.marginTopUsed == parArg.marginTop){
                    parArg.marginTopUsed += parArg.maxColumnHeight;
                }else{
                    parArg.marginTopUsed = parArg.marginTopUsed + parArg.verticalSpacing
                         + parArg.maxColumnHeight;
                }

            }
            availableWidth = this.getAvailableWidth(parArg);
            availableHeight = this.getAvailableHeight(parArg);

            this.setXY(parArg);

            if(parArg.marginLeftUsed == parArg.marginLeft){
                if(this.columns > 0){
                    parArg.marginLeftUsed += this.width;
                }else{
                    parArg.marginLeftUsed += parArg.maxColumnWidth;
                }
            }else{
                if(this.columns > 0){
                    parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + this.width;
                }else{
                    parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + parArg.maxColumnWidth;
                }
            }

            if(changeLine){    //换行
                parArg.currentColumnNum = 1;
            }else{
                if(this.columns > 0){
                    parArg.currentColumnNum+=this.columns;
                }else{
                    parArg.currentColumnNum ++;
                }
            }

        }else{
            //if(this.rows > 0){
            //    this.height = ((parArg.pHeight - parArg.marginTop - parArg.marginBottom)/(1.0 * parArg.numRows)) * this.rows;
            //    this.getMaxColumnH(parArg);
            //}

            if(parArg.currentColumnNum == parArg.numColumns){  //本次换行
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
            availableWidth = this.getAvailableWidth(parArg);
            availableHeight = this.getAvailableHeight(parArg);
            //计算坐标
            this.setXY(parArg);

            if(parArg.marginLeftUsed == parArg.marginLeft){
                parArg.marginLeftUsed += this.width;
            }else{
                parArg.marginLeftUsed = parArg.marginLeftUsed + parArg.horizontalSpacing + this.width;
            }

            if(changeLine){    //换行
                parArg.currentColumnNum = 1;
            }else{
                parArg.currentColumnNum ++;
            }

        }

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

    getAvailableWidth:function(parArg){
        return parArg.pWidth - parArg.marginRight
            - parArg.marginLeftUsed;   //求得本行可用宽度
    },

    getAvailableHeight:function(parArg){
        return parArg.pHeight - parArg.marginBottom
            - parArg.marginTopUsed;
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