import SecurityController from './controller/index.js';
import createRouter from './router.js';

export default config => {
  return {
    path: 'security',
    router: createRouter({
      router: config.libs.express.Router(),
      controller: new SecurityController(config),
    }),
  };
};
