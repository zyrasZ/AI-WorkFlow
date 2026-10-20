import { useEffect } from 'react'
import { getGmailToken } from '../lib/supabase'
import { API_BASE_URL } from '../lib/config'

/**
 * Handles Google OAuth redirect callback.
 * Parses access_token / provider_token from the URL on mount,
 * fetches user info from the backend, then calls onSuccess or onError.
 *
 * @param {{ onSuccess: (userData: object) => void, onError: () => void }} callbacks
 */
export function useOAuthCallback({ onSuccess, onError }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))

    const accessToken = params.get('access_token') || hashParams.get('access_token')
    const errorMsg = params.get('message') || hashParams.get('error_description')
    const providerToken = params.get('provider_token') || hashParams.get('provider_token')
    const providerRefreshToken =
      params.get('provider_refresh_token') || hashParams.get('provider_refresh_token')

    if (!accessToken && !errorMsg) return

    if (accessToken) {
      console.log('✅ Google OAuth callback detected, processing token...')
      console.log('🔍 provider_token:', providerToken ? providerToken.slice(0, 30) + '...' : 'EMPTY')

      localStorage.setItem('office_weave_token', accessToken)

      if (providerToken) {
        localStorage.setItem('gmail_access_token', providerToken)
        console.log('✅ Gmail provider_token stored from URL')
      } else {
        console.warn('⚠️ provider_token empty — trying Supabase session fallback...')
        getGmailToken().then(token => {
          if (token) console.log('✅ Gmail token retrieved via Supabase session fallback')
          else console.warn('⚠️ No provider_token available — user may need to re-authorize Gmail')
        })
      }

      if (providerRefreshToken) {
        localStorage.setItem('gmail_refresh_token', providerRefreshToken)
      }

      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname)

      fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`)
          return r.json()
        })
        .then(data => {
          const userData = data.data || data.user || data

          if (userData?.email) {
            localStorage.setItem('user_data', JSON.stringify(userData))

            if (userData.provider === 'google') {
              getGmailToken().then(token => {
                if (token) console.log('✅ Gmail token ready:', token.slice(0, 20) + '...')
                else console.warn('⚠️ No Gmail provider_token in session')
              })
            }

            window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }))
            setTimeout(() => onSuccess(userData), 100)
          } else {
            console.error('❌ Invalid user data format:', data)
            localStorage.removeItem('office_weave_token')
            localStorage.removeItem('user_data')
            alert('Không thể lấy thông tin người dùng từ Google. Vui lòng thử lại.')
            onError()
          }
        })
        .catch(err => {
          console.error('❌ OAuth user fetch error:', err)
          localStorage.removeItem('office_weave_token')
          localStorage.removeItem('user_data')
          alert('Lỗi khi lấy thông tin người dùng: ' + err.message)
          onError()
        })
    } else if (errorMsg) {
      console.error('OAuth error:', errorMsg)
      window.history.replaceState({}, '', window.location.pathname)
      alert('Đăng nhập Google thất bại: ' + errorMsg)
      setTimeout(() => onError(), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
