[![CI](https://github.com/kaiosilveira/nodejs-layered-app/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/nodejs-layered-app/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/kaiosilveira/nodejs-layered-app/branch/main/graph/badge.svg?token=DZ5UX1Y0P5)](https://codecov.io/gh/kaiosilveira/nodejs-layered-app)

# NodeJS Layered App

This repository is a working example of a layered API application implemented in NodeJS, my focus here is to demonstrate the advantages and disadvantages of this approach, walking the reader through each layer and explaining the rationale behind each design decision.
The project itself is a todo-list app, but it was built to be production-ready and with scalability in mind. The goal is to make it as closer to a real application as possible.

## Project structure

The project is structured in the following way:

```mermaid
flowchart TD
    A[Presentation] --- B
    A --- D
    B[Application] --- C
    B --- D
    C[Data Access] --- D
    D[Domain]
```

Each layer depends on one or more layers below it, but never on a layer above it.
As you can guess, dependency management between layers is a crucial point to keep the implementation clean, that is why a [dependency injection](#dependency-injection) strategy was implemented, allowing parts of each layer to explicitly tell what dependencies it has. These dependencies are resolved in the bootstrap phase of the application.

You can find detailed documentation for each of these layers here:

- [Presentation](src/presentation/README.md)
- [Application](src/application/README.md)
- [Data Access](src/data-access/README.md)
- [Domain](src/domain/README.md)

## High level overview

The idea behind a layered application is to have multiple logical building blocks, each of them with a set of responsibilities that allows the other ones to function properly. For instance, the goal of the presentation layer is to be the first point of contact for the callers of the API, rejecting unauthorized or malformed requests quickly and effectively, whilst the goal of the application layer is to hold critical application logic to keep the whole application consistent.

## Testing strategy

There are three types of tests in this application, each of them described and detailed below:

- Unit tests: cover the functionality of a class or function in isolation, mocking and stubbing its dependencies when needed
- Acceptance tests: make sure the entire application is working, from the entry points (express route definitions) all the way down to the database communication (stubbed using an in-memory database to make tests faster and more independent of database state)

## Global application config

As the application relies heavily on passing dependencies to classes and functions to isolate as much as possible the utilisation of external resources, thus keeping the unit tests simple and enabling a high level of test coverage, a global shared config needs to be passed in to the main `ExpressAppFactory` at bootstrap time. This config should contain environment information and the external libraries needed by the downstream components, in the various layers. This configuration is passed forward in a "self-service" way, where each layer extracts what it needs to make their classes and functions work.

## Dependency injection

In order to keep the instantiation of resources as clean as possible and to avoid repetitive work instantiating numerous dependencies for each layer, a dependency injection system was put in place. This system works by defining an `$inject` field on the class that wants to have dependencies injected automatically and defining a `$tag` field on each class that is eligible for injection. To give an example, imagine that we have a controller at the presentation layer called `MyController`. This controller needs a service called `MyService` to work. We can make this dependency explicit by passing `MyService`'s tag to the correct place in the `MyController` dependency structure, like this:

```javascript
// application layer
class MyService {}
MyService.$tag = 'myService';

// presentation layer
class MyController {}

MyController.$inject = { applicationLayer: { services: { myService: MyService.$tag } } };
```

Then, to instantiate `MyController`, we could simply call an utility function called `instantiated`, that will resolve all dependencies and return a working instance of `MyController`:

```javascript
export default config => {
  return {
    path: 'myResource',
    router: createRouter({
      expressRouterInstance: config.libs.express.Router(),
      controller: instantiated(MyController, config),
    }),
  };
};
```

The `instantiated` function rely on a static factory that knows how to build a `MyController` and also knows how to delegate the instantiation of resources from other layers to their corresponding static factories. By design, each layer will contain a factory that knows how to build the whole layer. In cases where there are multiple groups of classes in a layer, the static layer factory can delegate to subfactories within the same layer, e.g., in the application layer there is `ApplicationLayerFactory`, which delegates the instantiation of the application services to `ApplicationServiceFactory`.
