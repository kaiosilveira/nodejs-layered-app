import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
export default class MongooseFactory {
  static async createConnection({
    libs: { mongoose: m },
    env: { DB_PROTOCOL, DB_HOST, DB_PORT, DB_NAME },
    logger,
  }) {
    const url = `${DB_PROTOCOL}://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
    const connection = mongoose.createConnection(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 3000,
      socketTimeoutMS: 8000,
    });

    const userSchema = new m.Schema({
      username: String,
      password: String,
      registeredAt: { type: Date, default: Date.now },
    });

    const todoSchema = new m.Schema({
      title: String,
      ownerId: { type: ObjectId, ref: 'user' },
      due: { type: Date },
    });

    connection.model('user', userSchema);
    connection.model('todo', todoSchema);

    logger.info({ message: 'Database connection created' });

    return connection;
  }
}
