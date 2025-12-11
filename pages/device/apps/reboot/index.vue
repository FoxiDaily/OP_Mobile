<template>
	<view class="container">
		<view class="header" :style="{ height: statusBarHeight}">
		</view>
		<view class="nav-header" style="display: flex; align-items: center; position: relative;">
			<view class="back-btn" @click="goBack" style="z-index: 2;">
				<image class="back-icon" src="/static/back.png" mode="widthFix" style="width: 40rpx; height: 40rpx;" />
			</view>
			<view style="flex: 1; display: flex; justify-content: center; position: absolute; left: 0; right: 0; pointer-events: none;">
				<text style="font-size: 32rpx; font-weight: bold; color: #fff;">{{ $t('reboot.title') }}</text>
			</view>
		</view>
		<view v-if="showProgress" class="progress-overlay">
			<view class="progress-content">
				<view class="progress-spinner"></view>
				<text class="progress-title">{{ $t('reboot.device_restarting') }}</text>
				<text class="progress-desc">{{ $t('reboot.please_wait') }}</text>
				<text class="progress-countdown">{{ countdownText }}</text>
			</view>
		</view>

		<view class="reboot-card">
			<view class="reboot-icon">
				<image src="/static/reboot.png" mode="aspectFit" class="app-icon-image" />
			</view>
			<text class="reboot-title">{{ $t('reboot.device_restart') }}</text>
			<text class="reboot-desc">{{ $t('reboot.restart_desc') }}</text>
			
			<button class="reboot-btn" @click="confirmReboot" :disabled="rebooting">
				<text v-if="!rebooting" class="reboot-btn-text">{{ $t('reboot.restart_device') }}</text>
				<text v-else class="reboot-btn-text">{{ $t('reboot.restarting') }}</text>
			</button>
		</view>
	</view>
</template>

<script>
import DeviceManager from '@/utils/deviceManager.js'

export default {
		data() {
			return {
				statusBarHeight: 0,
				rebooting: false,
				showProgress: false,
				countdown: 60,
				countdownText: '',
				countdownTimer: null,
				deviceInfo: {},
				session: '',
				url: '/ubus'
			}
		},
	onLoad() {
		this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
		uni.setNavigationBarTitle({
			title: this.$t('reboot.title')
		})
		
		this.deviceInfo = DeviceManager.getCurrentDevice()
		this.session = this.deviceInfo.sysauth
		const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
		const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
		this.url = `${protocol}://${formattedHost}:${this.deviceInfo.port}/ubus`
	},
	onUnload() {
	
		this.clearCountdown()
	},
	methods: {
		goBack() {
			uni.navigateBack({
				delta: 1
			});
		  //uni.reLaunch({ url: '/pages/device/apps' })
		},
		confirmReboot() {
			uni.showModal({
				title: this.$t('reboot.confirm_restart'),
				content: this.$t('reboot.confirm_restart_content'),
				confirmText: this.$t('reboot.confirm_restart_text'),
				confirmColor: '#ff3b30',
				success: (res) => {
					if (res.confirm) {
						this.executeReboot()
					}
				}
			})
		},
		
	
		executeReboot() {
			this.rebooting = true
	
			uni.request({
				method: 'POST',
				url: this.url,
				data: {
					jsonrpc: '2.0',
					id: 3,
					method: 'call',
					params: [this.session, 'system', 'reboot', {}]
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 3000,
				success: (res) => {
					console.log('reboot:', res)
				},
				fail: (err) => {
					console.log('reboot:', err)
				},
				complete: () => {
				
					this.showProgress = true
					this.startCountdown()
				}
			})
		},

		startCountdown() {
			this.countdown = 60
			this.updateCountdownText()
			
			this.countdownTimer = setInterval(() => {
				this.countdown--
				this.updateCountdownText()
				
				if (this.countdown <= 0) {
					this.clearCountdown()
		
					uni.reLaunch({
						url: '/pages/device_list'
					})
				}
			}, 1000)
		},
		
	
		clearCountdown() {
			if (this.countdownTimer) {
				clearInterval(this.countdownTimer)
				this.countdownTimer = null
			}
		},
		

		updateCountdownText() {
			this.countdownText = `${this.countdown}${this.$t('reboot.seconds')}`
		}
	}
}
</script>

<style scoped>
@import '@/styles/common.scss';

.container {
	padding: 5rpx;
}

.progress-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 999;
}

.progress-content {
	background: white;
	padding: 60rpx 40rpx;
	border-radius: 20rpx;
	text-align: center;
	width: 80%;
	max-width: 80%;
}

.progress-spinner {
	border: 6rpx solid #f3f3f3;
	border-top: 6rpx solid #667eea;
	border-radius: 50%;
	width: 100rpx;
	height: 100rpx;
	animation: spin 1s linear infinite;
	margin: 0 auto 30rpx;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.progress-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 20rpx;
}

.progress-desc {
	font-size: 28rpx;
	color: #666;
	display: block;
	margin-bottom: 30rpx;
	line-height: 1.5;
}

.progress-countdown {
	font-size: 32rpx;
	font-weight: bold;
	color: #667eea;
	display: block;
}


.reboot-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 30rpx;
	padding: 60rpx 40rpx;
	margin-top: 50rpx;
	text-align: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.reboot-icon {
	width: 200rpx;
	height: 200rpx;
	margin: 0 auto 30rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	border-radius: 20rpx;

}

.app-icon-image {
	width: 150rpx;
	height: 150rpx;
}

.reboot-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 20rpx;
}

.reboot-desc {
	font-size: 28rpx;
	color: #666;
	line-height: 1.5;
	display: block;
	margin-bottom: 50rpx;
}

.reboot-btn {
	background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
	color: white;
	border: none;
	border-radius: 20rpx;
	font-size: 20rpx;
	box-shadow: 0 8rpx 24rpx rgba(255, 59, 48, 0.3);
	transition: all 0.3s ease;
}

.reboot-btn:active {
	transform: scale(0.95);
}

.reboot-btn:disabled {
	opacity: 0.6;
	transform: none;
}

.reboot-btn-text {
	font-size: 32rpx;
	font-weight: bold;
}
</style>
