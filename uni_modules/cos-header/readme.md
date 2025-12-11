# cos-header 自定义头部


::: tip 组件名：cos-header
[点击下载&安装](https://ext.dcloud.net.cn/plugin?name=cos-header)
:::



## 介绍

导航栏组件，主要用于自定义头部导航。

### 基本用法

```html
<cos-header title="导航栏组件"></cos-header>
```

### 自定义颜色、背景色、背景图

`font-color` :属性修改导航栏前景色（文字图标颜色）

`background-color`: 属性修改导航栏背景色

`background-image` :属性修改导航栏图片

```html
<cos-header title="导航栏组件" font-color="blue" background-color="#efefef" :background-image="backgroundImage"> </cos-header>
```

### 固定导航栏

`fixed`: 固定导航栏
```html
<cos-header title="导航栏组件" fixed>
```


### 自定义左侧图标

为什么要定义两个？

因为当分享页面或者转发时，别人点击到页面，没有后一页，会显示主页图标，如果是直接点击进入，则显示返回图标。


使用`homeUrl` 或者 `backUrl`，配合`jumpMap`方法使用，确定对应页面是否是tabbar页面。

注意：默认使用`navigateTo`跳转，失败时尝试`switchTab`,都不成功请进行自定义配置

```html
<cos-header 
	title="导航栏组件" 
	:home-icon="homeIcon" 
	:back-icon="backIcon"
	:jumpMap="{
		home: 'navigateTo',
		back: 'navigateTo'
	}"
	>
</cos-header>
```

### 是否显示左右侧部分、左侧返回图标

`isShowBack`: 是否显示左侧返回图标，当`isShowLeft`为false时不生效
`isShowLeft`: 是否显示左侧区域
`isShowRight`: 是否显示右侧

```html
<cos-header title="导航栏组件" :is-show-back="false"></cos-header>
```

### 合并左侧和中间区域

用于添加特定的搜索框
```html
<cos-header title="导航栏组件" :is-hide-left="true" :z-index="9999" :fixed="fixed">
<input type="text" style="width: 200px; height:40px; border: 1px solid #efefef; border-radius: 10px;" />
</cos-header>
```

### 滚动时背景字体渐变

```js
onPageScroll(e) {
	if (e.scrollTop < 5) {
		this.fontColor = '#fff'
		this.backgroundColor = ''
	} else if (e.scrollTop < 50) {
		const rate = e.scrollTop / 50
		this.backgroundColor = `rgba(255,255,255, ${rate})`
		this.fontColor = `rgba(0,0,0, ${rate})`
	} else {
		this.backgroundColor = 'rgba(255,255,255)'
		this.fontColor = 'rgba(0,0,0)'
	}
}
```


## API

### NavBar Props

| 属性名				| 类型		| 默认值					| 说明															|
| :--:					| :--:		| :--:					| :--:															|
| title					| String	| -						| 标题文字														|
| homeUrl				| String	| /pages/index/index	| 左侧点击返回主页地址											|
| homeIcon				| String	| -						| 左侧主页图标													|
| backUrl				| String	| -						| 左侧点击返回地址												|
| backIcon				| String	| -						| 左侧返回图标													|
| fixed					| Boolean	| false					| 是否固定顶部													|
| zIndex				| Number	| 99					| 显示层级														|
| backgroundColor		| String	| #fff					| 导航栏背景颜色													|
| backgroundImage		| String	| #000					| 导航栏背景图片													|
| fontColor				| String	| -						| 图标和文字颜色													|
| isShowBack			| Boolean	| true					| 是否显示返回图标，isShowLeft为false时设置无效					|
| isShowLeft			| Boolean	| true					| 是否显示左侧区域												|
| isShowRight			| Boolean	| true					| 是否显示右侧区域												|
| defaultNavBarheight	| Number	| 40					| 默认导航栏高度，只有在app或者h5时有效							|
| defaultMenuWidth		| Number	| 40					| 默认左右的宽度													|
| jumpMap				| Object	| {home: '',back: ''}	| 不配置时，默认navigateTo,出错switchTab，可自定义左侧跳转方法映射	|


**Tips**
- 左右宽度设置defaultMenuWidth即可，左右宽度默认一致


### NavBar Slots
支持向 NavBar 里插入不同内容，以达到自定义的目的。

|slot名	|说明|
|:-:|:-:|
|default|向导航栏中间插入	|
|left|向导航栏左侧插入	|
|right	|向导航栏右侧插入	|

```html
<cos-header>
    <view>标题栏</view>
    <view v-slot:left>left</view>
    <view v-slot:right>right</view>
</cos-header>
```

## 示例
::: warning 注意
返回按钮只默认返回，不支持其他操作，如果需要其他操作请使用slot进行自定义
:::

