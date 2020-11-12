import SharedModel from 'frontend-shared/models/index'

import Block from './block'
import Dashboard from './dashboard'
import Experiment from './experiment'
import Metric from './metric'
import Partner from './partner'
import Role from './role'
import Segment from './segment'

export default class Model extends SharedModel {
  constructor () {
    super(...arguments)
    this.block = new Block({ auth: this.auth })
    this.dashboard = new Dashboard({ auth: this.auth })
    this.experiment = new Experiment({ cookie: this.cookie })
    this.metric = new Metric({ auth: this.auth })
    this.partner = new Partner({ auth: this.auth })
    this.role = new Role({ auth: this.auth })
    this.segment = new Segment({ auth: this.auth })
  }
}
