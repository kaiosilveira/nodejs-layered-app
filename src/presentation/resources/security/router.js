export default ({ router, controller }) => {
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  return router;
};
