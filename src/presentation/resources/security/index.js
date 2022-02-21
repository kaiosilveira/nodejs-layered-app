import { instantiated } from '../../factory/index.js';
import SecurityController from './controller/index.js';
import createRouter from './router.js';

export default config => {
  return {
    path: 'security',
    router: createRouter({
      expressRouterInstance: config.libs.express.Router(),
      controller: instantiated(SecurityController, config),
    }),
  };
};
