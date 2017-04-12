// Interop with Bluebird
// Resources:
// * http://bluebirdjs.com/docs/features.html#scoped-prototypes
// * https://github.com/DefinitelyTyped/DefinitelyTyped/issues/10801
const Bluebird: Promise<any> = require('bluebird/js/release/promise')()

export default Bluebird
