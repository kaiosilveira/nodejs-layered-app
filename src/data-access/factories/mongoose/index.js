export default class MongooseFactory {
  static async createConnection({
    libs: { mongoose: m },
    env: { DB_PROTOCOL, DB_HOST, DB_PORT, DB_NAME },
    schemas,
    logger,
  }) {
    try {
      const url = `${DB_PROTOCOL}://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
      const connection = m.createConnection(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 3000,
        socketTimeoutMS: 8000,
      });

      schemas.forEach(({ name, def }) => connection.model(name, new m.Schema(def)));
      logger.info({ message: 'Database connection created' });

      return connection;
    } catch (ex) {
      console.log(ex);
      throw ex;
    }
  }
}
