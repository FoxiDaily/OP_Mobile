<template>
	<view class="container">
		<view class="help-card">

			<view class="help-content">
				<view class="help-section">
					<text class="section-title">{{ $t('help.usage_scenarios') }}</text>
					<view class="section-item">
						<text class="item-title">{{ $t('help.supported_version') }}</text>
						<text class="item-desc">{{ $t('help.supported_version_desc') }}</text>
					</view>
					<view class="section-item">
						<text class="item-title">{{ $t('help.supported_devices') }}</text>
						<text class="item-desc">{{ $t('help.supported_devices_desc') }}</text>
					</view>
				</view>
				
				<view class="help-section">
					<text class="section-title">{{ $t('help.faq') }}</text>
					<view class="section-item">
						<text class="item-title">{{ $t('help.q1') }}</text>
						<text class="item-desc">{{ $t('help.a1') }}</text>
					</view>
					<view class="section-item">
						<text class="item-title">{{ $t('help.q2') }}</text>
						<text class="item-desc">{{ $t('help.a2') }}</text>
					</view>
					<view class="section-item">
						<text class="item-title">{{ $t('help.q3') }}</text>
						<text class="item-desc">{{ $t('help.a3') }}</text>
					</view>
					<view class="section-item">
						<text class="item-title">{{ $t('help.q4') }}</text>
						<text class="item-desc">{{ $t('help.a4') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
		}
	},
	onLoad() {
		// 动态设置页面标题
		uni.setNavigationBarTitle({
			title: this.$t('help.title')
		})
	},
	methods: {
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 20rpx;
}

.help-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 20rpx;
	padding: 60rpx 40rpx;
	margin-top: 50rpx;
	text-align: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.help-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.help-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 40rpx;
}

.help-content {
	text-align: left;
}

.help-section {
	margin-bottom: 40rpx;
}

.help-section:last-child {
	margin-bottom: 0;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 20rpx;
	border-left: 4rpx solid #007aff;
	padding-left: 20rpx;
}

.section-item {
	margin-bottom: 20rpx;
}

.section-item:last-child {
	margin-bottom: 0;
}

.item-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 10rpx;
}

.item-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	display: block;
}
</style> 