# Presentation layer

The presentation layer is the upmost layer in the application. It is responsible for implementing the express routes, handlers (in the form of controller classes) and all the middleware needed to provide a safe and effective communication with the callers. This layer has the following structure:

- [resources](#resources)

## Resources

Each resource represent a logical group inside the application. For instance, the `security` resource is responsible for handling the authentication and registration of users, while the `user` resource is responsbile for handling user data, updates, etc. Each resource is self-contained, i.e., it has everything it needs to work, including configured routes and the handlers. Each resource has the following structure:

- index.js
- router.js
- controller/
  - index.js
  - index.test.js

**controller**: This folder holds the express handler in the form of a controller and also its tests. Each controller has methods specifying how to handle a requests, forwarding these requests to the application layer as needed. Every controller method that should handle express requests must have two parameters: `req` and `res`, this is because handler functions are passed directly to the express router. Also, every handler method must be bound to the class in the constructor to preserve the context of `this` when being executed in the context of express.

**router.js**: This file is responsible for configuring the express sub-router for the resource. Here, HTTP verbs are bound to path strings, middleware and handler to form a route. A common implementation would look like this:

```javascript
export default ({ expressRouterInstance: router, controller }) => {
  router.post('/register', controller.register);
  router.post('/login', controller.login);
  return router;
};
```

**index.js**: This file exports a function that returns an object, this object specifies the resource path and the router to be used under that route. It's responsible for binding the controller to the router, allowing the requests to be correctly handled. A common implementation would look like this:

```javascript
export default config => {
  return {
    path: 'security',
    router: createRouter({
      expressRouterInstance: config.libs.express.Router(),
      controller: instantiated(SecurityController, config),
    }),
  };
};
```
