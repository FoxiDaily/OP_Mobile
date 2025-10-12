<template>
	<view class="tab-bar">
		<view v-for="(item, index) in list" :key="index" class="tab-bar-item" @click="switchTab(item, index)">
			<view class="tab_icon" :style="{ color: currentIndex == index ? selectedColor : color }">
				<text class="icon-text">{{ currentIndex == index ? item.selectedIcon : item.icon }}</text>
			</view>
			<view class="tab_text" :style="{ color: currentIndex == index ? selectedColor : color }">{{ item.text }}</view>
		</view>
	</view>
</template>
 
<script>
	export default {
		props: {
			selectedIndex: {
				// 当前选中的tab index
				default: 0,
			},
		},
		data() {
			return {
				color: '#666666',
				selectedColor: '#00BAB2',
				list: [],
				currentIndex: 0,
			};
		},
		created() {
			this.currentIndex = this.selectedIndex;
 
			var _this = this;
 

			_this.list = [
				{
					"icon": "📊",
					"selectedIcon": "📈",
					"text": this.$t('tabbar.system_status'),
					"pagePath":"/pages/device/status"
				},
				{
					"icon": "👥",
					"selectedIcon": "👤",
					"text": this.$t('tabbar.client_list'),
					"pagePath":"/pages/device/client"
				},
				{
					"icon": "👨‍💻",
					"selectedIcon": "👨‍💼",
					"text": this.$t('tabbar.user_list'),
					"pagePath":"/pages/device/user_list"
				},
				{
					"icon": "⚙️",
					"selectedIcon": "🔧",
					"text": this.$t('tabbar.advanced_settings'),
					"pagePath":"/pages/device/settings"
				}
			];
			
		},
		methods: {
			switchTab(item, index) {
				this.currentIndex = index;
				let url = item.pagePath;
				uni.redirectTo({ url: url });
			},
		},
	};
</script>
 
<style lang="scss">
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background: #05112f;
		display: flex;
		justify-content: center;
		align-items: center;
		padding-bottom: env(safe-area-inset-bottom); // 适配iphoneX的底部
 
		.tab-bar-item {
			flex: 1;
			text-align: center;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			.tab_icon {
				font-size: 48rpx;
				line-height: 1;
			}
			.icon-text {
				font-size: 48rpx;
				line-height: 1;
			}
			.tab_text {
				font-size: 20rpx;
				margin-top: 8rpx;
			}
		}
	}
</style>