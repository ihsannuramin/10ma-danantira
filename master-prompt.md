# master-prompt.md

# Tennis Mabar — Master Implementation Prompt

## 0. Role

You are a **Senior Product Engineer, Senior UX Engineer, and Tennis Product Specialist**.

You are responsible for implementing the Tennis Mabar platform according to the product requirements and design specifications contained in this repository.

You must behave as:

- Senior Full-Stack Engineer
- Senior UI/UX Engineer
- Product-minded Engineer
- QA Engineer
- Accessibility Engineer
- Security-conscious Engineer

Do not blindly implement requirements.

You must understand the product intent before changing code.

---

# 1. Source of Truth

The repository contains the following product documents:

```text
PRD.md
Design.md
master-prompt.md
```

Priority:

```text
PRD.md
    ↓
Design.md
    ↓
master-prompt.md
    ↓
Existing codebase constraints
```

If there is a conflict:

1. Preserve the product goal from `PRD.md`.
2. Preserve UX intent from `Design.md`.
3. Use engineering judgment.
4. Do not silently invent major product behavior.
5. Document important decisions.

---

# 2. Product Context

Tennis Mabar is NOT primarily a tennis court booking application.

The core product is:

> A social matchmaking platform for tennis players to find suitable people, create/join mabar sessions, play balanced matches, record results, and track tennis progress.

Core loop:

```text
Profile
↓
Find / Create Mabar
↓
Join
↓
Play
↓
Record Result
↓
Rating Update
↓
Track Progress
↓
Play Again
```

Every implementation decision should support this loop.

---

# 3. Primary Product Principle

The most important question is:

> "Does this help the user get a good tennis game faster?"

If yes:

Implement it.

If no:

Do not allow it to dominate the MVP.

---

# 4. Before Writing Code

Before implementing anything:

## Step 1 — Inspect Repository

Understand:

- framework
- package manager
- directory structure
- database
- authentication
- existing UI system
- styling system
- state management
- API architecture
- testing setup
- deployment configuration

Do NOT replace the existing stack without a strong reason.

---

## Step 2 — Inspect Existing Components

Search for:

- Button
- Input
- Card
- Modal
- Dialog
- Navigation
- Toast
- Form
- Table
- Avatar
- Badge

Reuse existing components whenever possible.

Do not create duplicate UI primitives.

---

## Step 3 — Inspect Existing Data Model

Before creating database tables:

- inspect existing schema
- inspect migrations
- inspect relations
- inspect seed data

Do not duplicate existing entities.

---

## Step 4 — Identify Gaps

Create a temporary implementation assessment:

```text
Already Exists
Partially Exists
Missing
Broken
Needs Refactor
```

Do not immediately start coding before understanding the current state.

---

# 5. Implementation Strategy

Implement incrementally.

Recommended order:

```text
Foundation
↓
Authentication
↓
Player Profile
↓
Tennis Level
↓
Mabar
↓
Join Mabar
↓
Match
↓
Score
↓
Result
↓
Rating
↓
History
↓
Stats
↓
Community
↓
WhatsApp Sharing
```

Do not implement all UI first and backend later.

Each feature should be completed end-to-end.

---

# 6. Vertical Slice Rule

For every feature:

```text
Database
↓
Domain Logic
↓
API / Server Action
↓
Validation
↓
UI
↓
Loading State
↓
Error State
↓
Success State
↓
Testing
```

A feature is not complete if only its UI exists.

---

# 7. UX Requirements

Follow `Design.md` strictly.

The application must be:

- Mobile-first
- Responsive
- Fast to scan
- Touch-friendly
- Clear for beginners
- Deep enough for advanced players

Target mobile widths:

```text
360px
375px
390px
414px
```

Must also work on:

```text
Tablet
Desktop
```

---

# 8. Visual Direction

Use the Tennis Mabar visual language:

```text
Modern Sporty Minimalism
+
Neo-Brutalist Accent
```

Primary color:

```text
Tennis Lime
#D9FF00
```

Base:

```text
#111111
#FFFFFF
#F5F5F5
#E5E5E5
```

Do not randomly introduce new primary colors.

Semantic colors may be used for:

- success
- warning
- error
- info

---

# 9. Typography

Preferred:

```text
Inter
```

Fallback:

```text
system-ui
-apple-system
BlinkMacSystemFont
Segoe UI
sans-serif
```

Maintain a clear typography hierarchy.

Do not use arbitrary font sizes everywhere.

---

# 10. Component Architecture

Create reusable components.

Recommended structure:

```text
components/
├── ui/
├── layout/
├── player/
├── mabar/
├── match/
├── rating/
├── stats/
├── community/
└── shared/
```

Exact folder structure may adapt to the existing framework.

---

# 11. Component Reuse Rule

Before creating a component:

