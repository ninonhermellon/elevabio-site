/**
 * Anti-clickjacking — secours si X-Frame-Options / frame-ancestors sont contournés.
 */
(function () {
  "use strict";
  if (self !== top) {
    top.location = self.location;
  }
})();
