<template>
	<view class="container">
		<view class="header" :style="{ height: statusBarHeight}">
		</view>
		<view class="nav-header" style="display: flex; align-items: center; position: relative;top: 20rpx;">
			<view class="back-btn" @click="goBack" style="z-index: 2;">
				<image class="back-icon" src="/static/back.png" mode="widthFix" style="width: 40rpx; height: 40rpx;" />
			</view>
			<view style="flex: 1; display: flex; justify-content: center; position: absolute; left: 0; right: 0; pointer-events: none;">
				<text style="font-size: 32rpx; font-weight: bold; color: #fff;">{{ $t('apps.title') }}</text>
			</view>
		</view>
		<view class="app-grid">
			<view class="app-item" v-for="(app, index) in appList" :key="index" @click="onPluginClick(app)">
				<view class="app-icon">
					<image :src="app.icon" mode="aspectFit" class="icon-image" />
				</view>
				<view class="app-name">
					<text class="name-text">{{ app.name }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import DeviceManager from '@/utils/deviceManager.js'

export default {
	data() {
		return {
			statusBarHeight: 0,
			appList: [
				{
					name: this.$t('apps.parental_control'),
					icon: '/static/shield-w.png',
					id: 'parental_control'
				},
				{
					name: this.$t('apps.route'),
					icon: '/static/route-w.png',
					id: 'route'
				},
				{
					name: this.$t('apps.process'),
					icon: '/static/process-w.png',
					id: 'process'
				},
				{
					name: this.$t('apps.startup'),
					icon: '/static/startup-w.png',
					id: 'startup'
				},
				{
					name: this.$t('apps.reboot'),
					icon: '/static/reboot-w.png',
					id: 'reboot'
				},
				{
					name: this.$t('apps.factory_reset'),
					icon: '/static/reset-w.png',
					id: 'factory_reset'
				}
			]
		}
	},
	onLoad() {
		this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'rpx';
		uni.setNavigationBarTitle({
			title: this.$t('apps.title')
		})
		
		console.log("插件管理页面加载")
	},
	methods: {
		goBack() {
					uni.reLaunch({
						url: '/pages/device_list'
					})
				},
		onPluginClick(app) {
			console.log("点击插件:", app.name)
			
			if (app.id === 'parental_control') {
				// 检查是否支持家长控制
				const deviceInfo = DeviceManager.getCurrentDevice()
				if (deviceInfo.support_parental_control === 0) {
					// 不支持家长控制，直接跳转到提示页面
					uni.navigateTo({
						url: '/pages/device/apps/parental_control/parental_control_about'
					})
				} else {
					// 支持家长控制，跳转到正常页面
					uni.navigateTo({
						url: '/pages/device/apps/parental_control/index'
					})
				}
			} else if (app.id === 'route') {
				uni.navigateTo({
					url: '/pages/device/apps/route/index'
				})
			} else if (app.id === 'process') {
				uni.navigateTo({
					url: '/pages/device/apps/process/index'
				})
			} else if (app.id === 'startup') {
				uni.navigateTo({
					url: '/pages/device/apps/startup/index'
				})
			} else if (app.id === 'reboot') {
				uni.navigateTo({
					url: '/pages/device/apps/reboot/index'
				})
			} else if (app.id === 'factory_reset') {
				uni.navigateTo({
					url: '/pages/device/apps/factory_reset/index'
				})
			} else {
				uni.showToast({
					title: this.$t('apps.coming_soon'),
					icon: 'none'
				})
			}
		}
	}
}
</script>

<style scoped>
@import '@/styles/common.scss';

.app-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 30rpx;
	padding: 50rpx 20rpx;
}

.app-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	background: transparent;
	border-radius: 0;
	padding: 0;
	box-shadow: none;
	min-height: auto;
	transition: all 0.2s ease;
}

.app-item:active {
	transform: scale(0.9);
}

.app-icon {
	width: 100rpx;
	height: 100rpx;
	margin-bottom: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #8A9DFF 0%, #6572CC 100%);
	border-radius: 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.icon-image {
	width: 60rpx;
	height: 60rpx;
}

.app-name {
	text-align: center;
	width: 100%;
}

.name-text {
	font-size: 22rpx;
	color: #fff;
	font-weight: 400;
	line-height: 1.3;
	word-break: break-all;
}
</style>
