# Domain layer

THe domain layer is responsible for holding sensitive rules, aiming for the consistency and preservation of the whole application. It has a structure focused on protecting the quality of the data being transfered in and out of the system, as well as helping the application layer to keep the whole structure consistent.
At the domain layer we have entities defined, sometimes alongside its builders and factories, as needed. The lifecycle of an entity in the system will depend on the nature of the request, e.g., if it's a query request (using the jargon of CQRS), then it will:

- Be created at the Data Access Layer, after the data is retrieved by the repository
- Be returned as the payload to the application layer
- Be cross-validated against another resources (when applicable)
- Be asked to create a JSON representation of itself and
- Be returned to the presentation layer as a JSON object

whereas when it's a command, it will:

- Be created at the Application Layer by a service, after some data validation
- Be passed down to the Data Access Layer, specifically to one or more repositories
- Be persisted to the database by one or more repositories
- Be returned as a new, updated instance to the application layer (when applicable)

One may ask why this whole overhead handling class lifecycle instead of using POJO's (Plain Old Javascript Objects). This is
needed as we want to keep business rules for each resource in a centralized, clear place, instead of having it spread across the data access, application and even presentation layer sometimes.
