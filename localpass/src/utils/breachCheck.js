/**
 * Password breach checking utility using HaveIBeenPwned API
 * This checks if a password has been found in known data breaches
 */

/**
 * Check if a password has been found in data breaches
 * Uses HaveIBeenPwned API with k-anonymity model for privacy
 * @param {string} password - The password to check
 * @returns {Promise<{isBreached: boolean, count: number, message: string}>}
 */
export async function checkPasswordBreach(password) {
  if (!password || password.length === 0) {
    return {
      isBreached: false,
      count: 0,
      message: 'No password to check'
    }
  }

  try {
    // Hash the password with SHA-1
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-1', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Use first 5 characters for k-anonymity
    const hashPrefix = hashHex.substring(0, 5).toUpperCase()
    const hashSuffix = hashHex.substring(5).toUpperCase()

    // Make request to HaveIBeenPwned API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'LocalPass-Password-Generator/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const dataText = await response.text()
    const lines = dataText.split('\n')
    
    // Look for our hash suffix in the response
    for (const line of lines) {
      if (line.startsWith(hashSuffix)) {
        const count = parseInt(line.split(':')[1], 10)
        return {
          isBreached: true,
          count: count,
          message: `Password found in ${count.toLocaleString()} data breaches`
        }
      }
    }

    return {
      isBreached: false,
      count: 0,
      message: 'Password not found in known breaches'
    }

  } catch (error) {
    console.error('Breach check failed:', error)
    return {
      isBreached: false,
      count: 0,
      message: `Breach check failed: ${error.message}`,
      error: true
    }
  }
}

/**
 * Get a security recommendation based on breach check results
 * @param {Object} breachResult - Result from checkPasswordBreach
 * @returns {string} Security recommendation
 */
export function getSecurityRecommendation(breachResult) {
  if (breachResult.error) {
    return 'Unable to verify password security. Consider using a different password.'
  }
  
  if (breachResult.isBreached) {
    if (breachResult.count > 1000) {
      return 'This password is highly compromised. Generate a new one immediately.'
    } else if (breachResult.count > 100) {
      return 'This password has been found in multiple breaches. Consider generating a new one.'
    } else {
      return 'This password has been found in a data breach. Consider generating a new one.'
    }
  }
  
  return 'This password appears to be secure and not found in known breaches.'
}

