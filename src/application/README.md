# Application layer

The application layer is responsible to hold the business logic, handling top-level requests from the presentation layer, interpreting these requests and transforming them into a concrete response. This is accomplished by implementing `services`, each service is supposed to hold logic for a specific resource (e.g.: the `security` resource relies heavily on the `SecurityService` for most part of its operations at the Presentation level).

## Structure

The application layer structure is as follows:

```bash
├── README.md
├── enumerators
│   └── ...enumerator files
├── errors
│   └── index.js
├── factory
│   ├── index.js
│   └── index.test.js
└── services
    ├── security
    │   ├── index.js
    │   └── index.test.js
    ├── ...other services
```

In the `/factory` directory we hold all the logic to build concrete application services, this factory is used by the dependency injection system at boostraping time.
Inside the `/services` we have a subdirectory for each resource (security, user, etc). Each subdirectory contain its implementation inside the `index.js` file, as a class, and its tests resides in `index.test.js`.