<template>
	<view class="container">
		<view class="header" :style="{ height: statusBarHeight}">
		</view>
		<view class="nav-header" style="display: flex; align-items: center; position: relative;">
			<view class="back-btn" @click="goBack" style="z-index: 2;">
				<image class="back-icon" src="/static/back.png" mode="widthFix" style="width: 40rpx; height: 40rpx;" />
			</view>
			<view style="flex: 1; display: flex; justify-content: center; position: absolute; left: 0; right: 0; pointer-events: none;">
				<text style="font-size: 32rpx; font-weight: bold; color: #fff;">{{ $t('about.title') }}</text>
			</view>
		</view>
		
		<view class="header">
			<view style="flex: 1; display: flex; justify-content: center; align-items: flex-end; right: 0;height: 200rpx; pointer-events: none;">
				<text style="font-size: 100rpx; font-weight: bold; color: #e0e7ff;position: absolute;">OP Mobile</text>
			</view>
			<view style="flex: 1; display: flex; justify-content: center; align-items: flex-start; right: 0;height: 150rpx; pointer-events: none;">
				<text style="font-size: 32rpx; font-weight: normal; color: #e0e7ff;position: absolute;">{{ $t('about.base') }}</text>
			</view>
		</view>
		<view class="about-card">
			<view class="about-content">
				<view class="about-section">
					<text class="section-title">{{ $t('about.version_info') }}</text>
					<view class="section-item">
						<text class="item-desc">{{ version }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="about-card">
			<view class="about-content">	
				<view class="about-section">
					<text class="section-title">{{ $t('about.developer_info') }}</text>
					<view class="section-item">
						<text class="item-title">{{ $t('about.author') }}</text>
						<text class="item-desc">{{ $t('about.author_name') }}</text>
					</view>
					<view class="section-item">
						<text class="item-title">{{ $t('about.introduction') }}</text>
						<text class="item-desc">{{ $t('about.introduction_desc') }}</text>
					</view>
					<view class="section-item">
						<text class="item-title">{{ $t('about.website') }}</text>
						<text class="item-desc">{{ $t('about.website_url') }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="about-card" @click="openWebsite">
			<view class="about-content">	
				<view class="about-section">
					<text class="section-title">{{ $t('about.sourcecode') }}</text>
					<view class="section-item">
						<text class="item-desc">{{ $t('about.sourcecode_url') }}</text>
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
			statusBarHeight: 0,
			version: '1.0.4 Release'
		}
	},
	onLoad() {
		this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
		uni.setNavigationBarTitle({
			title: this.$t('about.title')
		})
	},
	methods: {
		goBack() {
			uni.navigateBack({
				delta: 1
			});
		},
		
		openWebsite() {
			uni.showModal({
				title: this.$t('about.open_website'),
				content: this.$t('about.open_website_confirm'),
				success: (res) => {
					if (res.confirm) {
						// 在浏览器中打开网站
						plus.runtime.openURL('https://github.com/FoxiDaily/OP_Mobile')
					}
				}
			})
		},
		
	}
}
</script>

<style scoped>
@import '@/styles/common.scss';

.container {
	padding: 15rpx;
}


.about-card {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 30rpx;
	padding: 60rpx 40rpx;
	margin-top: 50rpx;
	text-align: center;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.about-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
}

.about-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 40rpx;
}

.about-content {
	text-align: left;
}

.about-section {
	margin-bottom: 40rpx;
}

.about-section:last-child {
	margin-bottom: 0;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 20rpx;
	border-left: 4rpx solid #6572CC;
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