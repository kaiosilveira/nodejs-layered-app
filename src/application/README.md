# Application layer

The application layer is responsible to hold the business logic, handling top-level requests from the presentation layer, interpreting these requests and transforming them into a concrete response. This is accomplished by implementing `services`, each service is supposed to hold logic for a specific resource (e.g.: the `security` resource relies heavily on the `SecurityService` for most part of its operations at the Presentation level).
