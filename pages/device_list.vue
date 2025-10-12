<template>
	<view class="container">
		<view class="header">
			<view class="menu-btn" @click="showMenu" style="margin-top: 18rpx;">
				<image class="menu-icon" src="/static/menu.png" mode="widthFix" style="width: 50rpx; height: 50rpx;" />
			</view>
			<view class="header-actions">
				<view class="add-btn" @click="addDevice">
					<image class="add-icon" src="/static/add.png" mode="widthFix" />
				</view>
			</view>
		</view>
		
		<uni-popup ref="menuPopup" type="top" :mask-click="true">
			<view class="menu-content">
				<view class="menu-item" @click="navigateToHelp">
	
					<text class="menu-item-text">{{ $t('device_list.help_feedback') }}</text>
					<image class="menu-item-arrow" src="/static/right.png" mode="widthFix" style="width: 32rpx; height: 32rpx;" />
				</view>
				<view class="menu-item" @click="navigateToSettings">
				
				<text class="menu-item-text">{{ $t('device_list.language_settings') }}</text>
				<image class="menu-item-arrow" src="/static/right.png" mode="widthFix" style="width: 32rpx; height: 32rpx;" />
			</view>
				<view class="menu-item" @click="navigateToAbout">
			
					<text class="menu-item-text">{{ $t('device_list.about') }}</text>
					<image class="menu-item-arrow" src="/static/right.png" mode="widthFix" style="width: 32rpx; height: 32rpx;" />
				</view>
			
			</view>
		</uni-popup>
		
			<view class="device-list-container">
			<view v-if="deviceList.length === 0" class="empty-state">
				<text class="empty-text">{{ $t('device_list.empty_message') }}</text>
			</view>
			<view v-else :key="index" v-for="(item, index) in deviceList">
				<view class="device-card" @click="onCardClickHandle(item)">
					<view class="card-content">
						<image class="device-icon" src="/static/openwrt.png" mode="widthFix" />
						<view class="device-info">
							<text class="device-name">{{item.name}}</text>
							<text class="device-address">{{formatDeviceAddress(item)}}</text>
						</view>
						<view class="more-btn" @click.stop="showDeviceMenu(item)">
							<image class="more-icon" src="/static/more.png" mode="widthFix" />
						</view>
					</view>
				</view>
			</view>
		</view>
	
		<uni-popup ref="devicePopup" type="center" :mask-click="false">
			<view class="popup-content">
				<view class="popup-header">
					<text class="popup-title">{{isEdit ? $t('device_list.edit_device_popup') : $t('device_list.add_device_popup')}}</text>
				</view>
				<view class="form-content">
				
					<view class="form-item">
						<text class="label">{{ $t('device_list.host_address') }}:</text>
						<input class="input" v-model="deviceForm.ip" :placeholder="$t('device_list.host_placeholder')" />
					</view>
			
				
			<!-- 		<view class="form-item">
						<text class="label">{{ $t('device_list.protocol') }}:</text>
						<view class="protocol-selector">
							<view 
								:class="['protocol-option', deviceForm.useHttps ? '' : 'active']" 
								@click="deviceForm.useHttps = false"
							>
								<text>HTTP</text>
							</view>
							<view 
								:class="['protocol-option', deviceForm.useHttps ? 'active' : '']" 
								@click="deviceForm.useHttps = true"
							>
								<text>HTTPS</text>
							</view>
						</view>
					</view> -->
					<view class="form-item">
						<text class="label">{{ $t('device_list.username_default') }}:</text>
						<input class="input" v-model="deviceForm.username" :placeholder="$t('device_list.username_placeholder')" />
					</view>
					<view class="form-item">
						<text class="label">{{ $t('device_list.password') }}:</text>
						<input class="input" v-model="deviceForm.password" :placeholder="$t('device_list.password_placeholder')" type="password" />
					</view>
					<view class="form-item">
						<text class="label">{{ $t('device_list.port_default') }}:</text>
						<input class="input" v-model="deviceForm.port" :placeholder="$t('device_list.port_placeholder')" />
					</view>
					<view class="form-item">
						<text class="label">{{ $t('device_list.remark') }}:</text>
						<input class="input" v-model="deviceForm.name" :placeholder="$t('device_list.name_placeholder')" />
					</view>
				</view>
				<view class="popup-actions">
					<button class="popup-btn cancel-btn" @click="closePopup">{{ $t('device_list.cancel') }}</button>
					<button class="popup-btn confirm-btn" @click="saveDevice">{{ $t('device_list.confirm') }}</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 设备操作菜单弹窗 -->
		<uni-popup ref="deviceMenuPopup" type="bottom" :mask-click="true">
			<view class="device-menu-content">
				<view class="menu-item" @click="editDeviceFromMenu">
					<image class="menu-item-icon" src="/static/edit2.png" mode="widthFix" />
					<text class="menu-item-text">{{ $t('device_list.edit') }}</text>
				</view>
				<view class="menu-item delete-item" @click="deleteDeviceFromMenu">
					<image class="menu-item-icon" src="/static/delete2.png" mode="widthFix" />
					<text class="menu-item-text">{{ $t('device_list.delete') }}</text>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import DeviceManager from '@/utils/deviceManager.js'
	
	export default {
		data() {
			return {
				deviceList: [],
				deviceForm: {
					name: 'OpenWrt',
					ip: '192.168.1.1',
					port: '80',
					username: 'root',
					password: '',
					useHttps: false
				},
				isEdit: false,
				editDeviceId: null,
				currentDevice: null // 当前选中的设备
			}
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: this.$t('device_list.title')
			})
			
			this.loadDeviceList()
		},
		onShow() {
			this.loadDeviceList()
		},
		methods: {
			// 根据错误码获取错误消息
			getErrorMessage(errorCode) {
				switch (errorCode) {
					case 4000: // 网络错误
						return this.$t('device_list.error_network')
					case 4001: // 用户名密码错误
						return this.$t('device_list.error_auth')
					case 4002: // 其他错误
						return this.$t('device_list.error_other')
					default:
						return this.$t('device_list.connection_failed_content')
				}
			},
			
			loadDeviceList() {
				const deviceList = DeviceManager.getDeviceList()
				if (deviceList.length === 0) {
		
					DeviceManager.initTestData()
					this.deviceList = DeviceManager.getDeviceList()
				} else {
					this.deviceList = deviceList
				}
			},
			


			addDevice() {
				this.isEdit = false
				this.editDeviceId = null
				this.resetDeviceForm()
				this.$refs.devicePopup.open()
			},
			
	
			editDevice(device) {
				this.isEdit = true
				this.editDeviceId = device.id
				// 获取解密后的设备信息
				const decryptedDevice = DeviceManager.getDeviceById(device.id)
				this.deviceForm = { ...decryptedDevice }
				this.$refs.devicePopup.open()
			},
			
		
			deleteDevice(deviceId) {
				uni.showModal({
					title: this.$t('device_list.delete_confirm_title'),
					content: this.$t('device_list.delete_confirm_content'),
					success: (res) => {
						if (res.confirm) {
							if (DeviceManager.deleteDevice(deviceId)) {
								this.loadDeviceList()
								uni.showToast({
									title: this.$t('device_list.delete_success'),
									icon: 'success',
									duration: 1000
								})
							} else {
								uni.showToast({
									title: this.$t('device_list.delete_failed'),
									icon: 'error',
									duration: 1000
								})
							}
						}
					}
				})
			},
			
	
			resetDeviceForm() {
				this.deviceForm = {
					name: 'OpenWrt',
					ip: '',
					port: '80',
					username: 'root',
					password: '',
					useHttps: false
				}
			},
			
		
			validateIP(host) {
				// 长度限制：不超过64个字符
				if (!host || host.length === 0 || host.length > 64) {
					return false
				}
				
				// 允许的字符：字母、数字、点号、冒号、连字符
				// 这些字符涵盖了IPv4、IPv6和域名的所有有效字符
				const allowedCharsRegex = /^[a-zA-Z0-9.:-]+$/
				return allowedCharsRegex.test(host)
			},
			
			
			validatePort(port) {
				const portNum = parseInt(port)
				return portNum >= 1 && portNum <= 65535
			},
			
		
			validateUsername(username) {
				const usernameRegex = /^[a-zA-Z0-9]+$/
				return usernameRegex.test(username)
			},
			
			validatePassword(password) {
		
				if (password === '') {
					return { valid: true, message: '' }
				}
				
				if (password.length > 32) {
					return { valid: false, message: this.$t('device_list.password_length_error') }
				}
				if (password.includes(' ') || password.includes('\n') || password.includes('\r')) {
					return { valid: false, message: this.$t('device_list.password_format_error') }
				}

				const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]*$/
				if (!passwordRegex.test(password)) {
					return { valid: false, message: this.$t('device_list.password_char_error') }
				}
				
				return { valid: true, message: '' }
			},
			
			// 验证备注长度
			validateName(name) {
				return name.length <= 64
			},
			
	
			saveDevice() {
			
				if (!this.deviceForm.ip) {
					uni.showToast({
						title: this.$t('device_list.host_required'),
						icon: 'none'
					})
					return
				}
				if (!this.validateIP(this.deviceForm.ip)) {
					uni.showToast({
						title: this.$t('device_list.host_format_error'),
						icon: 'none'
					})
					return
				}
				
		
				if (!this.deviceForm.port) {
					uni.showToast({
						title: this.$t('device_list.port_required'),
						icon: 'none'
					})
					return
				}
				if (!this.validatePort(this.deviceForm.port)) {
					uni.showToast({
						title: this.$t('device_list.port_range_error'),
						icon: 'none'
					})
					return
				}
				
		
				if (!this.deviceForm.username) {
					uni.showToast({
						title: this.$t('device_list.username_required'),
						icon: 'none'
					})
					return
				}
				if (!this.validateUsername(this.deviceForm.username)) {
					uni.showToast({
						title: this.$t('device_list.username_format_error'),
						icon: 'none'
					})
					return
				}
				
		
				const passwordValidation = this.validatePassword(this.deviceForm.password)
				if (!passwordValidation.valid) {
					uni.showToast({
						title: passwordValidation.message,
						icon: 'none'
					})
					return
				}
			
				if (!this.deviceForm.name) {
					uni.showToast({
						title: this.$t('device_list.remark_required'),
						icon: 'none'
					})
					return
				}
				if (!this.validateName(this.deviceForm.name)) {
					uni.showToast({
						title: this.$t('device_list.remark_length_error'),
						icon: 'none'
					})
					return
				}
				
				let success = false
				if (this.isEdit) {
			
					this.deviceForm.sysauth = null
					this.deviceForm.online = false
					success = DeviceManager.updateDevice(this.editDeviceId, this.deviceForm)
				} else {
		
					success = DeviceManager.addDevice(this.deviceForm)
				}
				
				if (success) {
					this.loadDeviceList()
					this.closePopup()
					uni.showToast({
						title: this.isEdit ? this.$t('device_list.edit_success') : this.$t('device_list.add_success'),
						icon: 'success',
						duration: 1000
					})
				} else {
					uni.showToast({
						title: this.$t('device_list.operation_failed'),
						icon: 'error',
						duration: 1000
					})
				}
			},
			
		
			closePopup() {
				this.$refs.devicePopup.close()
				this.resetDeviceForm()
			},
			
		
			formatTime(timeString) {
				if (!timeString) return ''
				const date = new Date(timeString)
				// 根据当前语言设置时间格式
				const locale = this.$i18n.locale
				return date.toLocaleString(locale === 'en' ? 'en-US' : 'zh-CN')
			},

			
	
			onCardClickHandle(device) {
		
				uni.showLoading({
							title: this.$t('device_list.connecting')
						})
				
				DeviceManager.checkAndLoginDevice(device, (loginResult) => {
					console.log("check and login device")

					if (loginResult.success) {
						console.log("loginResult.success = " + loginResult.success)
						console.log("loginResult.sysauth = " + loginResult.sysauth)
						
						const updatedDevice = { ...device, sysauth: loginResult.sysauth, online: true }
						DeviceManager.setCurrentDevice(updatedDevice)
			
						
						// 在跳转前先检查session是否有效，然后检查oaf_status
						this.checkSessionValidity(updatedDevice)
					} else {
						// 登录失败
						uni.hideLoading()
						const errorMessage = this.getErrorMessage(loginResult.errorCode)
						uni.showModal({
							title: this.$t('device_list.connection_failed'),
							content: errorMessage,
							showCancel: false
						})
					}
				})
			},
			
			// 检查session是否有效
			checkSessionValidity(device) {
				const protocol = device.useHttps ? 'https' : 'http'
				const formattedHost = DeviceManager.formatHostForUrl(device.ip)
				const url = `${protocol}://${formattedHost}:${device.port}/ubus`
				console.log("checkSessionValidity url:", url)
				uni.request({
					method: "POST",
					url: url,
					data: {
						jsonrpc: "2.0",
						id: 1,
						method: "call",
						params: [device.sysauth, "system", "board", {}]
					},
					header: {
						'Content-Type': 'application/json'
					},
					timeout: 3000,
					success: (res) => {
						console.log("checkSessionValidity session检查响应:", JSON.stringify(res))
						
				
						if (res.statusCode === 200 && res.data && res.data.result && res.data.result[0] === 0) {
					
							uni.hideLoading()
							uni.showToast({
								title: this.$t('device_list.connection_success'),
								icon: 'success',
								duration: 1000
							})
							
							// 异步检查oaf_status，不阻塞页面跳转
							this.checkOafStatus(device)
							
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/device/home'
								})
							}, 500)
							console.log("session valid, jump to home page")
							
						} else {
							this.reLoginDevice(device)
						}
					},
					fail: (err) => {
						console.log("checkSessionValidity fail:", err)
						// 安卓出现该接口概率性失败，但是reLogin ok，所以去掉提示
						// 直接调用reLoginDevice，让reLoginDevice方法处理loading的隐藏
						this.reLoginDevice(device)
					}
				})
		},
		
		// 获取oaf_status并设置support_parental_control（异步非阻塞）
		async checkOafStatus(device) {
			try {
				const protocol = device.useHttps ? 'https' : 'http'
				const formattedHost = DeviceManager.formatHostForUrl(device.ip)
				const url = `${protocol}://${formattedHost}:${device.port}/ubus`
				
				// 设置3秒超时
				const response = await Promise.race([
					new Promise((resolve, reject) => {
						uni.request({
							url: url,
							method: 'POST',
							header: {
								'Content-Type': 'application/json'
							},
							data: {
								jsonrpc: '2.0',
								id: 1,
								method: 'call',
								params: [
									device.sysauth,
									'appfilter',
									'get_oaf_status',
									{}
								]
							},
							timeout: 3000,
							success: resolve,
							fail: reject
						})
					}),
					new Promise((_, reject) => {
						setTimeout(() => reject(new Error('oaf_status请求超时')), 3000)
					})
				])
				
				if (response.data && response.data.result && response.data.result[0] === 0) {
					// oaf_status获取成功，设置support_parental_control为1
					const updatedDevice = { ...device, support_parental_control: 1 }
					DeviceManager.setCurrentDevice(updatedDevice)
					console.log('oaf_status获取成功，设置support_parental_control为1')
				} else {
					// oaf_status获取失败，设置support_parental_control为0
					const updatedDevice = { ...device, support_parental_control: 0 }
					DeviceManager.setCurrentDevice(updatedDevice)
					console.log('oaf_status获取失败，设置support_parental_control为0')
				}
			} catch (error) {
				// 请求失败或超时，设置support_parental_control为0
				const updatedDevice = { ...device, support_parental_control: 0 }
				DeviceManager.setCurrentDevice(updatedDevice)
				console.log('oaf_status请求失败或超时，设置support_parental_control为0:', error.message || error)
			}
		},
		
		reLoginDevice(device) {
				const deviceWithoutSession = { ...device, sysauth: null }
				DeviceManager.loginDevice(deviceWithoutSession, (loginResult) => {
					if (loginResult.success) {
				
						const updatedDevice = { ...device, sysauth: loginResult.sysauth, online: true }
						DeviceManager.setCurrentDevice(updatedDevice)
						
						uni.hideLoading()
						uni.showToast({
							title: this.$t('device_list.login_success'),
							icon: 'success',
							duration: 1000
						})
						
						// 异步检查oaf_status，不阻塞页面跳转
						this.checkOafStatus(updatedDevice)
						
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/device/home'
							})
						}, 500)
					} else {
						uni.hideLoading()
						const errorMessage = this.getErrorMessage(loginResult.errorCode)
						uni.showModal({
							title: this.$t('device_list.login_failed'),
							content: errorMessage,
							showCancel: false
						})
					}
				})
			},

			// 显示菜单
			showMenu() {
				this.$refs.menuPopup.open()
			},

			navigateToHelp() {
				uni.navigateTo({
					url: '/pages/help/index'
				})
				this.$refs.menuPopup.close()
			},

			navigateToAbout() {
				uni.navigateTo({
					url: '/pages/about/index'
				})
				this.$refs.menuPopup.close()
			},

			navigateToSettings() {
				uni.navigateTo({
					url: '/pages/language/index'
				})
				this.$refs.menuPopup.close()
			},

			// 显示设备操作菜单
			showDeviceMenu(device) {
				this.currentDevice = device
				this.$refs.deviceMenuPopup.open()
			},

			// 从菜单编辑设备
			editDeviceFromMenu() {
				this.$refs.deviceMenuPopup.close()
				this.editDevice(this.currentDevice)
			},

			// 从菜单删除设备
			deleteDeviceFromMenu() {
				this.$refs.deviceMenuPopup.close()
				this.deleteDevice(this.currentDevice.id)
			},

			// 格式化设备地址，超过32个字符时隐藏中间部分
			formatDeviceAddress(device) {
				const protocol = device.useHttps ? 'https' : 'http'
				const fullAddress = `${protocol}://${device.ip}:${device.port}`
				
				if (fullAddress.length <= 32) {
					return fullAddress
				}
				
				// 超过32个字符时，隐藏中间部分
				// 保留协议部分 + 前8个字符 + ... + 后8个字符
				const protocolPart = `${protocol}://`
				const remainingLength = 32 - protocolPart.length - 3 // 减去协议和...的长度
				const startLength = Math.floor(remainingLength / 2)
				const endLength = remainingLength - startLength
				
				const start = fullAddress.substring(protocolPart.length, protocolPart.length + startLength)
				const end = fullAddress.substring(fullAddress.length - endLength)
				return `${protocolPart}${start}...${end}`
			}
		}
	}
