import { GOOGLE_MAPS_API_KEY as _GOOGLE_MAPS_API_KEY } from '@env';
import { TURN_DOMAIN, TURN_SERVER_USERNAME, TURN_SERVER_PASSWORD } from '@env';
import { MAPTILE_API_KEY, ORS_API_KEY, SENTRY_DSN , LIVE_API_URL, DEV_API_URL, MODE} from '@env';

export const TURN_SERVER_DOMAIN = TURN_DOMAIN;
export const TURN_SERVER_USER = TURN_SERVER_USERNAME;
export const TURN_SERVER_PASS = TURN_SERVER_PASSWORD;
export const MAP_TILE_API_KEY = MAPTILE_API_KEY;
export const ORS_KEY = ORS_API_KEY;
export const USE_GOOGLE_MAPS = true;

export const GOOGLE_MAPS_API_KEY = _GOOGLE_MAPS_API_KEY;
export const SENTRY_DSN_URL = SENTRY_DSN;

export const env = {
  type: MODE, //prod staging dev
  appUrls: {
    dev: {
      apiUrl: DEV_API_URL,
    },
    staging: {
      apiUrl: LIVE_API_URL,
    },
    prod: {
      apiUrl: LIVE_API_URL,
    },
  },
  mediaUrls: {
    dev: {
      apiUrl: DEV_API_URL,
    },
    staging: {
      apiUrl: LIVE_API_URL,
    },
    prod: {
      apiUrl: LIVE_API_URL,
    },
  },
};
