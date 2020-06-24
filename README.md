#

## Manifesto
---

### Getting Started
`npm install`
`npm run dev`


### Commands
##### `npm run dev` - Starts the server, watching files

More to come soonish

- all BehaviorSubject / Observable named ____Stream (eg valueStream)
  - if it's something that can be either stream or String/Bool/Number (useStream doesn't care), call it ____Streamy
- all ReplaySubjects named ____Streams (eg valueStreams)
- $$ and `ref` in name for dom refs (typically $$ref)
  - $$ without ref in name refers to an actual dom element (not {current: $$el})
- order
  - props
  - useRef
  - useMemo for all observable instantiation / state prep
  - useEffect
    - be explicity about return for beforeUnmount, or use beforeUnmount fn
    - always include return, even if no fn (return null)
  - useStream for state
  - usecallback functions
  - normal functions?
  - z

In general don't use wildcard imports, but for lodash and RxJS do (tree shaking means it's the same as explicit imports, and naming / collisions (map, filter, etc...) of the two would be annoying)

Use [] for hyperscript children, unless it's single item on same line (eg `z('.title', 'title text')`)

### Cleanup
Occassionally run node /usr/lib/node_modules/coffee-unused/index.js --src ./src and clean up unused vars

More for just clean code vs reduced bundle size. As of 1/19 have only done for src/models and it only saved ~120b gzipped
