- switch ssr to pure node instead of babel. waiting on rxjs and lodash to have better esm support
  - wait for https://www.npmjs.com/package/@esm-bundle/rxjs to support v7?
    - or https://github.com/ReactiveX/rxjs/issues/4416
  - lodash: https://github.com/lodash/lodash/issues/4800

- separate vendor and client bundles
  - vendor bundle less likely to get updated frequently
  - https://calendar.perfplanet.com/2019/bundling-javascript-for-performance-best-practices/
  - probably doesn't actually make that big of a difference since these are fetched from service worker anyways (except for iOS app)

- Use JSON.parse for large objs (10kb+) instead of JSON obj where possible
  - counter-intuitive, but faster https://www.youtube.com/watch?v=ff4fgQxPaO0
  - webpack does automatically for imported JSON, but our concat'd JSON for lang strings doesn't...

- Test using .publishReplay(1).refCount() in places where a mapped observable is subscribed to multiple times
- Unrelated to speed, need to swap localStorage with something else in native iOS app (gets cleared too often)
- Set user and entityUser in avatar header instead of as props
- https://github.com/IguMail/socketio-shared-webworker
- optimize FormattedMessage. markdown parser is slow (1-5ms per message)


- hopefully deferred resolvers will become a thing in apollo-server, then we can implement instead of manually doing multiple queries (though it's less of a perf gain, more about clean code)
  - https://github.com/apollographql/apollo-server/issues/2189
