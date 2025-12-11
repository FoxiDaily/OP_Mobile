<template>
	<view class="container">
		<view class="header" :style="{ height: statusBarHeight}">
		</view>
		<view class="nav-header" style="display: flex; align-items: center; position: relative;">
			<view class="back-btn" @click="goBack" style="z-index: 2;">
				<image class="back-icon" src="/static/back.png" mode="widthFix" style="width: 40rpx; height: 40rpx;" />
			</view>
			<view style="flex: 1; display: flex; justify-content: center; position: absolute; left: 0; right: 0; pointer-events: none;">
				<text style="font-size: 32rpx; font-weight: bold; color: #fff;">{{ $t('process.title') }}</text>
			</view>
		</view>
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-overlay">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">{{ $t('process.loading_processes') }}</text>
			</view>
		</view>

		<!-- 进程列表内容 -->
		<view v-else class="process-container">

			<!-- 进程列表 -->
			<view v-if="processList.length > 0" class="process-list">
				<!-- 表头 -->
				<view class="table-header">
					<view class="header-cell process-name">{{ $t('process.process_name') }}</view>
					<view class="header-cell cpu">{{ $t('process.cpu') }}</view>
					<view class="header-cell memory">{{ $t('process.memory') }}</view>
					<view class="header-cell status">{{ $t('process.status') }}</view>
				</view>
				
				<!-- 进程行 -->
				<view v-for="(process, index) in processList" :key="process.PID" class="process-row" @click="toggleProcessDetail(index)">
					<view class="table-cell process-name">
						<view class="process-info">
							<text class="process-name-text">{{ getProcessName(process.COMMAND) }}</text>
							<text class="process-pid-text">PID: {{ process.PID }}</text>
						</view>
					</view>
					<view class="table-cell cpu">
						<text class="cpu-value">{{ process['%CPU'] }}</text>
					</view>
					<view class="table-cell memory">
						<text class="memory-value">{{ formatMemoryWithPercent(process.VSZ, process['%MEM']) }}</text>
					</view>
					<view class="table-cell status">
						<text class="status-value">{{ getStatusText(process.STAT) }}</text>
					</view>
					
					<!-- 展开详情 -->
					<view v-if="process.expanded" class="process-detail">
						<view class="detail-section">
							<view class="detail-row">
								<text class="detail-label">{{ $t('process.user') }}:</text>
								<text class="detail-value">{{ process.USER }}</text>
							</view>
							<view class="detail-row">
								<text class="detail-label">{{ $t('process.parent_pid') }}:</text>
								<text class="detail-value">{{ process.PPID }}</text>
							</view>
							<view class="detail-row">
								<text class="detail-label">{{ $t('process.memory_percent') }}:</text>
								<text class="detail-value">{{ process['%MEM'] }}</text>
							</view>
							<view class="detail-row">
								<text class="detail-label">{{ $t('process.command') }}:</text>
								<text class="detail-value command-value">{{ process.COMMAND }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<text class="empty-text">{{ $t('process.no_processes') }}</text>
			</view>

			<!-- 错误状态 -->
			<view v-if="error" class="error-state">
				<text class="error-text">{{ error }}</text>
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
			loading: false,
			processList: [],
			error: '',
			deviceInfo: {},
			session: '',
			url: '/ubus',
			refreshTimer: null,
			isFirstLoad: true
		}
	},
	onLoad() {
		uni.setNavigationBarTitle({
			title: this.$t('process.title')
		})
		this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'px';
		this.deviceInfo = DeviceManager.getCurrentDevice()
		this.session = this.deviceInfo.sysauth
		const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
		const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
		this.url = `${protocol}://${formattedHost}:${this.deviceInfo.port}/ubus`
		
		this.loadProcessList()
		this.startAutoRefresh()
	},
	onUnload() {
		this.stopAutoRefresh()
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		loadProcessList() {
			// 只在首次加载时显示加载动画
			if (this.isFirstLoad) {
				this.loading = true
			}
			this.error = ''
			
			uni.request({
				method: 'POST',
				url: this.url,
				data: {
					jsonrpc: '2.0',
					id: 1,
					method: 'call',
					params: [this.session, 'luci', 'getProcessList', {}]
				},
				header: {
					'Content-Type': 'application/json'
				},
				timeout: 10000,
				success: (res) => {
					if (res.data && res.data.result && res.data.result[1] && res.data.result[1].result) {
						this.parseProcessList(res.data.result[1].result)
					} else {
						this.error = this.$t('process.parse_failed')
					}
					if (this.isFirstLoad) {
						this.loading = false
						this.isFirstLoad = false
					}
				},
				fail: (err) => {
					this.error = this.$t('process.load_failed')
					if (this.isFirstLoad) {
						this.loading = false
						this.isFirstLoad = false
					}
				}
			})
		},
		
		parseProcessList(processes) {
			try {
				const expandedStates = {}
				this.processList.forEach(process => {
					if (process.expanded) {
						expandedStates[process.PID] = true
					}
				})
				
				this.processList = processes.map(process => {
					const parsedProcess = {
						...process,
						expanded: expandedStates[process.PID] || false,
						cpuValue: parseFloat(process['%CPU'].replace('%', '')) || 0
					}
					return parsedProcess
				})
				
				this.processList.sort((a, b) => b.cpuValue - a.cpuValue)
				
			} catch (error) {
				this.error = this.$t('process.parse_failed')
			}
		},
		
		getProcessName(command) {
			if (!command) return 'Unknown'
			
			if (command.startsWith('[') && command.endsWith(']')) {
				return command
			}
			
			const parts = command.split(' ')
			const firstPart = parts[0]
			
			if (firstPart.includes('/')) {
				return firstPart.split('/').pop()
			}
	
			if (parts.length === 1) {
				return firstPart
			}
			
			return firstPart
		},
		
		formatMemoryWithPercent(vsz, memPercent) {
			let kb = 0
			
			if (typeof vsz === 'string') {
				if (vsz.includes('m')) {
					const match = vsz.match(/(\d+(?:\.\d+)?)/)
					if (match) {
						kb = parseFloat(match[1]) * 1024 
					}
				} else {
					kb = parseInt(vsz) || 0
				}
			} else {
				kb = parseInt(vsz) || 0
			}
			
			const mb = (kb / 1024).toFixed(1)
			return `${mb}MB(${memPercent})`
		},
		
		getStatusText(stat) {
			return stat || 'Unknown'
		},
		
		toggleProcessDetail(index) {
			this.processList[index].expanded = !this.processList[index].expanded
		},
		
		startAutoRefresh() {
			this.refreshTimer = setInterval(() => {
				if (!this.loading) {
					this.loadProcessList()
				}
			}, 3000) // 3秒刷新一次
		},
		
		stopAutoRefresh() {
			if (this.refreshTimer) {
				clearInterval(this.refreshTimer)
				this.refreshTimer = null
			}
		}
	}
}
</script>