</script>

<style scoped>
.container {
	padding: 10rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.header-actions {
	display: flex;
	gap: 20rpx;
}

.menu-btn {
	padding: 10rpx;
}

.menu-icon {
	font-size: 40rpx;
	color: #333;
}

.add-btn {
	background-color: transparent;
	border: none;
	padding: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 60rpx;
	height: 60rpx;
}

.add-icon {
	width: 55rpx;
	height: 55rpx;
}

.device-list-container {
	padding: 2rpx;
}

.device-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.empty-state {
	text-align: center;
	padding: 100rpx 0;
}

.empty-text {
	color: #999;
	font-size: 20rpx;
}

/* 设备卡片样式 */
.device-card {
	background: rgba(99, 77, 221, 0.15);
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	padding: 30rpx 20rpx;
	box-shadow: 0 4rpx 15rpx rgba(99, 77, 221, 0.1);
	min-height: 120rpx;
	position: relative;
	backdrop-filter: blur(10rpx);
	border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.card-content {
	display: flex;
	align-items: center;
}

.device-icon {
	width: 100rpx;
	height: 100rpx;
	margin-right: 25rpx;
	flex-shrink: 0;
}

.device-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.device-name {
	font-size: 34rpx;
	font-weight: bold;
	color: #333333;
	margin-bottom: 15rpx;
	line-height: 1.3;
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.5);
}

.device-address {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.3;
	text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.3);
}

