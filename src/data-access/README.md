# Data Access layer

The data access layer is responsible for abstracting all business related to the database, including the creation of connections, the calls to send commands and perform queries, the formatting of parameters and the mapping from database objects to domain objects.
It's implemented using the repository pattern, where each resource has it's repository and every repository has methods to perform specific operations related to that resource.
The database chosen for this example is MongoDB, that's why we have a model object being passed as constructor parameter to all repositories. Should we need a new database implementation, we could abstract this a little bit more and create a common interface on top of the implementation for each database and use it in the repositories. This works until a certain point, of course, as there are very different databases out there. Graph databases, for instance, would be tricky to abstract behind this structure.

## Structure

The data access layer has a `/factories` directory, where we currently hold the ConnectionFactory for a Mongoose connection. It also has a `/repositories` folder, where we hold all implemented repositories. Each repository has its directory name the same as the name of the resource it represents, and inside this repository there is a `index.js` with the implementation of the repository class, alongside a `index.test.js` file, with all of its tests. Also, there's a `/factory` directory inside the `/repositories`, this factory is the one responsible for building concrete repositories to make dependency injection easy.

```bash
└── repositories
    ├── factory
    │   ├── index.js
    │   └── index.test.js
    └── user
        ├── index.js
        └── index.test.js
```
