<template>
	<view class="container">
		<view class="header" :style="{ height: statusBarHeight}">
		</view>
		<view class="nav-header" style="display: flex; align-items: center; position: relative;top: 20rpx;">
			<view class="back-btn" @click="goBack" style="z-index: 2;">
				<image class="back-icon" src="/static/back.png" mode="widthFix" style="width: 40rpx; height: 40rpx;" />
			</view>
			<view style="flex: 1; display: flex; justify-content: center; position: absolute; left: 0; right: 0; pointer-events: none;">
				<text style="font-size: 32rpx; font-weight: bold; color: #fff;">{{ $t('home.title') }}</text>
			</view>
			</view>
		<view v-if="loading" class="loading-overlay">
			<view class="loading-content">
				<view class="loading-spinner"></view>
				<text class="loading-text">{{ $t('home.loading') }}</text>
			</view>
		</view>
		
		<view class="nav-header" style="display: flex; align-items: center; position: relative;">		
		</view>
		
		<view class="nav-header" style="display: flex; align-items: center; position: relative;height: 60rpx;">		
			<view style="flex: 1; display: flex; justify-content: left; position: absolute; left: 0; right: 0; pointer-events: none;">
				<text style="font-size: 100rpx; font-weight: bold; color: #e0e7ff ;">Hello,</text>
			</view>
		</view>

		
		<view class="deviceinfo-card">
			<view class="device-header" >
				<view style="display: flex; align-items: center;">
					<image class="device-icon" src="/static/openwrt.png" mode="widthFix" style="width: 90rpx; height: 90rpx; margin-right: 30rpx;" />
					<view>
						<text class="device-name" style="color: #6572CC;">{{ truncatedModel }}</text>
						<text class="device-version">{{ truncatedVersion }}</text>
					</view>
				</view>			
			</view>
		</view>
		<view class="device-card">
			<view class="device-details">
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.hostname') }}:</text>
					<text class="detail-value">{{ systemStatus.hostname || '--' }}</text>
				</view>
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.architecture') }}:</text>
					<text class="detail-value">{{ systemStatus.architecture || '--' }}</text>
				</view>
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.target_platform') }}:</text>
					<text class="detail-value">{{ systemStatus.target || '--' }}</text>
				</view>
				<view class="detail-row">
						<text class="detail-label">{{ $t('home.kernel_version') }}:</text>
					<text class="detail-value">{{ systemStatus.kernel || '--' }}</text>
				</view>
				<view class="detail-row" v-if="systemStatus.temperature && systemStatus.temperature !== '--'">
					<text class="detail-label">{{ $t('home.temperature') }}:</text>
					<text class="detail-value temperature-value">{{ systemStatus.temperature }}</text>
				</view>
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.local_time') }}:</text>
					<text class="detail-value">{{ systemStatus.localtime || '--' }}</text>
				</view>
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.uptime') }}:</text>
					<text class="detail-value">{{ systemStatus.uptime || '0' + $t('status.days') }}</text>
				</view>
			</view>
		</view>

		<view class="status-grid">
			<view class="status-card cpu-card">	
				<view class="cpu-progress-bg" :style="{width: (systemStatus.cpuUsage || '0%')}"></view>
				<view class="cpu-card-content">
					<view class="card-header">
						<text class="card-title">{{ $t('home.cpu_usage') }}</text>
						<image class="disk-icon" src="/static/cpu.png" mode="widthFix" style="width: 45rpx; height: 45rpx;" />
					</view>
					<view class="card-content">
						<text class="status-value">{{ systemStatus.cpuUsage || '0%' }}</text>
						<text class="status-detail">
							<text class="load-label">{{ $t('home.average_load') }}:</text>
							<text class="load-value">{{ systemStatus.cpuLoad || '0.00 0.00 0.00' }}</text>
						</text>
					</view>
				</view>
			</view>

			<view class="status-card memory-card">
				<view class="memory-progress-bg" :style="{width: (systemStatus.memoryUsage || '0%')}"></view>
				<view class="memory-card-content">
					<view class="card-header">
						<text class="card-title">{{ $t('home.memory_usage') }}</text>
						<image class="disk-icon" src="/static/mem.png" mode="widthFix" style="width: 45rpx; height: 45rpx;" />
					</view>
					<view class="card-content">
						<text class="status-value">{{ systemStatus.memoryUsage || '0%' }}</text>
						<text class="status-detail">{{ systemStatus.memoryDetail || '0MB / 0MB' }}</text>
					</view>
				</view>
			</view>

			<view class="status-card cache-card">
				<view class="cache-progress-bg" :style="{width: (systemStatus.memoryCachePercent || '0%')}"></view>
				<view class="cache-card-content">
					<view class="card-header">
						<text class="card-title">{{ $t('home.memory_cache') }}</text>
						<image class="disk-icon" src="/static/cache.png" mode="widthFix" style="width: 50rpx; height: 50rpx;" />
					</view>
					<view class="card-content">
						<text class="status-value">{{ systemStatus.memoryCachePercent || '0%' }}</text>
						<text class="status-detail">{{ systemStatus.memoryCacheDetail || '0MB / 0MB' }}</text>
					</view>
				</view>
			</view>


			<view class="status-card connections-card">
				<view class="connections-progress-bg" :style="{width: (systemStatus.connectionsPercent || '0%')}"></view>
				<view class="connections-card-content">
					<view class="card-header">
						<text class="card-title">{{ $t('home.connections') }}</text>
						<image class="disk-icon" src="/static/connect.png" mode="widthFix" style="width: 50rpx; height: 50rpx;" />

					</view>
					<view class="card-content">
						<text class="status-value">{{ systemStatus.connectionsPercent || '0%' }}</text>
						<text class="status-detail">{{ systemStatus.connectionsDetail || '0 / 0' }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="network-card">
			<view class="network-header">
				<text class="network-title">{{ $t('home.network_status') }}</text>
				<image class="disk-icon" src="/static/network.png" mode="widthFix" style="width: 50rpx; height: 50rpx;" />

			</view>
			<view class="network-details">
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.wan_ip') }}:</text>
					<text class="detail-value">{{ networkStatus.wanIp || '--' }}</text>
				</view>
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.lan_ip') }}:</text>
					<text class="detail-value">{{ networkStatus.lanIp || '--' }}</text>
				</view>
				<view class="detail-row">
							<text class="detail-label">{{ $t('home.gateway') }}:</text>
					<text class="detail-value">{{ networkStatus.gateway || '--' }}</text>
				</view>
				<view class="detail-row">
					<text class="detail-label">{{ $t('home.dns') }}:</text>
					<text class="detail-value">{{ networkStatus.dns || '--' }}</text>
				</view>
			</view>
		</view>

		<view class="disk-card" v-if="diskInfo.length > 0">
			<view class="disk-header">
				<text class="disk-title">{{ $t('home.disk_usage') }}</text>
				<image class="disk-icon" src="/static/disk.png" mode="widthFix" style="width: 50rpx; height: 50rpx;" />
			</view>
			<view class="disk-list">
				<view class="disk-item" v-for="(disk, index) in diskInfo" :key="index">
					<view class="disk-progress-bg" :style="{width: disk.usagePercent + '%'}"></view>
					<view class="disk-item-content">
						<view class="disk-info">
							<text class="disk-mount">
								{{ disk.mount }}
								<text v-if="disk.mount === '/tmp'" class="disk-temp-label">{{ $t('home.temp_space') }}</text>
							</text>
							<text class="disk-device">{{ disk.device }}</text>
						</view>
						<view class="disk-usage">
							<text class="disk-usage-text">{{ disk.usagePercent }}%</text>
							<text class="disk-detail">{{ disk.usedSize }} / {{ disk.totalSize }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 网站链接 -->
		<view class="footer-link" @click="openWebsite">
			<text class="footer-text">Modified By FXDaily@Bilibili</text>
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
			isFirstLoad: true, 
			timer: null,
			url: '/ubus',
			session: '',
			deviceInfo: {
				model: '',
				version: '',
				cpu: '',
				kernel: ''
			},
			systemStatus: {
				cpuUsage: '0%',
				cpuLoad: '0.00 0.00 0.00',
				memoryUsage: '0%',
				memoryDetail: '0MB / 0MB',
				memoryCache: '0MB',
				memoryCacheDetail: '0MB / 0MB',
				memoryCachePercent: '0%',
				hostname: '--',
				architecture: '--',
				target: '--',
				kernel: '--',
				temperature: '--',
				localtime: '--',
				uptime: '0' + this.$t('home.days'),
				onlineUsers: '0',
				connections: '0',
				connectionsDetail: '0 / 0',
				connectionsPercent: '0%'
			},
			networkStatus: {
				wanIp: '--',
				lanIp: '--',
				gateway: '--',
				dns: '--'
			},
			diskInfo: []
		}
	},
	computed: {
		truncatedModel() {
			const model = this.deviceInfo.model || this.$t('home.openwrt_device')
			return model.length > 30 ? model.substring(0, 28) + '...' : model
		},
		truncatedVersion() {
			const version = this.deviceInfo.version || this.$t('home.version_info')
			return version.length > 50 ? version.substring(0, 45) + '...' : version
		}
	},
	onLoad() {
		this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 'rpx';
		this.updateTabBarText()
		uni.setNavigationBarTitle({
			title: this.$t('home.title')
		})
		this.deviceInfo = DeviceManager.getCurrentDevice()
		this.session = this.deviceInfo.sysauth
		const protocol = this.deviceInfo.useHttps ? 'https' : 'http'
		const formattedHost = DeviceManager.formatHostForUrl(this.deviceInfo.ip)
		this.url = `${protocol}://${formattedHost}:${this.deviceInfo.port}/ubus`
		this.loadData()
		this.startAutoRefresh()
		
		
	},
	onShow() {
		this.startAutoRefresh()
	},
	
	onHide() {
		this.stopAutoRefresh()
	},
	
	onUnload() {
		this.stopAutoRefresh()
	},

	methods: {

		goBack() {
					this.stopAutoRefresh()
					uni.reLaunch({
						url: '/pages/device_list'
					})
				},
		
		// 打开网站
		openWebsite() {
			uni.showModal({
				title: this.$t('home.open_website'),
				content: this.$t('home.open_website_confirm'),
				success: (res) => {
					if (res.confirm) {
						// 在浏览器中打开网站
						plus.runtime.openURL('https://b23.tv/O4b8mzV')
					}
				}
			})
		},
		
	updateTabBarText() {
      	uni.setTabBarItem({ index: 0, text: this.$t('tabbar.home') })
		uni.setTabBarItem({ index: 1, text: this.$t('tabbar.statistics') })
		uni.setTabBarItem({ index: 2, text: this.$t('tabbar.clients') })
		uni.setTabBarItem({ index: 3, text: this.$t('tabbar.network') })
		uni.setTabBarItem({ index: 4, text: this.$t('tabbar.apps') })
    },


		loadData() {
	
			if (this.isFirstLoad) {
				this.loading = true
			}
			this.fetchAllStatusData()
		},

	
		fetchAllStatusData() {
			uni.request({
				method: "POST",
				url: this.url,
				timeout: 3000,
				data: [
					{
						jsonrpc: "2.0",
						id: 1,
						method: "call",
						params: [this.session, "system", "board", {}]
					},
					{
						jsonrpc: "2.0",
						id: 2,
						method: "call",
						params: [this.session, "system", "info", {}]
					},
					{
						jsonrpc: "2.0",
						id: 3,
						method: "call",
						params: [this.session, "luci", "getCPUUsage", {}]
					},
					{
						jsonrpc: "2.0",
						id: 4,
						method: "call",
						params: [this.session, "luci", "getOnlineUsers", {}]
					},
					{
						jsonrpc: "2.0",
						id: 5,
						method: "call",
						params: [this.session, "file", "read", {path: "/proc/sys/net/netfilter/nf_conntrack_count"}]
					},
					{
						jsonrpc: "2.0",
						id: 6,
						method: "call",
						params: [this.session, "file", "read", {path: "/proc/sys/net/netfilter/nf_conntrack_max"}]
					},
					{
						jsonrpc: "2.0",
						id: 7,
						method: "call",
						params: [this.session, "network.interface", "dump", {}]
					},
					{
						jsonrpc: "2.0",
						id: 8,
						method: "call",
						params: [this.session, "luci", "getTempInfo", {}]
					},
					{
						jsonrpc: "2.0",
						id: 9,
						method: "call",
						params: [this.session, "luci", "getMountPoints", {}]
					}
				],
				header: {
					'Content-Type': 'application/json'
				},
				success: (res) => {
	
					this.processAllStatusData(res.data)
				},
				fail: (err) => {
					console.error('data error:', err)
					this.loading = false
				}
			})
		},

	
		processAllStatusData(dataArray) {
			if (!Array.isArray(dataArray)) {
				console.error('data format error')
				this.loading = false
				return
			}

			const deviceInfoRes = dataArray[0]
			if (deviceInfoRes && deviceInfoRes.result && deviceInfoRes.result[1]) {
				const data = deviceInfoRes.result[1]
				this.deviceInfo = {
						model: data.model || this.$t('home.openwrt'),
					version: (data.release && data.release.description) ? data.release.description : this.$t('home.version_info'),
					cpu: data.system || '--',
					kernel: data.kernel || '--'
				}
				
			
				this.systemStatus.hostname = data.hostname || '--'
				this.systemStatus.architecture = data.system || '--'
				this.systemStatus.kernel = data.kernel || '--'
	
				if (data.release && data.release.target) {
					this.systemStatus.target = data.release.target
				}
			}


			const systemInfoRes = dataArray[1]
			if (systemInfoRes && systemInfoRes.result && systemInfoRes.result[1]) {
				const data = systemInfoRes.result[1]
				
		
				const memory = data.memory
				if (memory) {
					const used = memory.total - memory.available
					const usage = Math.round((used / memory.total) * 100)
					this.systemStatus.memoryUsage = usage + '%'
		
					this.systemStatus.memoryDetail = this.formatBytes(used) + ' / ' + this.formatBytes(memory.total)
					
			
					if (memory.cached) {
						this.systemStatus.memoryCache = this.formatBytes(memory.cached)
					
						const cacheUsage = Math.round((memory.cached / memory.total) * 100)
						this.systemStatus.memoryCachePercent = cacheUsage + '%'
						this.systemStatus.memoryCacheDetail = this.formatBytes(memory.cached) + ' / ' + this.formatBytes(memory.total)
					}
				}
				
		
				if (data.load && Array.isArray(data.load) && data.load.length >= 3) {

					const load1 = (data.load[0] / 65536).toFixed(2)
					const load5 = (data.load[1] / 65536).toFixed(2)
					const load15 = (data.load[2] / 65536).toFixed(2)
					this.systemStatus.cpuLoad = `${load1} ${load5} ${load15}`
				}
				
		
				if (data.localtime) {
					const utcDate = new Date(data.localtime * 1000)
					const beijingOffset = 8 * 60 * 60 * 1000 
					const beijingDate = new Date(utcDate.getTime() - beijingOffset)
					const year = beijingDate.getFullYear()
					const month = String(beijingDate.getMonth() + 1).padStart(2, '0')
					const day = String(beijingDate.getDate()).padStart(2, '0')
					const hours = String(beijingDate.getHours()).padStart(2, '0')
					const minutes = String(beijingDate.getMinutes()).padStart(2, '0')
					const seconds = String(beijingDate.getSeconds()).padStart(2, '0')
					this.systemStatus.localtime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
				}
				
			
				if (data.uptime) {
					const days = Math.floor(data.uptime / 86400)
					const hours = Math.floor((data.uptime % 86400) / 3600)
					const minutes = Math.floor((data.uptime % 3600) / 60)
					const seconds = data.uptime % 60
					
					let uptimeStr = ''
					if (days > 0) {
						uptimeStr += days + 'd '
					}
					if (hours > 0 || days > 0) {
						uptimeStr += hours + 'h '
					}
					if (minutes > 0 || hours > 0 || days > 0) {
						uptimeStr += minutes + 'm '
					}
					uptimeStr += seconds + 's'
					
					this.systemStatus.uptime = uptimeStr
				}
			}

		
			const cpuRes = dataArray[2]
			if (cpuRes && cpuRes.result && cpuRes.result[1]) {
				const data = cpuRes.result[1]
				let cpuUsage = data.cpuusage || '0%'
				
		
				if (cpuUsage.includes('CPU:') && cpuUsage.includes('%')) {
		
					const cpuMatch = cpuUsage.match(/CPU:\s*(\d+)%/)
					if (cpuMatch) {
						cpuUsage = cpuMatch[1] + '%'
					}
				} else if (cpuUsage.includes('%')) {
		
					const percentMatch = cpuUsage.match(/(\d+)%/)
					if (percentMatch) {
						cpuUsage = percentMatch[1] + '%'
					}
				}
				
				this.systemStatus.cpuUsage = cpuUsage
			}


			const usersRes = dataArray[3]
			if (usersRes && usersRes.result && usersRes.result[1]) {
				const data = usersRes.result[1]
				this.systemStatus.onlineUsers = (data.onlineusers && data.onlineusers.trim) ? data.onlineusers.trim() : '0'
			}

			const connectionsRes = dataArray[4]
			const maxConnectionsRes = dataArray[5]
			
			if (connectionsRes && connectionsRes.result && connectionsRes.result[1]) {
				const data = connectionsRes.result[1]
				const currentConnections = parseInt((data.data && data.data.trim) ? data.data.trim() : '0')
				this.systemStatus.connections = currentConnections.toString()
				
				if (maxConnectionsRes && maxConnectionsRes.result && maxConnectionsRes.result[1]) {
					const maxData = maxConnectionsRes.result[1]
					const maxConnections = parseInt((maxData.data && maxData.data.trim) ? maxData.data.trim() : '0')
					this.systemStatus.connectionsDetail = currentConnections + ' / ' + maxConnections
					
			
					if (maxConnections > 0) {
						const usagePercent = Math.round((currentConnections / maxConnections) * 100)
						this.systemStatus.connectionsPercent = usagePercent + '%'
					} else {
						this.systemStatus.connectionsPercent = '0%'
					}
				}
			}

	
			const networkRes = dataArray[6]
			if (networkRes && networkRes.result && networkRes.result[1]) {
				const interfaces = networkRes.result[1].interface
				this.parseNetworkInterfaces(interfaces)
			}

		
			const tempRes = dataArray[7]
			if (tempRes && tempRes.result && tempRes.result[1]) {
				const data = tempRes.result[1]
				this.systemStatus.temperature = data.tempinfo || '--'
			}

	
			const diskRes = dataArray[8]
			if (diskRes && diskRes.result && diskRes.result[1] && diskRes.result[1].result) {
				const mountPoints = diskRes.result[1].result
				this.processDiskInfo(mountPoints)
			}

			this.loading = false

			this.isFirstLoad = false
		},


		startAutoRefresh() {
		
			this.stopAutoRefresh()
	
			this.timer = setInterval(() => {
				this.loadData()
			}, 3000)
		},


		stopAutoRefresh() {
			if (this.timer) {
				clearInterval(this.timer)
				this.timer = null
			}
		},

	
		formatBytes(bytes) {
			if (bytes === 0) return '0 B'
			const k = 1024
			const sizes = ['B', 'KB', 'MB', 'GB']
			const i = Math.floor(Math.log(bytes) / Math.log(k))
			return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
		},

	
		parseNetworkInterfaces(interfaces) {
			if (!interfaces || !Array.isArray(interfaces)) {
				return
			}

	
			for (const iface of interfaces) {
				if (iface.interface === 'wan') {
			
					this.parseWANInterface(iface)
				} else if (iface.interface === 'lan') {
			
					this.parseLANInterface(iface)
				}
			}
		},

	
		parseWANInterface(wanData) {
			
			if (wanData['ipv4-address'] && wanData['ipv4-address'].length > 0) {
				const ipInfo = wanData['ipv4-address'][0]
				this.networkStatus.wanIp = ipInfo.address + '/' + ipInfo.mask
			}
			

			if (wanData.route && wanData.route.length > 0) {
				for (const route of wanData.route) {
					if (route.target === '0.0.0.0' && route.mask === 0) {
						this.networkStatus.gateway = route.nexthop
						break
					}
				}
			}
	
			if (wanData['dns-server'] && wanData['dns-server'].length > 0) {
				const dnsServers = []
				for (let i = 0; i < Math.min(wanData['dns-server'].length, 2); i++) {
					dnsServers.push(wanData['dns-server'][i])
				}
				this.networkStatus.dns = dnsServers.join(', ')
			}
		},


		parseLANInterface(lanData) {

			if (lanData['ipv4-address'] && lanData['ipv4-address'].length > 0) {
				const ipInfo = lanData['ipv4-address'][0]
				this.networkStatus.lanIp = ipInfo.address + '/' + ipInfo.mask
			}
		},

	
		processDiskInfo(mountPoints) {
			if (!Array.isArray(mountPoints)) {
				return
			}

			this.diskInfo = mountPoints.map(mount => {
				const totalSize = mount.size || 0
				const freeSize = mount.free || 0
				const usedSize = totalSize - freeSize
				const usagePercent = totalSize > 0 ? Math.round((usedSize / totalSize) * 100) : 0

				return {
					device: mount.device || '--',
					mount: mount.mount || '--',
					totalSize: this.formatBytes(totalSize),
					usedSize: this.formatBytes(usedSize),
					freeSize: this.formatBytes(freeSize),
					usagePercent: usagePercent
				}
			}).filter(disk => {
		
				return disk.mount !== '/' && disk.mount !== '/dev'
			}).sort((a, b) => {
		
				if (a.mount === '/overlay') return -1
				if (b.mount === '/overlay') return 1
				if (a.mount === '/tmp') return -1
				if (b.mount === '/tmp') return 1
				return 0
			})
		}
	}

}
</script>


