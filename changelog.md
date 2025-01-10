# Changelog

## v0.3.0

- **New Site**
  - Nextjs 15
  - React 19
  - eslint 9
  - too many changes to list here.

## v0.3.1

- fixed linting issues.
- **api routes**
  - **api/auth/oauth/exchange.ts:**
    - Changed the AuthResult interface so id is typed as a string instead of ObjectId.
    - Cast the response to AuthResult and used optional chaining on data.email to avoid unsafe calls.
  - **oauth/link/route.ts:**
    - Introduced a OauthLinkResponse interface and cast res.json() to that interface.
  - **oauth/login/route.ts:**
    - Created RawOAuthLoginResponse to safely type-cast the JSON response from the server, then mapped it to OAuthLoginSuccessResponse.
  - **oauth/delink/route.ts:**
    - Added a DelinkResponse interface and cast the JSON accordingly.
  - **login/route.ts:**
    - Defined a SignInResult interface, cast the result of signIn to avoid unsafe assignment.
  - **api/data/route.ts**
    - Explicitly typed the result of Promise.all() as [Response, Response, Response], preventing TypeScript from inferring the array elements as any.
    - Cast the .json() calls to MarketApiResponseObject[], PairApiResponseObject[], and TokenApiResponseObject[] respectively, removing the “unsafe assignment” warnings by giving the data a concrete type.
  - **api/candles/[token0]/route.tsx**
    - Added an `ErrorResponse` interface and casted `response.json()` to `ErrorResponse` for error handling.
    - Casted successful JSON response to `CandleDataRaw[]` for strict typing.

  - **api/candles/[token0]/[token1]/route.tsx**
    - Added an `ErrorResponse` interface for uniform error responses.
    - Casted successful JSON response to `CandleDataRaw[]` to remove unsafe assignments.

  - **/utils/fetchCandles.ts**
    - Defined `ErrorResponse` and `RawCandleRecord` interfaces to strictly type the JSON responses.
    - Casted `response.json()` to these interfaces in both `fetchMarketCandles` and `fetchTokenCandles`.

  - **/utils/testApi.ts**
    - Created a `TestCandleData` interface to type the JSON response used in testing.
    - Casted the fetched data to `TestCandleData[]` and used a void operator for the async function call to satisfy lint rules.
  - **Various Files**
    - Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`)
    - `ElementRef` is deprecated. Use `ComponentRef<T>` instead
    - fixed all async void calls inside syncronous functions and similar issues that resulted in the errors:
      - Promise-returning function provided to property where a void return was expected
      - Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
  - fixed all unnecessary conditionals such as:
    - Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises
  - fixed small issues with auth flow, still probably more need resolved.
  - added recaptcha token verifier utility.
