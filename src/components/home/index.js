import { z } from 'zorium'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $home () {
  return z('.z-home', 'base')
}
