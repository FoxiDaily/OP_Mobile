
/*Notice:It may be modified when released*/
const KEY = 'defaultkey'; 
const ENCRYPTED_PREFIX = 'ENC:';

class Crypto {

	static encrypt(text) {
		if (!text) return '';
		
		let encrypted = '';
		for (let i = 0; i < text.length; i++) {
			encrypted += String.fromCharCode(text.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
		}
		const encoded = btoa(encrypted);
		return ENCRYPTED_PREFIX + encoded;
	}

	static decrypt(cipher) {
		if (!cipher || !cipher.startsWith(ENCRYPTED_PREFIX)) {
			return cipher; 
		}
		
		try {
			
			const encoded = cipher.substring(ENCRYPTED_PREFIX.length);
			const encrypted = atob(encoded);
			
			let decrypted = '';
			for (let i = 0; i < encrypted.length; i++) {
				decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
			}
			
			return decrypted;
		} catch (e) {
			return cipher; 
		}
	}

	static isEncrypted(text) {
		return text && text.startsWith(ENCRYPTED_PREFIX);
	}
}

export default Crypto;
