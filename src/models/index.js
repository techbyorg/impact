import SharedModel from 'frontend-shared/models/index'

import Experiment from './experiment'
import Metric from './metric'

export default class Model extends SharedModel {
  constructor () {
    super(...arguments)
    this.experiment = new Experiment({ cookie: this.cookie })
    this.metric = new Metric({ auth: this.auth })
  }
}
