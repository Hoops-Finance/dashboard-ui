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

## v0.3.2

Auth Integration, Swap and Portfolio templates, UserProfile, Bugfixes. by @silence48 in #41

## v0.3.3

bump to v0.3.3
Fix profile view.

## V0.3.4

fix: #12 mobile view does not display profile menu by @iverlandth in #32
Bugfix/mix desktop changes by @iverlandth in #31
Merge staging to main by @silence48 in #43
feature/update-profile-data-and-show-linked-accounts by @iverlandth in #33
Resolve Merge Conflicts for Profile by @silence48 in #44
Merge pull request #44 from Hoops-Finance/staging by @silence48 in #45
Release 0.3.4 by @silence48 in #46

## v0.4.0
Opengraph Image Generation, Incremental Static Regeneration (ISR), and nextjs Canary:

Implemented ISR for tokens and pools, with both a first and a second pass.
Updated tokens to use dynamic metadata during regeneration.
Build & Performance Improvements:

Updated source maps during build for SSR.
Improved bundle size and fixed bundling issues.
Introduced local caching for route generation.
Added candle (price quotes) and token info generation to speed up builds.
Integrated build logging by updating gitignore and package-lock.
UI & UX Fixes:

Removed theme context and pre-rendered more components to address flickering during hydration.
Fixed Navbar flickering and mobile navigation issues.
Code Quality & Tooling:

Applied prettier for consistent code formatting.
Resolved ESLint and type checking issues (including for user profiles and linked accounts).
Updated Tailwind configuration and added an ESLint configuration file for Next.js.

adds partial prerendering (PPR) features from nextjs to allow for faster page loads and a better user experience.

Dependency & Configuration Updates:

Upgraded Next.js to version 15.2.1 canary.
Upgraded React to version 19.
Updated Next.js configuration accordingly.
Opengraph & Social Sharing Features:

Added opengraph image generation.
Implemented metadata generation and social media sharing features.
Miscellaneous:

Fixed minor issues such as the misspelling of "lastUpdated".
Added server functions for fetching user profiles.
These changes collectively enhance performance, streamline the build process, and improve both the user experience and code quality.