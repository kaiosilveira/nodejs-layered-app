export default ({ expressRouterInstance: router, controller, middleware }) => {
  const { authenticationMiddleware } = middleware;
  router.post('/', authenticationMiddleware.hook, controller.add);
  return router;
};