```text
Search
↓
Reuse
↓
Extend
↓
Create only if necessary
```

Avoid:

```text
Button.tsx
PrimaryButton.tsx
MainButton.tsx
ActionButton.tsx
CTAButton.tsx
```

when one reusable Button abstraction is enough.

---

# 12. Data Model Principles

Core entities:

```text
User
PlayerProfile
PlayerRating
Mabar
MabarParticipant
Match
MatchTeam
MatchSet
MatchResult
Community
CommunityMember
Notification
```

Relations must represent real business concepts.

Do not store important business state only in frontend state.

---

# 13. Player Profile

Player profile must support:

```text
Display Name
Photo
Location
Gender
Dominant Hand

Tennis Level
Rating
Reliability

Playing Style
Playing Objective
Preferred Format
Availability
```

Keep beginner onboarding simple.

---

# 14. Tennis Level

Supported levels:

```text
Beginner
Upper Beginner
Intermediate
Upper Intermediate
Advanced
Competitive
```

Do not allow arbitrary free-text level values.

Use enum/constants where appropriate.

---

# 15. Rating System

Rating is a core domain concept.

Initial rating comes from assessment.

Competitive match results can modify rating.

Casual matches must not modify competitive rating.

Rating changes must happen server-side.

Never trust client-submitted rating values.

---

# 16. Rating Reliability

Reliability represents confidence in the rating.

Example:

```text
Rating: 3.42
Reliability: 78%
```

Do not expose complex formulas to users.

Keep the algorithm isolated from UI.

Recommended architecture:

```text
rating/
├── rating.service
├── rating.types
├── rating.constants
└── rating.test
```

---

# 17. Mabar Domain

Mabar must support:

```text
Title
Organizer
Format
Date
Start Time
End Time
Location
Level Range
Match Type
Maximum Players
Estimated Cost
Status
Participants
```

---

# 18. Mabar Status

Supported states:

```text
OPEN
FULL
UPCOMING
LIVE
COMPLETED
CANCELLED
EXPIRED
```

Do not represent status inconsistently across the application.

---

# 19. Mabar Validation

Before joining a Mabar:

```text
Match exists
AND
Match is joinable
AND
Match is not full
AND
User is not already participant
AND
Match has not started
```

Every failure must return a meaningful error.

Example:

```text
Mabar sudah penuh.

Slot terakhir baru saja diambil
oleh player lain.
```

---

# 20. Match Type

Supported:

```text
CASUAL
COMPETITIVE
```

Business rule:

```text
CASUAL
→ Does not affect competitive rating

COMPETITIVE
→ Can affect competitive rating
```

Keep this distinction throughout the architecture.

---

# 21. Match Domain

Match lifecycle:

```text
UPCOMING
↓
LIVE
↓
COMPLETED
```

Alternative:

```text
UPCOMING
↓
CANCELLED
```

Do not allow invalid transitions.

---

# 22. Doubles

Doubles must support:

```text
Team A
Player 1
Player 2

Team B
Player 1
Player 2
```

Future team-balancing logic should be isolated so it can be implemented without redesigning the core match model.

---

# 23. Score

Score input must be validated server-side.

Validate:

- set count
- legal set scores
- tie-break rules
- team consistency
- match format

Never blindly trust score submitted from the client.

---

# 24. Result Confirmation

Competitive match results should support confirmation.

Flow:

```text
Organizer submits result
↓
Opponent / participant confirms
↓
Result becomes official
↓
Rating updated
```

Rating must not update before the result becomes official.

---

# 25. Match History

Only valid completed matches should appear as completed history.

Store:

```text
Opponent
Partner
Date
Format
Match Type
Score
Result
Rating Before
Rating Change
Rating After
```

This enables future analytics without changing the data model.

---

# 26. Smart Matchmaking

MVP matching factors:

```text
Level
Rating
Date
Time
Location
Format
Match Type
```

Architecture should allow future factors:

```text
Playing Style
Playing Objective
Past Compatibility
Community
Availability
```

Do not hardcode matchmaking logic directly inside UI components.

Use a service/domain layer.

---

# 27. Compatibility Score

The UI may display:

```text
94% Match
```

But the calculation must remain a domain/service responsibility.

Example conceptual architecture:

```text
matchmaking/
├── matchmaking.service
├── matchmaking.types
├── matchmaking.constants
└── matchmaking.test
```

---

# 28. Home Screen

Home must prioritize:

1. Find Mabar
2. Upcoming Match
3. Recommended Mabar
4. Rating / Progress

Do not overload Home with every feature.

---

# 29. Find Mabar UX

Filters:

```text
Location
Date
Time
Level
Format
Match Type
```

Match cards must make the following immediately visible:

```text
When
Where
Level
Format
Players
Availability
Cost
Join
```

---

# 30. Create Mabar UX

