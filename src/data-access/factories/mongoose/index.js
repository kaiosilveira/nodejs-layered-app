export default class MongooseFactory {
  static async createConnection({
    libs: { mongoose },
    env: { DB_PROTOCOL, DB_HOST, DB_PORT, DB_NAME },
    logger,
  }) {
    const url = `${DB_PROTOCOL}://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    const connection = await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 3000,
      socketTimeoutMS: 8000,
    });
    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      registeredAt: { type: Date, default: Date.now },
    });

    connection.model('user', userSchema);

    logger.info({ message: 'Connection created' });

    process.on('SIGINT', () => {
      logger.info('Closing database connection');
      mongoose.disconnect();
      logger.info('Database connection closed');
      process.exit(0);
    });

    return connection;
  }
}
