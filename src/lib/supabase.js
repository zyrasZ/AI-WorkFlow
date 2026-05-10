import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get Gmail provider_token from current Supabase session.
 * Supabase stores provider_token in the session after Google OAuth.
 * Returns null if not available (user needs to re-login).
 */
export async function getGmailToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.warn('⚠️ getGmailToken: No Supabase session found');
      return null;
    }

    const accessToken  = session.provider_token;
    const refreshToken = session.provider_refresh_token;

    console.log('🔍 Supabase session check:', {
      hasProviderToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      provider: session.user?.app_metadata?.provider,
    });

    if (accessToken) {
      localStorage.setItem('gmail_access_token', accessToken);
      if (refreshToken) localStorage.setItem('gmail_refresh_token', refreshToken);
      console.log('✅ Gmail token retrieved from Supabase session');
    }

    return accessToken || null;
  } catch (err) {
    console.warn('⚠️ Could not get Gmail token from Supabase:', err.message);
    return null;
  }
}

/**
 * Sign in with Google via Supabase OAuth (with Gmail scopes).
 * This ensures provider_token is returned in the session.
 * Use this when the user needs to re-authorize Gmail access.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('❌ Supabase Google OAuth error:', error.message);
    throw error;
  }

  return data;
}

/**
 * Listen for Supabase auth state changes and store provider_token.
 * Call this once at app startup.
 */
export function listenForAuthChanges() {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Supabase auth event:', event);
    
    if (event === 'SIGNED_IN' && session) {
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;

      if (providerToken) {
        localStorage.setItem('gmail_access_token', providerToken);
        console.log('✅ Gmail provider_token stored from auth state change');
      }
      if (providerRefreshToken) {
        localStorage.setItem('gmail_refresh_token', providerRefreshToken);
      }

      // Store user data
      if (session.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email,
          avatar_url: session.user.user_metadata?.avatar_url,
          provider: session.user.app_metadata?.provider || 'google',
        };
        localStorage.setItem('user_data', JSON.stringify(userData));
      }

      // Notify other components
      window.dispatchEvent(new CustomEvent('gmail-token-updated', { detail: { hasToken: !!providerToken } }));
    }

    if (event === 'TOKEN_REFRESHED' && session) {
      const providerToken = session.provider_token;
      if (providerToken) {
        localStorage.setItem('gmail_access_token', providerToken);
        console.log('✅ Gmail token refreshed via Supabase');
        window.dispatchEvent(new CustomEvent('gmail-token-updated', { detail: { hasToken: true } }));
      }
    }
  });
}
