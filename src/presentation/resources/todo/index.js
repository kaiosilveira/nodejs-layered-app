import { instantiated } from '../../factory/index.js';
import TodoController from './controller/index.js';
import createRouter from './router.js';

export default config => {
  return {
    path: 'todos',
    router: createRouter({
      expressRouterInstance: config.libs.express.Router(),
      controller: instantiated(TodoController, config),
    }),
  };
};
