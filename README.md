#Anrajs 一个基于SVG的图形编辑器框架

Anrajs的核心在于“编辑器”，它提供了和图形编辑有关的一系列功能，比如：
1、拖拽
2、连线
3、快捷键
4、事件处理
5、图形绘制
6、选择监听
等等，其中，最重要的是，它提供了完整的MVC模式开发方式。






#起步


------------


##定义一个编辑器

```javascript

var editor=new $AG.Editor({
	id: 'editorPanel',
	data: [
		{id: 1, type: 'rectNode', bounds: [100, 100, 30, 30],color:'red'},
		{id: 2, type: 'rectNode', bounds: [150, 100, 30,30],color:'blue'},
		{id: 3, type: 'circleNode', bounds: [200, 200, 40]}
		],
	children: {
			'rectNode': rectNodeConfig,
			'circleNode': circleNodeConfig
		}
});

```

$AG是anrajs的对外接口，主要用于流程图创建。
$AG.Editor即是“编辑器”，是顶层的容器。
它有三个核心属性：

|  属性名 | 说明  |
| :------------ | :------------ |
| id  | 指定一个div id，否则抛出异常  |
|  data |  数据模型，会被存放到taffy数据库中，每个条目将会对应一个节点，id为必须项，不能重复，type为必须项目，用于决定节点类型 |
|children|节点类型配置单，由data.type确定对应的节点类型|



##定义节点类型

在编辑器的配置单里，可以注意到两个未定义对象rectNodeConfig和circleNodeConfig。
这是两个由用户定制的配置单，分别代表矩形节点和原型节点，当然，用户还可以根据自己的需求定制更加丰富的节点图形。

```javascript
var rectNodeConfig = {
	refresh: function () {
		if (this.model != null && this.figure != null) {
			var b = this.model.get('bounds');
			this.figure.bounds = {x: b[0], y: b[1], width: b[2], height: b[3]};
			this.figure.style.fill = this.model.get('color');
		}
		this.figure.paint();
   },
	type: $AG.RECT
};

var circleNodeConfig = {
	refresh: function () {
		if (this.model != null && this.figure != null) {
			var b = this.model.get('bounds');
			this.figure.bounds = {x: b[0], y: b[1], width: b[2]};
		}
		this.figure.paint();
	},
	type: $AG.CIRCLE
};

```

节点配置有两个关键属性：


|  属性名 | 说明  |
| :------------ | :------------ |
| refresh  | 刷新函数，当模型发生修改或者主动主动触发刷新的时候，会调用到的函数，用于同步视图，属于控制器核心方法  |
|  type |  视图配置单，用于指定视图的具体样式，样式可以使用SVG绘制，也可以使用$AG.IMAGE来调取图片|


<p>

#快捷键和菜单

------------



##添加快捷键和右键菜单
在前一章节的编辑器$AG.Editor配置中，加入操作配置
```javascript
operations: [
			{
				id: 0,
				type: ACTION_EDITOR,
				key: 'ctrl+shift+g',
				run: function () {
					alert('按下了ctrl+shift+g');
				}
			},
			{
				id: 1,
				name:'选中',
				type: ACTION_SELECTION,
				run: function () {
					alert('选中节点ID:'+this.selection.model.get('id'));
				}
			}
		]
```

operations是操作配置，它是一个数组，每一个条目对应一个操作。
operation的关键属性如下：

|  名称 |说明   |
| ------------ | ------------ |
|  id |唯一标识，不可重复   |
|   type| 操作类型，会决定可用的成员变量(editor\stack\selection)  |
|name|名称，不填该操作不会出现在菜单里|
|key|快捷键，不填该操作不会具备快捷键|
|run|执行函数|
|check|检查函数，返回true则可执行，false则不可执行。不填写默认为true|


操作type分三种：

| 类型  | 说明  |
| ------------ | ------------ |
| ACTION_SELECTION  | 选择动作，选中目标的变化会决定它的可执行性，具备成员变量selection  |
|ACTION_STACK | 命令栈操作，命令栈的变化会决定它的可执行性，具备成员变量stack |
|  ACTION_EDITOR |  全局动作，具备成员变量editor |


举例，在上面的例子中，选中某个节点右键，可以看到选中的节点id，如果，限制选中节点为矩形时，才展示菜单，则需要加入check函数，如下所示：

```javascript
			{
				id: 1,
				name:'选中',
				type: ACTION_SELECTION,
				run: function () {
					alert('选中节点ID:'+this.selection.model.get('id'));
				},
				check:function(){
					return this.selection!=null&&this.selection.model.get('type')=='rectNode';
				}
			}

```

------------



#连线
连线是图形编辑器的基本能力之一

------------


##为编辑器配置连线
为$AG.Editor增加如下配置
```javascript
line:[
	{id: 'line1', source: 1, type: 0, target: 3, exit: 0, entr: 1},
	{id: 'line2', source: 2, type: 0, target: 3, exit: 0, entr: 2}
],
lines: {
    0: lineConfig
}
```
line为连线模型，lines为连线配置单。
连线模型属性有严格限制：

| 属性名  |说明   |
| ------------ | ------------ |
|id   |唯一标识   |
|source   | 源节点id  |
|  target | 目标节点id  |
|  type | 连线类型  |
|  exit | 源节点出口标识  |
|entr|目标节点入口标识|


在$AG.Editor里，添加连线配置和添加节点配置(children)性质是一样的。
连线配置单如下：

```javascript
            var lineConfig = {
                style: {
                    'stroke-width': 1,
                    stroke: 'green'
                },
                type: $AG.LINE
            };
```

可以注意到，连线模型里除了指定了节点的id以外，还指定了节点端口，所以需要为节点配置增加端口配置：
```javascript
            var rectNodeConfig = {
                canDrag:true,
                refresh: function () {
                   ....
                },
                anchor: [
                    {id: 0, dir: 's', offset: 5},
                    {id: 1, dir: 's', offset: 5}
                ],
                type: $AG.RECT
            };
            var circleNodeConfig = {
                canDrag:true,
                refresh: function () {
                  ...
                },
                anchor: [
                    {id: 0, dir: 'c', offset: 0},
                    {id: 1, dir: 'n', offset: 0}
                ],
                type: $AG.CIRCLE
            };
```

只需要关注anchor配置部分。
有三个基本属性：

| 属性名  |说明   |
| ------------ | ------------ |
| id  |端口唯一标识   |
|  dir |方向，包括 s,n,e,a,c五个方向，支持用户定制|
|offset|方向上的偏移量，支持用户定制|

除此之外，节点加上了canDrag属性，于是，该节点可以被拖拽移动了，当然，连线也会跟随着移动。


