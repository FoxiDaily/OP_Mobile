class SessionManager {
	constructor() {
		this.sessionId = null
		this.sessionKey = 'openwrt_session_id'
		this.initSession()
	}

	initSession() {
		const savedSession = uni.getStorageSync(this.sessionKey)
		if (savedSession) {
			this.sessionId = savedSession
		} else {
			this.sessionId = ''
		}
	}

	getSession() {
		return this.sessionId
	}

	setSession(sessionId) {
		this.sessionId = sessionId
		uni.setStorageSync(this.sessionKey, sessionId)
	}


	clearSession() {
		this.sessionId = null
		uni.removeStorageSync(this.sessionKey)
	}

	isValid() {
		return this.sessionId && this.sessionId.length > 0
	}
}

const sessionManager = new SessionManager()

export default sessionManager 