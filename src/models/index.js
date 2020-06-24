import SharedModel from 'frontend-shared/models/index'

import Experiment from './experiment'

export default class Model extends SharedModel {
  constructor () {
    super(...arguments)
    this.experiment = new Experiment({ cookie: this.cookie })
  }
}
