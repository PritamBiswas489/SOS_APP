import { GOOGLE_MAPS_API_KEY as _GOOGLE_MAPS_API_KEY } from '@env';

export const GOOGLE_MAPS_API_KEY = _GOOGLE_MAPS_API_KEY;

export const env = {
  type: 'prod', //prod staging dev
  appUrls: {
    dev: {
      apiUrl: 'https://99bpkvn6-4000.inc1.devtunnels.ms',
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
 