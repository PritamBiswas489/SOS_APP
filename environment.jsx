import { GOOGLE_MAPS_API_KEY as _GOOGLE_MAPS_API_KEY } from '@env';
import {TURN_DOMAIN, TURN_SERVER_USERNAME, TURN_SERVER_PASSWORD} from '@env';

export const TURN_SERVER_DOMAIN = TURN_DOMAIN;
export const TURN_SERVER_USER = TURN_SERVER_USERNAME;
export const TURN_SERVER_PASS = TURN_SERVER_PASSWORD;

export const GOOGLE_MAPS_API_KEY = _GOOGLE_MAPS_API_KEY;

export const env = {
  type: 'dev', //prod staging dev
  appUrls: {
    dev: {
      apiUrl: 'http://192.168.29.117:4000',
    },
    staging: {
      apiUrl: 'https://back-sos.pritamaqua.aqualeafitsol.com',
    },
    prod: {
      apiUrl: 'https://back-sos.pritamaqua.aqualeafitsol.com',
    },
  },
  mediaUrls: {
    dev: {
      apiUrl: 'https://back-sos.pritamaqua.aqualeafitsol.com',
    },
    staging: {
      apiUrl: 'https://back-sos.pritamaqua.aqualeafitsol.com',
    },
    prod: {
      apiUrl: 'https://back-sos.pritamaqua.aqualeafitsol.com',
    },
  },
};
 