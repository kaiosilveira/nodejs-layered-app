export default ({ expressRouterInstance: router, controller }) => {
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  return router;
};
