<script>
	export default {
		onLaunch: function() {
			this.initI18n()
		},
		onShow: function() {
		
		},
		onPageNotFound: function() {
	
		},
		onHide: function() {
		
		},
		
		methods: {

    
			initI18n() {

				const savedLocale = uni.getStorageSync('locale')
				if (savedLocale) {
					
					uni.setStorageSync('locale', savedLocale)
				}
			},

		}
	}
</script>

<style>
</style>
