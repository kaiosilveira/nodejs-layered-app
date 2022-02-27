export default ({ expressRouterInstance: router, controller }) => {
  router.post('/', controller.add);
  return router;
};
