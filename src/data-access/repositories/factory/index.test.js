import chai from 'chai';
import noop from 'lodash/noop.js';
import UsersRepository from '../user/index.js';
import RepositoryFactory from './index.js';

chai.should();

describe('RepositoryFactory', () => {
  it('should instantiate an usersRepository', () => {
    const config = {
      applicationLayer: { services: {} },
      dataAccessLayer: { repositories: {} },
      dbConn: { model: noop },
      logger: { child: noop },
    };

    const result = RepositoryFactory[UsersRepository.$tag](config);
    result.should.be.instanceOf(UsersRepository);
  });
});
