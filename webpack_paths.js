
import path from 'path'

export default {
  root: path.join(__dirname, './src/root.js'),
  sw: path.join(__dirname, './src/service_worker/index.js'),
  static: path.join(__dirname, './src/static'),
  build: path.join(__dirname, './build'),
  dist: path.join(__dirname, './dist'),
  js: [path.join(__dirname, './*.js'), path.join(__dirname, './src/**/*.js')]
}