<style scoped>

	@import '@/styles/common.scss';


	.deviceinfo-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 30rpx;
		padding: 30rpx ;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	}

	.device-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 30rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	}

	.device-header {
		margin-bottom: 0rpx;
	}

	.device-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 10rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.device-version {
		font-size: 24rpx;
		color: #666;
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.device-details {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8rpx 0;
		border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.detail-label {
		font-size: 26rpx;
		color: #666;
		font-weight: 500;
	}

	.detail-value {
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
		text-align: right;
		max-width: 60%;
		word-break: break-all;
	}


	.temperature-value {
		max-width: 70% !important;
		font-size: 24rpx !important;
		line-height: 1.4 !important;
	}

	.status-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}


	.cache-card .progress-fill {
		background:  #8b96e3;
	}

	.cache-card .status-value {
		color: #000;
	}

	.status-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 30rpx;
		padding: 30rpx ;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}

	.cpu-card {
		position: relative;
		overflow: hidden;
	}

	.cpu-progress-bg {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: #e0e7ff;
		border-radius: 0rpx;
		transition: width 0.3s ease;
		z-index: 1;
	}

	.cpu-card-content {
		position: relative;
		z-index: 2;
	}

	.memory-card {
		position: relative;
		overflow: hidden;
	}

	.memory-progress-bg {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: #e0e7ff;
		border-radius: 0rpx;
		transition: width 0.3s ease;
		z-index: 1;
	}

	.memory-card-content {
		position: relative;
		z-index: 2;
	}

	.cache-card {
		position: relative;
		overflow: hidden;
	}

	.cache-progress-bg {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: #e0e7ff;
		border-radius: 0rpx;
		transition: width 0.3s ease;
		z-index: 1;
	}

	.cache-card-content {
		position: relative;
		z-index: 2;
	}

	.connections-card {
		position: relative;
		overflow: hidden;
	}

	.connections-progress-bg {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: #e0e7ff;
		border-radius: 0rpx;
		transition: width 0.3s ease;
		z-index: 1;
	}

	.connections-card-content {
		position: relative;
		z-index: 2;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.card-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.card-icon {
		font-size: 32rpx;
	}

	.card-content {
		text-align: center;
	}

	.status-value {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 8rpx;
	}

	.status-detail {
		font-size: 24rpx;
		color: #666;
		display: block;
		margin-bottom: 15rpx;
	}

	.progress-bar {
		width: 100%;
		height: 30rpx;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 20rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 7rpx;
		transition: width 0.3s ease;
	}

	.cpu-card .progress-fill {
		background:  #e0e7ff
	}

	.memory-card .progress-fill {
		background:  #8b96e3
	}

	.temp-card .status-value {
		color: #FF5722;
	}

	.hostname-card .status-value {
		color: #4CAF50;
	}

	.arch-card .status-value {
		color: #FF9800;
	}

	.kernel-card .status-value {
		color: #2196F3;
	}

	.time-card .status-value {
		color: #9C27B0;
	}

	.uptime-card .status-value {
		color: #607D8B;
	}

	.users-card .status-value {
		color: #4CAF50;
	}

	.connections-card .progress-fill {
		background:  #8b96e3
	}

	.connections-card .status-value {
		color: #000;
	}

	.refresh-section {
		text-align: center;
	}

	.refresh-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 50rpx;
		padding: 20rpx 40rpx;
		font-size: 28rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
	}

	.refresh-btn:disabled {
		opacity: 0.6;
	}

	.refresh-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
	}

	.refresh-text {
		font-size: 28rpx;
	}

	.network-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 30rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	}

	.network-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.network-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.network-icon {
		font-size: 32rpx;
	}

	.network-details {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}


	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
	}

	.loading-content {
		background: white;
		padding: 40rpx;
		border-radius: 30rpx;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-width: 300rpx;
	}

	.loading-spinner {
		border: 4rpx solid #f3f3f3;
		border-top: 4rpx solid #3498db;
		border-radius: 50%;
		width: 80rpx;
		height: 80rpx;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 28rpx;
		margin-top: 20rpx;
		text-align: center;
		width: 100%;
	}

	.disk-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 30rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	}

	.disk-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.disk-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.disk-icon {
		font-size: 32rpx;
	}

	.disk-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.disk-item {
		padding: 20rpx;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 16rpx;	
		position: relative;
		overflow: hidden;
	}

	.disk-progress-bg {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: #e0e7ff;
		border-radius: 0rpx;
		transition: width 0.3s ease;
		z-index: 1;
	}

	.disk-item-content {
		position: relative;
		z-index: 2;
	}

	.disk-info {
		margin-bottom: 15rpx;
	}

	.disk-mount {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
		display: block;
		margin-bottom: 5rpx;
	}

	.disk-device {
		font-size: 24rpx;
		color: #666;
		display: block;
	}

	.disk-usage {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.disk-usage-text {
		font-size: 26rpx;
		font-weight: bold;
		color: #333;
		text-align: right;
	}

	.disk-progress-bar {
		width: 100%;
		height: 20rpx;
		background: #e0e7ff;
		border-radius: 7rpx;
		overflow: hidden;
	}

	.disk-progress-fill {
		height: 100%;
		border-radius: 7rpx;
		background:#bec6fd;
		transition: width 0.3s ease;
	}

	.disk-detail {
		font-size: 24rpx;
		color: #666;
		text-align: right;
	}

	.disk-temp-label {
		font-size: 22rpx;
		color: #999;
		font-weight: normal;
		margin-left: 8rpx;
	}

	.load-label {
		font-size: 22rpx;
		color: #999;
		font-weight: normal;
		margin-right: 8rpx;
	}

	.load-value {
		font-size: 24rpx;
		color: #666;
		font-weight: normal;
	}

	.cache-label {
		font-size: 22rpx;
		color: #999;
		font-weight: normal;
		margin-right: 8rpx;
	}

	.cache-value {
		font-size: 24rpx;
		color: #666;
		font-weight: normal;
	}


	.footer {
		text-align: center;
		padding: 40rpx 20rpx;
		margin-top: 20rpx;
	}

	.footer-text {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 500;
	}

	.footer-link {
		text-align: center;
		padding: 20rpx;
		margin-top: 20rpx;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.footer-link:active {
		opacity: 0.7;
	}
</style> 