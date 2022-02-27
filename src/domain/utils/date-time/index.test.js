import DateTimeUtils from './index.js';

describe('DateTimeUtils', () => {
  describe('nextHour', () => {
    it('should return the date object representing the next hour', () => {
      const now = new Date();
      const nextHour = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() + 1
      );

      const result = DateTimeUtils.nextHour();
      result.should.be.eql(nextHour);
    });
  });
});
