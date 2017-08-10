### v5.2.3 

- add to global on observe, and remove on unobserve
- update tape and remove from main deps

### v5.2.2

- updated to filter publisher in aggregate for name, as per expectation

### v5.2.1

- Added `module.exports = exports.default` for compatibility.

### v5.2.0

- When a logger is created, the publisher is added to `global.__dbrickashaw`.
- Added `getPublisherAggregate` to return `global.__dbrickashaw`.
- Updated to `babel@6.x`.
