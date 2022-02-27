export default class DateTimeUtils {
  static nextHour() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
  }
}