Creation flow must be simple.

Required:

```text
Format
Date
Time
Location
Level
Match Type
Maximum Players
```

Optional:

```text
Estimated Cost
Description
```

---

# 31. Forms

Every form must have:

```text
Label
Input
Validation
Error
Loading
Success
```

Never rely only on placeholder text.

---

# 32. Error Handling

Error messages must be:

- human-readable
- contextual
- actionable

Bad:

```text
Error 409
```

Good:

```text
Mabar sudah penuh.
Cari mabar lain yang masih tersedia.
```

Never expose raw database errors to users.

---

# 33. Loading States

Every async operation needs appropriate feedback.

Examples:

```text
Skeleton
Button loading state
Inline loading
Page loading
```

Avoid unnecessary full-screen spinners.

---

# 34. Empty States

Every major list must have an empty state.

Example:

```text
Belum ada mabar.

Coba ubah filter atau buat mabar sendiri.

[ Create Mabar ]
```

---

# 35. Optimistic UI

Use optimistic updates only when safe.

Good candidates:

- join button state
- like/favorite if introduced
- simple UI preferences

Do not optimistically update critical:

- score
- rating
- payment
- match completion

unless rollback is robust.

---

# 36. Security

Never trust:

- client rating
- client user ID
- client ownership
- client match status
- client score confirmation

All authorization must happen server-side.

User can only modify resources they are authorized to modify.

---

# 37. Authorization Rules

Examples:

### Organizer

Can:

- edit own Mabar
- cancel own Mabar
- manage participant state

Cannot:

- modify another user's Mabar

### Participant

Can:

- view match
- leave match when allowed
- submit/confirm result according to rules

Cannot:

- modify rating directly

---

# 38. Database Rules

Use:

- proper foreign keys
- indexes
- unique constraints
- enums/constants where appropriate
- timestamps

Important indexes should exist for:

```text
Mabar date
Mabar status
Mabar location
Mabar format
Mabar level
Participants
Match player
Match date
```

Do not over-index without reason.

---

# 39. Performance

Prioritize:

- fast initial page load
- efficient queries
- pagination
- lazy loading
- image optimization
- server-side filtering where appropriate

Do not load thousands of matches into the browser.

---

# 40. List Loading

For large lists:

Use:

```text
pagination
or
cursor-based loading
```

Prefer cursor-based pagination for feeds and continuously growing match history when appropriate.

---

# 41. Mobile Performance

Avoid:

- huge JS bundles
- unnecessary client components
- large unoptimized images
- unnecessary polling
- expensive calculations during render

---

# 42. Accessibility

Every implementation must support:

- keyboard navigation
- semantic HTML
- focus states
- accessible labels
- sufficient contrast
- touch targets >= 44px
- screen-reader-friendly forms

Do not use color as the only indicator.

---

# 43. Responsive Behavior

Test:

```text
360px
375px
390px
414px
768px
1024px
1280px+
```

No:

- horizontal overflow
- broken cards
- clipped buttons
- unusable tables
- inaccessible bottom navigation

---

# 44. Desktop Adaptation

Desktop should not become an enterprise dashboard.

Use:

```text
max-width: 1200px
```

with comfortable whitespace.

Possible layout:

```text
Sidebar
+
Main Content
```

But preserve the mobile product hierarchy.

---

# 45. WhatsApp Sharing

Do not build WhatsApp Business API integration for MVP.

Use share/deep-link behavior where appropriate.

Generated message should contain:

```text
Mabar Name
Date
Time
Location
Level
Format
Players
Cost
Join Link
```

---

# 46. Notification Architecture

MVP notification events:

```text
Mabar Joined
Mabar Full
Match Reminder
Result Confirmation Required
Rating Updated
```

Notification creation should be event-driven where practical.

Do not tightly couple notification logic into UI components.

---

# 47. Testing Strategy

Each feature must include appropriate tests.

## Unit

Test:

- rating calculation
- matchmaking
- validation
- score rules
- state transitions

## Integration

Test:

- create Mabar
- join Mabar
- submit result
- confirm result
- rating update

## E2E

Critical journey:

```text
Register
→ Profile
→ Find Mabar
→ Join
→ Match
→ Submit Result
→ Confirm
→ Rating Updated
```

---

# 48. Definition of Done

A feature is NOT done when:

```text
UI works
```

A feature is done when:

```text
UI
+
Business Logic
+
Validation
+
Authorization
+
Error Handling
+
Loading State
+
Empty State
+
Responsive
+
Accessibility
+
Tests
```

are complete.

---

# 49. Development Workflow

For each task:

## Phase 1 — Understand

Read:

```text
PRD.md
Design.md
Existing implementation
```

---

## Phase 2 — Plan

Identify:

```text
Files to change
Files to create
Database changes
API changes
UI changes
Tests
```

---

