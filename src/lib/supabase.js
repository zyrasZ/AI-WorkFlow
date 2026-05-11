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
      // Silent — no session is normal when not logged in
      return null;
    }

    const accessToken  = session.provider_token;
    const refreshToken = session.provider_refresh_token;

    if (accessToken) {
      localStorage.setItem('gmail_access_token', accessToken);
      if (refreshToken) localStorage.setItem('gmail_refresh_token', refreshToken);
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
 * Sign in with Google but force account selection screen.
 * Used when user wants to authorize a DIFFERENT Google account for a specific node.
 * Saves the nodeId to sessionStorage so after redirect we know which node to update.
 */
export async function signInWithGoogleSelectAccount(nodeId) {
  if (nodeId) {
    sessionStorage.setItem('oauth_target_node_id', nodeId);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify',
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account consent',
      },
    },
  });

  if (error) {
    console.error('❌ Supabase Google OAuth (select account) error:', error.message);
    throw error;
  }

  return data;
}

/**
 * Listen for Supabase auth state changes and store provider_token.
 * Call this once at app startup.
 * If sessionStorage has 'oauth_target_node_id', dispatches a per-node token event
 * so that specific EmailAccountNode can update its own token without affecting others.
 */
export function listenForAuthChanges() {
  supabase.auth.onAuthStateChange((event, session) => {
    // Skip noisy non-actionable events
    if (event === 'INITIAL_SESSION') return;
    console.log('🔄 Supabase auth event:', event);
    
    if (event === 'SIGNED_IN' && session) {
      const providerToken = session.provider_token;
      const providerRefreshToken = session.provider_refresh_token;

      // Store access token for API calls
      if (session.access_token) {
        localStorage.setItem('office_weave_token', session.access_token);
      }

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
        
        // Dispatch auth-changed event so App.jsx can navigate
        window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }));
      }

      // Check if this login was triggered for a specific node
      const targetNodeId = sessionStorage.getItem('oauth_target_node_id');
      if (targetNodeId && providerToken) {
        sessionStorage.removeItem('oauth_target_node_id');
        // Dispatch per-node event so only that EmailAccountNode updates its token
        window.dispatchEvent(new CustomEvent('gmail-node-token-updated', {
          detail: {
            nodeId: targetNodeId,
            accessToken: providerToken,
            refreshToken: providerRefreshToken || '',
            email: session.user?.email || '',
          }
        }));
        console.log(`✅ Per-node Gmail token dispatched for node: ${targetNodeId}`);
      } else {
        // Global token update — notify all nodes
        window.dispatchEvent(new CustomEvent('gmail-token-updated', { detail: { hasToken: !!providerToken } }));
      }
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
