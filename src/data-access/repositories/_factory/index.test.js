import chai from 'chai';
import spies from 'chai-spies';
import noop from 'lodash/noop.js';

import RepositoryFactory from './index.js';
import UsersRepository from '../user/index.js';
import TodoRepository from '../todo/index.js';

chai.use(spies);
chai.should();

describe('RepositoryFactory', () => {
  let dbConn, logger, config;
  beforeEach(() => {
    dbConn = chai.spy.interface({ model: noop });
    logger = chai.spy.interface({ child: noop });
    config = {
      applicationLayer: { services: {} },
      dataAccessLayer: { repositories: {} },
      logger,
      dbConn,
    };
  });

  it('should instantiate an usersRepository', () => {
    const result = RepositoryFactory[UsersRepository.$tag](config);
    result.should.be.instanceOf(UsersRepository);
    dbConn.model.should.have.been.called.once();
    dbConn.model.should.have.been.called.with('user');
    logger.child.should.have.been.called.once();
    logger.child.should.have.been.called.with({ object: UsersRepository.$tag });
  });

  it('should instantiate a todoRepository', () => {
    const result = RepositoryFactory[TodoRepository.$tag](config);
    result.should.be.instanceOf(TodoRepository);
    dbConn.model.should.have.been.called.once();
    dbConn.model.should.have.been.called.with('todo');
    logger.child.should.have.been.called.once();
    logger.child.should.have.been.called.with({ object: TodoRepository.$tag });
  });
});