.more-btn {
	padding: 10rpx;
	margin-left: 10rpx;
	flex-shrink: 0;
}

.more-icon {
	width: 40rpx;
	height: 40rpx;
}

.popup-content {
	background-color: white;
	border-radius: 20rpx;
	width: 600rpx;
	padding: 30rpx;
}

.popup-header {
	text-align: center;
	margin-bottom: 10rpx;
}

.popup-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
}

.form-content {
	margin-bottom: 25rpx;
}

.form-item {
	margin-bottom: 20rpx;
}

.label {
	display: block;
	font-size: 26rpx;
	color: #333;
	margin-bottom: 8rpx;
}

.input {
	width: 100%;
	height: 70rpx;
	border: 2rpx solid #ddd;
	border-radius: 8rpx;
	padding: 0 20rpx;
	font-size: 26rpx;
	box-sizing: border-box;
}

.popup-actions {
	display: flex;
	justify-content: space-between;
	gap: 20rpx;
}

.popup-btn {
	flex: 1;
	height: 70rpx;
	border-radius: 8rpx;
	font-size: 26rpx;
	border: none;
}

.cancel-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background-color: #007aff;
	color: white;
}

.protocol-selector {
	display: flex;
	gap: 10rpx;
}

.protocol-option {
	flex: 1;
	text-align: center;
	padding: 15rpx;
	border: 2rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #666;
	background-color: #f9f9f9;
	transition: all 0.3s ease;
}

.protocol-option.active {
	background-color: #007aff;
	color: white;
	border-color: #007aff;
}

/* 菜单弹窗样式 */
.menu-content {
	background-color: #fff;
	border-radius: 20rpx;
	padding: 20rpx;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 15rpx 0;
	border-bottom: 1rpx solid #eee;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item-icon {
	font-size: 36rpx;
	margin-right: 15rpx;
	color: #007aff;
}

.menu-item-text {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.menu-item-arrow {
	font-size: 30rpx;
	color: #999;
}

/* 设备操作菜单样式 */
.device-menu-content {
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	padding: 5rpx;
}

.device-menu-content .menu-item {
	display: flex;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #eee;
}

.device-menu-content .menu-item:last-child {
	border-bottom: none;
}

.device-menu-content .menu-item-icon {
	width: 40rpx;
	height: 40rpx;
	margin-right: 20rpx;
}

.device-menu-content .menu-item-text {
	flex: 1;
	font-size: 32rpx;
	color: #333;
}

.device-menu-content .delete-item .menu-item-text {
	color: #ff3b30;
}
</style>
