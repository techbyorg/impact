- webhook
  - https://app.upchieve.org/api/impact-metrics
    - { metrics: [{id, value, scaledTime, timeBucket}] }
  - fetch new data hourly/daily? or v1 just loads directly from
    - if directly from, cache for an hour (like mongo charts does)


- alternatively (maybe v2?): api for tracking data, stored in our db. backfill with their current data
  - think this is ideal long-term

- some graphs only visible to certain people?

- input-date-range imports some css that gets put in 2.bundle.css (no hash for cache). add hash
