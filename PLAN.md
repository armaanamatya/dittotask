# Berkeley Activity Map MVP

## Summary
Replace the current `/dashboard` with a desktop-first 50/50 split layout: an interactive Berkeley map on the left and a user-perspective text/feed interface on the right. Demo users will be seeded with Berkeley locations and activity preferences; when the selected user posts something like “going for a run. anyone care to join?”, the app will pin that post at the poster’s Berkeley location, highlight nearby users who are likely interested, and expose an admin-only matching panel on the same screen. Admin matching will create a real Ditto `Match` plus a generated `MicroQuestSession` so the prototype still feeds the existing system.

## Key Changes
### Data model and seed data
- Extend `User` with Berkeley map fields: `locationLabel`, `latitude`, `longitude`, and `activityTags` as a simple comma-delimited string.
- Add a new `ActivityPost` model with: author, free-text body, derived `activityType`, pinned lat/lng, location label, status (`active`, `matched`, `expired`), timestamps, and optional `matchedUserId`.
- Add an optional relation from `MicroQuestSession` to `ActivityPost` so a generated session can carry the original activity text/location into the existing Ditto flow without replacing the quest-template system.
- Seed all demo users with Berkeley-specific coordinates and activity tags.
- Seed a small set of live activity posts so the map/feed is populated on first load.
- Seed one reusable quest template for admin-created spontaneous invites, and continue keeping at least one completed historical session so `/insights` still has data.

### Matching and candidate logic
- Introduce a server-side activity classifier that maps post text to a coarse activity type via keyword heuristics: `run`, `walk`, `coffee`, `food`, `study`, `art`, fallback `hangout`.
- Compute “down for this” candidates dynamically, not as a persisted table.
- Candidate rule for MVP: user is within a 1.5 mile Berkeley radius of the post pin, shares the derived activity tag, is not the author, and is not already in an open pending match.
- Sort candidates by distance, then by tag match quality.
- When admin matches a post:
  - create a real 1:1 `Match` in `pending-quest` state,
  - create a `MicroQuestSession` using the spontaneous-invite template and link it to the source `ActivityPost`,
  - mark the post `matched`,
  - set `matchedUserId`,
  - expire any other active posts authored by either newly matched user to avoid double-booking in the prototype.

### Dashboard UX and layout
- Replace the current dashboard body with a two-column layout on desktop:
  - left column: sticky Berkeley map, constrained to the Berkeley area, showing all user markers plus active activity-post markers,
  - right column: scrollable feed interface.
- On mobile, stack map above feed rather than forcing a cramped split.
- Keep the existing nav and selected-user dropdown; the selected user remains the posting identity.
- Right panel structure:
  - current selected user card with existing profile details already populated,
  - message composer attributed to that user,
  - live feed of recent active posts,
  - admin matching section for the currently selected post.
- Posting flow:
  - user types free text and submits,
  - server derives `activityType`,
  - post is pinned at the poster’s seeded Berkeley coordinates,
  - the new post becomes selected automatically,
  - the map recenters and highlights nearby candidate users.
- Map behavior:
  - default state shows all users and active posts,
  - selecting a post from the feed highlights its pin and candidate users,
  - non-candidate users remain visible but visually muted,
  - matched or expired posts use distinct marker styling.

### APIs, payloads, and UI types
- Change the dashboard payload to return a Berkeley-prototype shape: `currentUser`, `usersOnMap`, `activePosts`, and `selected/open matches` summary as needed for status badges.
- Add `POST /api/activity-posts` to create a new activity post for the selected user.
- Add `POST /api/activity-posts/[postId]/match` for admin matching with `matchedUserId`.
- Include computed candidate arrays in the dashboard fetch or per-post payload so the UI can render “nearby and down” users without extra client-side distance logic.
- Extend the shared frontend types to cover `MapUser`, `ActivityPost`, `ActivityCandidate`, and the new dashboard response.
- Update the existing dashboard session serialization so linked activity-post text/location can appear anywhere the generated session is later reused.

## Test Plan
- Dashboard loads with a Berkeley-centered map, all seeded user markers, and seeded active posts.
- Selecting different demo users from the nav changes the posting identity but keeps the same shared Berkeley activity feed.
- Creating a post from the right-side composer adds it to the feed, pins it on the map at the poster’s coordinates, and auto-selects it.
- A “run” post surfaces only nearby users whose tags include running-related interests and excludes distant or unavailable users.
- Admin matching a selected post creates exactly one new `Match` and one linked `MicroQuestSession`, marks the post matched, and removes the matched participants from further candidate lists.
- Admin cannot create a duplicate pending match for the same pair.
- Users already in an active pending match are excluded from future candidate results.
- Map/feed state remains stable after refresh because posts and statuses are persisted.
- `/insights` still loads and uses historical completed sessions without depending on the new prototype data path.

## Assumptions
- Berkeley location is seeded and static for the MVP; there is no live browser geolocation.
- The post pin comes from the poster’s seeded location, not from map selection or NLP place extraction.
- The MVP uses `leaflet` plus `react-leaflet` with OpenStreetMap-style tiles for the real map.
- “Down for this” is simulated automatically from seeded tags plus proximity; no manual opt-in flow is required from other demo users.
- The same screen intentionally mixes user posting and an explicitly labeled admin-only matching panel because this is a prototype.
- Multiple live posts can exist at once, but a successful admin match closes out conflicting active posts for the matched users.
