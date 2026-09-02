import "@testing-library/jest-dom";
// jest-environment-jsdom's global scope lacks the Web Fetch API (unlike
// plain Node 18+, which exposes fetch/Response/Request/Headers as globals)
// — polyfill via whatwg-fetch so lib/api/http.ts's `Response`/`fetch` usage
// works under jsdom the same as it does in the browser.
import "whatwg-fetch";
