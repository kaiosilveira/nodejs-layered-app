[![CI](https://github.com/kaiosilveira/nodejs-layered-app/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/nodejs-layered-app/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/kaiosilveira/nodejs-layered-app/branch/main/graph/badge.svg?token=DZ5UX1Y0P5)](https://codecov.io/gh/kaiosilveira/nodejs-layered-app)

# NodeJS Layered App

This repository is a working example of a layered API application implemented in NodeJS, its focus is to demonstrate the advantages and disadvantages of this approach, walking the reader through each layer and explaining the rationale behind each design decision.
The project itself is a todo-list app, but it was built to be production-ready and with scalability in mind. The goal is to make it as closer to a real application as possible.
Note: The structure implemented and explained here is by no means a framework. Feel free to use it as a starting point and make any changes needed to make it work for you.

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

## Directory structure

```bash
├── domain
├── data-access
├── application
├── presentation
├── app.js
└── app.test.js
```

## Testing strategy

There are two types of tests in this application, each of them described and detailed below:

- Unit tests: cover the functionality of a class or function in isolation, mocking and stubbing its dependencies when needed
- Acceptance tests: make sure the entire application is working, from the entry points (express route definitions) all the way down to the database communication (stubbed using an in-memory database to make tests faster and more independent of database state)

## Environment

Currently, the following environment variables are needed:

```
PORT=<app_port>
ENCRYPTION_KEY='<ENCRYPTION_KEY>'
JWT_SIGNING_KEY='<JWT_SIGNING_KEY>'
DB_HOST='<localhost>'
DB_NAME='<db_name>'
DB_PROTOCOL='<db_protocol>'
DB_PORT=<db_port>
```

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

## Virtualization and containerization

This app uses docker to create a container of the application. This container should receive at creation time the environment variables needed by the application in order for it to work properly.

## Twelve-factor app compliant

This application is compliant with the ["twelve-factor app"](https://12factor.net/) definitions. Each topic is covered and explained below:

**I. Codebase — One codebase tracked in revision control, many deploys**

This app is tracked in version control using git + GitHub

**II. Dependencies — Explicitly declare and isolate dependencies**

We're using `package.json` for dependency declaration and `yarn` as the package manager for dependency isolation. Furthermore, we're isolating dependencies at application level through the top-level global config. [See Global application config](#global-application-config)

**III. Config — Store config in the environment**

All environment variables are external from the application and are mapped at bootstrapping time to a global `env` variable, shared across the whole app. This separation makes it easy for deploying across environments, allowing for continuous integration and delivery

**IV. Backing services — Treat backing services as attached resources**

The application structure allows for treating all backing services as attached resources in a way that all configuration for accessing those resources are abstracted away from code (through environment variables, as for the previous topic above) and the code itself contains specific classes to abstract the communication with the external resources and providing an uniform way of using these resources from inside the app. Should we need to change a connection, we just have to change the environment variables and perform a new deploy. Should we need to add a new database (let's say, a memory database), we can do this the same way, creating a class to abstract the connection, one for communication, and then providing it to the whole app. Currently, for the mongo database we're using, there's a `dbConn` variable configured to hold the long-living connection to MongoDB, this connection is provided to all internal resources.

**V. Build, release, run — Strictly separate build and run stages**

The deploy pipeline was left out of this example as its not intended to be deployed to any environment and servunite only as a reference. Production versions based on this example's structure were implemented using GitHub Actions + AWS ECS (Elastic Container Service) to provide Continous Delivery. The stages of the pipeline were the following:

- creating a docker image of the application, bounded to its external configuration (though env vars)
- pushing the image to the AWS ECR (Elastic Container Registry)
- fetching the AWS ECS' task definition
- updating the task definition to point to the new container image created in the steps above
- pushing this task definition back to ECS
- updating the service running the task definition to switch to the new version

The rollback strategy would be simply changing the task definition back to the previous version

**VI. Processes — Execute the app as one or more stateless processes**

This application and its corresponding production implementations does not rely on any long-lived, in-memory information. All backing services are external to the process, making it stateless, replicable and clusterable. Should we need any in-memory information, this should also be external and served as an attached resource (a Redis database hosted in AWS Elasticache, for instance).

**VII. Port binding — Export services via port binding**

Port binding is done at build (for non-dev) time via the Dockerfile, which exposes a port for the app to listen to. This port is passed in as an env var to the app.

**VIII. Concurrency — Scale out via the process model**

From a high level point of view and considering that we want to use the deployment strategy described at "Build, release, run", we can consider the task running inside AWS ECS as our "process". This process is in fact a Docker process running our container inside a EC2 instance. Process monitoring is done by AWS ecs-agent and should one process fail, it would spin up a new one quickly.

**IX. Disposability — Maximize robustness with fast startup and graceful shutdown**

Considering the previous topics above around deployment strategy, startup should be as fast as starting a new task at ECS. Shutdown is ready to destroy, detach and disconnect resources using the `die` function defined at the root file.

**X. Dev/prod parity — Keep development, staging, and production as similar as possible**

Production implementations of this app had their environments similar to product as per-design / per-deploy stategy, as we were deploying to ECS, we were exercising the (single) deploy script in every deploy (as the Continous Delivery book strongly recommends). We strongly recommend to do the same to avoid unexpected and subtle differences between environments.

**XI. Logs — Treat logs as event streams**

We're using `winston` as our logging tool. Currently it's set up to use a simple `Console` transport, that basically print's to `stdout`. Production versions of this app usually uses the option to write the output to Cloudwatch when configuring the task definition in AWS. The well-structured format that `winston` provides allows for easy aggregation / querying (using Cloudwatch Insights) of the outputs. Alternativelly, some versions of this app structure are implementing a custom `CloudwatchTransport` and attaching it to `winston`, so the logs are written to Cloudwatch without relying on the changes in the task definition (although this could be considered a violation of this factor altogether, as the app would be aware of the logging strategy).

**XII. Admin processes — Run admin/management tasks as one-off processes**

This example application has no registered tasks at the moment, but should it need it, we could probably keep them all under a `/tasks` directory, then we could load the files needed to perform the task at hand aand run it via the `scripts` section in the `package.json` file.
