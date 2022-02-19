export default class Logger {
  error(obj) {
    console.log(JSON.stringify(obj));
  }

  info(obj) {
    console.log(JSON.stringify(obj));
  }

  warn(obj) {
    console.log(JSON.stringify(obj));
  }
}
