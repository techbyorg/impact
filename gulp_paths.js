import path from 'path'

module.exports = {
  static: path.join(__dirname, './src/static/**/*'),
  js: [path.join(__dirname, './*.js'), path.join(__dirname, './src/**/*.js')],
  root: path.join(__dirname, './src/root.js'),
  sw: './src/service_worker/index.js',
  dist: path.join(__dirname, './dist'),
  build: path.join(__dirname, './build'),
  swBuild: path.join(__dirname, './build/service_worker.js'),
  babelConfig: path.join(__dirname, './babel.register.config.js'),
  manifest: [
    path.join(__dirname, './dist/**/*'),
    '!' + path.join(__dirname, './dist/**/*.map'),
    '!' + path.join(__dirname, './dist/robots.txt'),
    '!' + path.join(__dirname, './dist/stats.json'),
    '!' + path.join(__dirname, './dist/manifest.html')
  ]
}
