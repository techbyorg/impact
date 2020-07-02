import SharedModel from 'frontend-shared/models/index'

import Block from './block'
import Dashboard from './dashboard'
import Experiment from './experiment'

export default class Model extends SharedModel {
  constructor () {
    super(...arguments)
    this.block = new Block({ auth: this.auth })
    this.dashboard = new Dashboard({ auth: this.auth })
    this.experiment = new Experiment({ cookie: this.cookie })
  }
}
