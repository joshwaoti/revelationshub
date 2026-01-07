/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as brandKits from "../brandKits.js";
import type * as clips from "../clips.js";
import type * as generatedContent from "../generatedContent.js";
import type * as members from "../members.js";
import type * as organizations from "../organizations.js";
import type * as sermons from "../sermons.js";
import type * as subscriptions from "../subscriptions.js";
import type * as transcripts from "../transcripts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  brandKits: typeof brandKits;
  clips: typeof clips;
  generatedContent: typeof generatedContent;
  members: typeof members;
  organizations: typeof organizations;
  sermons: typeof sermons;
  subscriptions: typeof subscriptions;
  transcripts: typeof transcripts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
