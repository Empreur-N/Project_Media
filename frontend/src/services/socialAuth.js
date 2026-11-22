// Service d'authentification sociale OAuth 2.0 réelle (Google Identity Services & Facebook SDK)

export const DEFAULT_GOOGLE_CLIENT_ID = '1068659789768-bq0ee4rci31g58e89c4ellm53tj9snst.apps.googleusercontent.com';
export const DEFAULT_FACEBOOK_APP_ID = '1165712492820625';

export const getGoogleClientId = () => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || window.GOOGLE_CLIENT_ID || localStorage.getItem('lifechannel_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID;
};

export const getFacebookAppId = () => {
  return import.meta.env.VITE_FACEBOOK_APP_ID || window.FACEBOOK_APP_ID || localStorage.getItem('lifechannel_facebook_app_id') || DEFAULT_FACEBOOK_APP_ID;
};

export const GOOGLE_CLIENT_ID = getGoogleClientId();
export const FACEBOOK_APP_ID = getFacebookAppId();

/**
 * Initialise le SDK Google Identity Services (GIS)
 */
export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }

    const existingScript = document.getElementById('google-gis-script');
    if (existingScript) {
      existingScript.onload = () => resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

/**
 * Déclenche la VRAIE fenêtre popup de connexion Google (accounts.google.com)
 * Récupère automatiquement les données (nom, email, photo) sans aucun formulaire
 */
export const loginWithGoogleOAuth = async (clientId = getGoogleClientId()) => {
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID_MISSING");
  }

  await initGoogleAuth();

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            if (tokenResponse.error === 'popup_closed_by_user') {
              reject(new Error("POPUP_CLOSED_BY_USER"));
              return;
            }
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          try {
            // Récupération automatique du profil vérifié auprès de l'API Google
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });

            if (!userInfoRes.ok) {
              throw new Error("Impossible de récupérer les informations du compte Google.");
            }

            const profile = await userInfoRes.json();
            resolve({
              provider: 'GOOGLE',
              socialId: profile.sub,
              fullName: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'Lecteur Google',
              email: profile.email,
              picture: profile.picture,
              token: tokenResponse.access_token
            });
          } catch (err) {
            reject(err);
          }
        },
      });

      // Ouvre la vraie popup Google
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Initialise le SDK Facebook JavaScript
 */
export const initFacebookAuth = (appId = getFacebookAppId()) => {
  return new Promise((resolve) => {
    const applyInit = () => {
      try {
        if (window.FB && appId) {
          window.FB.init({
            appId: appId,
            cookie: true,
            xfbml: false,
            version: 'v19.0'
          });
        }
      } catch (e) {
        console.warn("Facebook SDK init:", e);
      }
      resolve(window.FB);
    };

    if (window.FB) {
      applyInit();
      return;
    }

    const prevAsyncInit = window.fbAsyncInit;
    window.fbAsyncInit = function() {
      if (typeof prevAsyncInit === 'function') {
        try { prevAsyncInit(); } catch (e) {}
      }
      applyInit();
    };

    const existingScript = document.getElementById('facebook-jssdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/fr_FR/sdk.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(applyInit, 50);
      };
      document.head.appendChild(script);
    }
  });
};

/**
 * Déclenche la VRAIE fenêtre popup de connexion Facebook (facebook.com)
 * Récupère automatiquement les données (nom, email) sans aucun formulaire
 */
export const loginWithFacebookOAuth = async (appId = getFacebookAppId()) => {
  if (!appId) {
    throw new Error("FACEBOOK_APP_ID_MISSING");
  }

  await initFacebookAuth(appId);

  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("Le SDK Facebook n'a pas pu être chargé."));
      return;
    }

    try {
      window.FB.login((response) => {
        if (response && response.authResponse) {
          window.FB.api('/me', { fields: 'id,name,email,picture' }, (profile) => {
            if (!profile || profile.error) {
              reject(new Error(profile?.error?.message || "Erreur lors de la récupération du profil Facebook."));
              return;
            }

            resolve({
              provider: 'FACEBOOK',
              socialId: profile.id,
              fullName: profile.name || 'Lecteur Facebook',
              email: profile.email || `lecteur.fb.${profile.id}@lifechannelmedia.com`,
              picture: profile.picture?.data?.url,
              token: response.authResponse.accessToken
            });
          });
        } else {
          reject(new Error("POPUP_CLOSED_BY_USER"));
        }
      }, { scope: 'public_profile,email' });
    } catch (err) {
      reject(err);
    }
  });
};