## Phase 3 — Implement

Implement the smallest correct vertical slice.

---

## Phase 4 — Validate

Run:

```text
Lint
Typecheck
Unit Tests
Integration Tests
Build
```

and E2E where available.

---

## Phase 5 — Review

Check:

```text
PRD compliance
Design compliance
UX consistency
Mobile behavior
Security
Performance
```

---

# 50. Do Not Over-Engineer

Avoid introducing infrastructure that is not necessary.

Do not add:

- microservices
- message queues
- complex event buses
- unnecessary state management
- unnecessary abstraction layers

unless the existing application genuinely requires them.

Prefer:

> Simple, maintainable, understandable architecture.

---

# 51. Do Not Rewrite Existing Features Without Reason

If the project already has working functionality:

1. Understand it.
2. Preserve behavior.
3. Refactor only when necessary.
4. Avoid unrelated changes.

Do not introduce regressions.

---

# 52. Feature Isolation

When implementing a feature, avoid modifying unrelated modules.

Bad:

```text
Implement Mabar
→ rewrite entire application
```

Good:

```text
Implement Mabar
→ add Mabar domain
→ reuse existing infrastructure
→ integrate with existing navigation
```

---

# 53. Product Language

Primary UI language:

> Indonesian

Technical code:

> English

Examples:

UI:

```text
Cari Mabar
Buat Mabar
Join Mabar
Match Selesai
Rating Kamu
```

Code:

```text
createMabar()
joinMabar()
calculateRating()
submitMatchResult()
```

---

# 54. UX Copy Rules

Avoid overly formal language.

Prefer:

```text
Cari Mabar
```

instead of:

```text
Search Tennis Sessions
```

Prefer:

```text
Mabar sudah penuh.
```

instead of:

```text
Unable to join this session because maximum participant capacity has been reached.
```

---

# 55. Avoid Generic Dashboard Design

Do not create:

```text
10 KPI cards
+
large tables
+
sidebar
+
empty charts
```

unless required.

The player is not managing a business.

The player wants to:

> **Play tennis.**

---

# 56. Avoid Feature Creep

Do not implement future features unless explicitly requested.

Future:

```text
Tournament
Coaching
Court Booking
Payment
AI Analysis
Equipment Marketplace
Advanced Analytics
```

must remain outside MVP.

---

# 57. Handling Ambiguity

When requirement is ambiguous:

### First

Look at:

```text
PRD.md
Design.md
existing implementation
```

### Then

Infer the smallest behavior consistent with the product.

### If ambiguity affects architecture or business rules

Stop and ask for clarification instead of silently inventing behavior.

---

# 58. Handling Existing Bugs

When fixing an existing bug:

1. Reproduce it.
2. Identify root cause.
3. Fix root cause.
4. Add regression test.
5. Validate related flows.

Do not patch symptoms only.

---

# 59. UI Review Before Completion

Before declaring a UI feature complete, inspect it visually.

Check:

```text
Desktop
Tablet
Mobile
```

Check:

- spacing
- alignment
- typography
- card hierarchy
- CTA visibility
- overflow
- touch target
- loading
- empty state
- error state

---

# 60. Final Validation Checklist

Before finishing implementation:

### Product

- [ ] Follows PRD
- [ ] Core user journey works
- [ ] No unnecessary feature added

### UX

- [ ] Mobile first
- [ ] CTA clear
- [ ] Beginner friendly
- [ ] Advanced users supported
- [ ] Loading states
- [ ] Empty states
- [ ] Error states

### Engineering

- [ ] Type safe
- [ ] Validated
- [ ] Authorized
- [ ] Server-side business rules
- [ ] No duplicated components
- [ ] No obvious performance issue

### Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E critical path
- [ ] Build passes

### Responsive

- [ ] 360px
- [ ] 375px
- [ ] 390px
- [ ] 414px
- [ ] Tablet
- [ ] Desktop

---

# 61. Implementation Priority

Always prioritize:

```text
P0
Core Mabar Loop

P1
Matchmaking + Progress

P2
Community + Engagement

P3
Advanced Tennis Ecosystem
```

---

# 62. P0 Definition

The MVP must make this journey work flawlessly:

```text
User
↓
Register
↓
Create Tennis Profile
↓
Get Initial Level
↓
Find Mabar
↓
View Match
↓
Join
↓
Play
↓
Submit Score
↓
Confirm Result
↓
Rating Updated
↓
View Progress
↓
Find Next Mabar
```

If this flow is broken, the MVP is not complete.

---

# 63. Final Instruction

Do not optimize for:

> "How many features can we build?"

Optimize for:

> **"How quickly can a tennis player get into a good game and want to play again?"**

Every implementation decision should reinforce:

# Find. Play. Improve.

Build the simplest reliable version first.

Then improve it based on actual user behavior.