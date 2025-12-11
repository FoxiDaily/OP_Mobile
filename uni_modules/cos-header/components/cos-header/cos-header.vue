<!-- 帮我看看这段代码优化一下 -->
<template>
	<!-- #ifndef MP-ALIPAY -->
	<view class="cos-header" :class="{ 'is_fixed': fixed }"
		:style="{ height: height + 'px', backgroundColor: backgroundColor, zIndex: zIndex, color: fontColor }">
		<image :src="backgroundImage" class="nav-bg" mode="scaleToFill" :style="{ height: height + 'px' }"></image>
		<!-- 状态栏占位 -->
		<div :style="{ height: statusBarHeight + 'px' }"></div>
		<!-- 导航栏 -->
		<view class="nav-wrapper" :style="{ height: navBarHeight + 'px' }">
			<!-- 返回按钮 -->
			<view class="nav-back" v-if="isShowLeft" :style="{ width: menuButtonRect.width + 'px' }"
				@click="handleBack">
				<slot name="left">
					<!-- 支付宝自定义还是有返回按钮 -->
					<template v-if="isShowBack">
						<image v-if="isFirstPage" :src="homeIcon || '../../static/home.svg'" class="img">
						</image>
						<image v-else :src="backIcon || '../../static/prev.svg'" class="img"></image>
					</template>
				</slot>
			</view>
			<view class="nav-title">
				<slot>
					{{ title }}
				</slot>
			</view>
			<!-- 胶囊位置 -->
			<view class="nav-menu" v-if="isShowRight" :style="{ width: menuButtonRect.width + 'px' }">
				<slot name="right"></slot>
			</view>
		</view>
	</view>
	<!-- #endif -->
</template>
<script>
	/**
	 * NavBar 自定义导航栏
	 * @description 导航栏组件，主要用于头部导航
	 * @property {String} title 标题文字
	 * @property {String} homeUrl 左侧点击返回主页地址
	 * @property {String} homeIcon 左侧主页图标
	 * @property {String} backUrl 左侧点击返回地址
	 * @property {String} backIcon 左侧返回图标
	 * @property {Boolean} fixed = [true|false] 是否固定顶部
	 * @property {Number} zIndex = 显示层级
	 * @property {String} backgroundColor 导航栏背景颜色
	 * @property {String} backgroundImage 导航栏背景图片
	 * @property {String} fontColor 图标和文字颜色
	 * @property {Boolean} isShowBack 是否显示返回图标
	 * @property {Boolean} isShowLeft 是否显示左侧
	 * @property {Boolean} isShowRight 是否显示右侧
	 * @property {Number} defaultNavBarheight 默认导航栏高度
	 * @property {Number} defaultMenuWidth 默认菜单宽度
	 * @property {Object} jumpMap 主页跳转方法映射
	 */
	export default {
		name: "CosHeader",
		props: {
			title: {
				type: String,
				default: ''
			},
			homeUrl: {
				type: String,
				default: '/pages/index/index'
			},
			homeIcon: {
				type: String,
				default: ''
			},
			backUrl: {
				type: String,
				default: ''
			},
			backIcon: {
				type: String,
				default: ''
			},
			fixed: {
				type: Boolean,
				default: false
			},
			zIndex: {
				type: Number,
				default: 99
			},
			backgroundColor: {
				type: String,
				default: '#fff'
			},
			backgroundImage: {
				type: String,
				default: ''
			},
			fontColor: {
				type: String,
				default: '#000'
			},
			isShowBack: {
				type: Boolean,
				default: true
			},
			isShowLeft: {
				type: Boolean,
				default: true
			},
			isShowRight: {
				type: Boolean,
				default: true
			},
			defaultNavBarheight: {
				type: Number,
				default: 40
			},
			defaultMenuWidth: {
				type: Number,
				default: 40
			},
			jumpMap: {
				type: Object,
				default: () => ({
					home: '',
					back: ''
				})
			}
		},
		data() {
			return {
				// 状态栏
				statusBarHeight: 0,
				// 默认导航栏高度设置40，针对app和h5情况
				navBarHeight: this.defaultNavBarheight,
				// 胶囊信息
				menuButtonRect: {
					width: this.defaultMenuWidth
				},
				height: this.defaultNavBarheight,
				isFirstPage: true,
			}
		},
		mounted() {
			this.init()
		},
		methods: {
			init() {
				this.getRectInfo()
				this.getPageInfo()
				this.setTitle()
			},
			setTitle() {
				// 针对支付宝进行动态设置
				// #ifdef MP-ALIPAY
				uni.setNavigationBarTitle({
					title: this.title
				});
				// #endif
				// #ifdef H5
				document.title = this.title
				// #endif
			},
			getRectInfo() {
				// 获取状态栏高度
				const sysInfo = uni.getSystemInfoSync()
				this.statusBarHeight = sysInfo.statusBarHeight
				// 默认高度
				this.height = this.statusBarHeight + this.defaultNavBarheight
				// #ifndef APP || H5
				// 判断获取微信小程序胶囊API是否可用 H5出现为true情况无法使用
				if (uni.canIUse('getMenuButtonBoundingClientRect')) {
					// 获取微信小程序胶囊布局位置信息
					this.menuButtonRect = uni.getMenuButtonBoundingClientRect()
					// (胶囊上部高度-状态栏高度)*2 + 胶囊高度 = 导航栏高度（不包含状态栏）
					// 以此保证胶囊位于中间位置，多机型适配
					this.navBarHeight = (this.menuButtonRect.top - sysInfo.statusBarHeight) * 2 + this.menuButtonRect
						.height
					// 状态栏高度 + 导航栏高度 = 自定义导航栏高度总和
					this.height = this.statusBarHeight + this.navBarHeight
				}
				// #endif
			},
			getPageInfo() {
				const pages = getCurrentPages()
				this.isFirstPage = pages.length === 1
			},
			handleBack() {
				if (!this.isShowBack) return
				if (!this.isFirstPage && !this.backUrl) {
					uni.navigateBack({
						delta: 1
					})
					return
				}
				const url = this.isFirstPage ? this.homeUrl : this.backUrl
				if (!url) return
				const type = this.isFirstPage ? (this.jumpMap.home || '') : (this.jumpMap.back || '')
				if (type) {
					uni[type]({
						url
					})
					return
				}

				uni.navigateTo({
					url,
					fail() {
						uni.switchTab({
							url
						})
					}
				})

			}
		}
	}
</script>
<style>
	.cos-header {
		position: relative;
		width: 100vw;
	}

	.nav-bg {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		width: 100vw;
	}


	.is_fixed {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		z-index: 99;
	}

	.nav-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px;
	}

	.img {
		width: 20px;
		height: 20px;
		color: #fff;
	}

	.nav-back {
		flex-shrink: 0;
	}

	.nav-title {
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		word-break: break-all;
		text-overflow: ellipsis;
	}

	.nav-menu {
		flex-shrink: 0;
	}
</style>