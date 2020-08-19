import SharedModel from 'frontend-shared/models/index'

import Block from './block'
import Dashboard from './dashboard'
import Experiment from './experiment'
import Partner from './partner'
import Segment from './segment'

export default class Model extends SharedModel {
  constructor () {
    super(...arguments)
    this.block = new Block({ auth: this.auth })
    this.dashboard = new Dashboard({ auth: this.auth })
    this.experiment = new Experiment({ cookie: this.cookie })
    this.partner = new Partner({ auth: this.auth })
    this.segment = new Segment({ auth: this.auth })
  }
}