<style scoped>
@import '@/styles/common.scss';

.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
}

.loading-content {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16rpx;
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.loading-spinner {
	width: 60rpx;
	height: 60rpx;
	border: 4rpx solid #f3f3f3;
	border-top: 4rpx solid #6572CC;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 20rpx;
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #666;
}

.container {
	padding: 10rpx;
	padding-top: 20rpx;
}
.process-container {
	padding: 2rpx;
}

.refresh-section {
	margin-bottom: 20rpx;
	text-align: center;
}

.auto-refresh-info {
	margin-top: 10rpx;
}

.auto-refresh-text {
	font-size: 24rpx;
	color: #999;
}

.process-list {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 30rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.table-header {
	display: flex;
	background: #e0e7ff;
	padding: 20rpx 0;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.1);
}

.header-cell {
	flex: 1;
	text-align: center;
	font-size: 26rpx;
	font-weight: 600;
	color: #333;
}

.header-cell.process-name {
	flex: 2;
	text-align: left;
	padding-left: 30rpx;
}

.process-row {
	display: flex;
	border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	transition: background-color 0.2s ease;
}

.process-row:last-child {
	border-bottom: none;
}

.process-row:active {
	background: rgba(0, 122, 255, 0.05);
}

.table-cell {
	flex: 1;
	padding: 20rpx 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.table-cell.process-name {
	flex: 2;
	justify-content: flex-start;
	padding-left: 30rpx;
}

.process-info {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.process-name-text {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	margin-bottom: 4rpx;
}

.process-pid-text {
	font-size: 22rpx;
	color: #666;
}

.cpu-value {
	font-size: 26rpx;
	font-weight: 600;
	color: #FF3B30;
}

.memory-value {
	font-size: 26rpx;
	font-weight: 600;
	color: #4CD964;
}

.status-value {
	font-size: 26rpx;
	font-weight: 600;
	color: #6572CC;
}

.process-detail {
	background: rgba(0, 0, 0, 0.02);
	border-top: 1rpx solid rgba(0, 0, 0, 0.1);
	padding: 30rpx;
	flex: 1 1 100%;
	order: 1;
}

.detail-section {
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 15rpx;
	padding: 8rpx 0;
}

.detail-row:last-child {
	margin-bottom: 0;
}

.detail-label {
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
	min-width: 120rpx;
	flex-shrink: 0;
}

.detail-value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
	text-align: right;
	max-width: 60%;
	word-break: break-all;
	flex: 1;
}

.command-value {
	font-family: monospace;
	font-size: 22rpx;
	line-height: 1.4;
	text-align: left;
}

.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	margin: 20rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	margin: 20rpx;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.error-text {
	font-size: 28rpx;
	color: #FF3B30;
	text-align: center;
}
</style>
