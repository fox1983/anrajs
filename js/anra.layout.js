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
        "marginLeft":6,
        "marginTop":5,
        "marginRight":6,
        "marginBottom":5,
        "horizontalSpacing":5,
        "verticalSpacing":5,

        "marginTopUsed":0,
        "marginLeftUsed":0,
        "currentWidth":0,
        "currentHeight":0,
        "maxColumnWidth":0,
        "maxColumnHeight":0,

        "XYArr":[]
    },



    constructor:function(numColumns, makeColumnsEqualWidth) {

        if (numColumns && makeColumnsEqualWidth) {
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
    getMaxColumnWH:function(chBounds,parArg){
        if(parArg.maxColumnWidth < chBounds.width){
            parArg.maxColumnWidth = chBounds.width;
            //调用由于列最大宽度改变而更新x,y
        }
        if(parArg.maxColumnHeight < chBounds.height){
            parArg.maxColumnHeight = chBounds.height;
            //调用由于列最大高度改变而更新x,y
        }


    },

    getAvailableWidth:function(p){
        return p.getBounds().width - p.layoutManager.arg.marginRight
            - p.layoutManager.arg.marginLeftUsed;   //求得本行可用宽度
    },

    getAvailableHeight:function(p){
        //alert(p.getBounds().height+" "+p.layoutManager.arg.marginBottom+" "+p.layoutManager.arg.marginTopUsed);
        return p.getBounds().height - p.layoutManager.arg.marginBottom
            - p.layoutManager.arg.marginTopUsed;
    },

    getXY:function(parArg, chBounds){
        //debugger
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

    updateXY:function(p){
        //清空

    },
    cumpute:function(c,p){
        var chBounds = c.getBounds();
        var parArg = p.layoutManager.arg;
        //var
        var marginTopNext ;
        var marginLeftNext;


        if(parArg.makeColumnsEqualWidth){    //列等宽
            var availableWidth = this.getAvailableWidth(p);   //求得本行可用宽度
            var availableHeight = this.getAvailableHeight(p);

            if(availableHeight<=0){
                alert("return");
                return;
            }

            //求得每个单位格子的宽和高
            this.getMaxColumnWH(chBounds,parArg);

            //alert("可用宽度："+availableWidth+","+"列最大宽度："+parArg.maxColumnWidth);   //讨论可用宽度
            if(availableWidth<= parArg.maxColumnWidth+ 2*parArg.horizontalSpacing){

                marginTopNext = parArg.marginTopUsed +
                parArg.maxColumnHeight + parArg.verticalSpacing;
                marginLeftNext = parArg.marginLeft;

                if(chBounds.width > availableWidth-parArg.horizontalSpacing){
                    chBounds.width = availableWidth- parArg.horizontalSpacing;
                }
            }
            if(availableHeight< parArg.maxColumnHeight){
                if(chBounds.height > availableHeight-parArg.verticalSpacing){
                    chBounds.height = availableHeight- parArg.verticalSpacing;
                }

            }

            this.getXY(parArg,chBounds);

            //更新
            if(marginTopNext && marginLeftNext){
                //debugger
                //alert("ddd");
                parArg.marginLeftUsed = marginLeftNext;
                parArg.marginTopUsed = marginTopNext;
            }else{
                if(parArg.marginLeftUsed == parArg.marginLeft){
                    parArg.marginLeftUsed = parArg.marginLeftUsed+
                        /*parArg.horizontalSpacing+*/ parArg.maxColumnWidth;
                }else{
                    parArg.marginLeftUsed = parArg.marginLeftUsed+
                    parArg.horizontalSpacing+ parArg.maxColumnWidth;
                }

            }

            p.addChild(c);
            //p.removeChild(c);

            parArg.XYArr.push(
                {
                    child:c
                }
            );

        }else{

        }


    }
});