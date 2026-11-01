# Design.md

# Tennis Mabar — Product Design Specification

**Version:** 1.0  
**Status:** MVP  
**Related Documents:** `PRD.md`  
**Design Philosophy:** Mobile First, Tennis Native, Social, Fast, Clear

---

# 1. Design Vision

Tennis Mabar harus terasa seperti:

> **Aplikasi untuk orang yang benar-benar ingin main tenis.**

Bukan:

- aplikasi admin
- aplikasi booking lapangan
- dashboard enterprise
- social media clone

Design harus membuat user bisa melakukan hal utama dengan cepat:

> **Open App → Find Mabar → Join → Play**

Dan setelah bermain:

> **Submit Result → See Progress → Play Again**

---

# 2. Core Design Principles

## 2.1 Play First

Primary objective adalah membantu user bermain.

Setiap halaman harus menjawab:

> "Apa tindakan berikutnya yang paling berguna bagi user?"

---

## 2.2 Mobile First

Primary target:

- 360px
- 375px
- 390px
- 414px

Secondary:

- Tablet
- Desktop

Mobile experience tidak boleh terasa seperti desktop yang diperkecil.

---

## 2.3 Fast Scanning

User kemungkinan membuka aplikasi sambil:

- sedang mencari mabar
- berjalan menuju court
- menunggu player lain
- selesai bermain

Informasi harus mudah dipindai.

Gunakan:

- card
- badge
- chip
- icon
- hierarchy
- whitespace

---

## 2.4 Progressive Disclosure

Beginner tidak perlu melihat seluruh kompleksitas tennis.

Contoh:

Beginner melihat:

```text
Level
Beginner

Rating
2.4

Matches
8
```

Advanced dapat melihat:

```text
Rating
3.82

Reliability
86%

Competitive Matches
34

Win Rate
67%
```

---

## 2.5 Tennis-Native

Gunakan terminology yang familiar:

- Mabar
- Match
- Singles
- Doubles
- Rally
- Rating
- Competitive
- Casual
- Set
- Super Tie Break

Jangan menggunakan istilah generic sports jika ada istilah tennis yang lebih tepat.

---

# 3. Visual Direction

## 3.1 Design Style

Recommended visual style:

> **Modern Sporty Minimalism + Neo-Brutalist Accent**

Karakter:

- bold
- energetic
- clean
- high contrast
- friendly
- modern
- slightly playful

Jangan membuat visual terlalu corporate.

---

# 4. Color System

Gunakan warna utama yang terinspirasi dari tennis ball.

## Primary

```text
Tennis Lime
#D9FF00
```

Digunakan untuk:

- Primary CTA
- Active state
- Important highlights
- Rating increase
- Match availability

---

## Base

```text
Ink
#111111

White
#FFFFFF

Soft Gray
#F5F5F5

Border
#E5E5E5
```

---

## Semantic

```text
Success
#16A34A

Warning
#F59E0B

Danger
#DC2626

Info
#2563EB
```

Semantic colors hanya digunakan ketika memiliki makna.

---

# 5. Typography

Recommended:

> **Inter**

Fallback:

```text
system-ui
-apple-system
BlinkMacSystemFont
Segoe UI
sans-serif
```

---

## Typography Scale

### Display

Large hero:

```text
32–40px
font-weight: 800
```

### Heading 1

```text
28px
font-weight: 700
```

### Heading 2

```text
22px
font-weight: 700
```

### Heading 3

```text
18px
font-weight: 700
```

### Body

```text
14–16px
font-weight: 400–500
```

### Caption

```text
12px
font-weight: 500
```

---

# 6. Spacing System

Gunakan base spacing 4px.

```text
4
8
12
16
20
24
32
40
48
64
```

Default mobile page padding:

```text
16px
```

Tablet:

```text
24px
```

Desktop:

```text
32px
```

---

# 7. Border Radius

Recommended:

```text
Small
8px

Medium
12px

Large
16px

XL
20px

Pill
999px
```

Cards utama menggunakan:

```text
16px
```

---

# 8. Shadows

Gunakan shadow secara minimal.

Default:

```text
0 2px 8px rgba(...)
```

Important floating element:

```text
0 8px 24px rgba(...)
```

Jangan membuat semua card memiliki shadow.

Border-first design lebih diutamakan.

---

# 9. Iconography

Gunakan icon system yang konsisten.

Recommended:

> Lucide Icons

Icon harus:

- simple
- outline
- consistent stroke
- recognizable

Jangan menggunakan emoji sebagai primary UI icon.

Emoji boleh digunakan sebagai secondary personality element.

---

# 10. Button System

## Primary

```text
Background: Tennis Lime
Text: Black
Height: 48px
Radius: 12px
Font Weight: 700
```

Example:

```text
[ Find Mabar ]
```

---

## Secondary

```text
Background: White
Border: 1px
Text: Black
```

---

## Ghost

Untuk secondary actions.

---

## Danger

Untuk:

- Cancel Mabar
- Leave Match
- Delete

---

# 11. Chip / Filter

Filter harus menggunakan pill.

Example:

```text
[ Doubles ✓ ]
[ Singles ]
[ Casual ]
[ Competitive ]
```

Active filter:

- Tennis Lime background
- Black text

---

# 12. Badge System

## Joinable

```text
🟢 Joinable
```

Visual:

Green semantic badge.

---

## Full

```text
Full
```

---

## Competitive

```text
Competitive
```

---

## Casual

```text
Casual
```

---

## Live

```text
LIVE
```

Live state harus sangat jelas.

---

# 13. Bottom Navigation

Mobile:

```text
┌───────────────────────────────┐
│ Home Matches Stats Community  │
│ Profile                       │
└───────────────────────────────┘
```

Five tabs:

1. Home
2. Matches
3. Stats
4. Community
5. Profile

Active tab menggunakan:

- Tennis Lime
- filled/strong icon
- label

---

# 14. Home Screen

Home adalah halaman terpenting.

## Structure

```text
Header
↓
Greeting
↓
Find Next Match CTA
↓
Quick Actions
↓
Upcoming Matches
↓
Recommended Mabar
↓
Rating Summary
```

---

## Header

```text
Halo, Ihsan 👋

[Notification]
[Avatar]
```

---

## Primary CTA

Large card:

```text
Find Your Next Match
Cari mabar yang cocok buat kamu.

[ Find Mabar → ]
```

Ini adalah CTA paling prominent.

---

## Quick Actions

Grid:

```text
Create Mabar
Find Player
Leaderboard
Community
```

Maximum 4 items.

---

# 15. Match Card

Match card adalah component utama aplikasi.

Structure:

```text
[Joinable]

Tennis Mabar — Kemang

Sat, 8 Nov
07:00–09:00

📍 Kemang Tennis Club

Level
2.5 – 3.5

Doubles

3 / 4 players

Rp75.000 / player

[ JOIN ]
```

---

## Match Card Priority

Urutan informasi:

1. Availability
2. Match name
3. Date/time
4. Location
5. Level
6. Format
7. Players
8. Price
9. CTA

---

# 16. Find Mabar Screen

## Header

```text
Find Mabar
```

## Filter Bar

Horizontal scroll:

```text
[Location]
[Date]
[Time]
[Level]
[Format]
[Type]
```

---

## Recommended Section

```text
Best Matches For You
```

Cards dapat memiliki:

```text
94% Match
```

---

## Empty State

```text
Belum ada mabar yang cocok.

Coba perluas lokasi atau level pencarian.

[ Adjust Filters ]
```

---

# 17. Create Mabar

Gunakan multi-step form jika dibutuhkan.

Recommended:

```text
Step 1
Format

Step 2
Schedule

Step 3
Location

Step 4
Level

Step 5
Match Type

Step 6
Review
```

Tetapi jika form tetap sederhana, satu halaman juga diperbolehkan.

---

# 18. Form UX

## Input Rules

Every input must have:

- label
- current value
- clear state
- validation
- error message

Never rely only on placeholder.

---

## Validation

Error harus berada dekat field.

Bad:

```text
Something went wrong.
```

Good:

```text
End time must be later than start time.
```

---

# 19. Match Detail

Top:

```text
< Back

Tennis Mabar — Kemang
```

Hero information:

```text
Joinable
Saturday, 8 Nov
07:00–09:00

Kemang Tennis Club
```

Then:

```text
Level
2.5 – 3.5

Doubles

3 / 4 Players
```

Player list:

```text
Players

Andi
Rating 3.5

Budi
Rating 3.4

Sarah
Rating 3.2

+ 1 slot
```

Bottom sticky CTA:

```text
[ Join This Match ]
```

---

# 20. Live Match Screen

Live score harus menjadi salah satu UI paling simple.

```text
LIVE

TEAM A          TEAM B

Andi + Sarah    Budi + Dika

6               4

4               6

10              7
```

Primary action:

```text
[ Update Score ]
```

---

# 21. Score Input

Score input harus mudah digunakan dengan satu tangan.

Use:

- large numeric controls
- segmented sets
- clear team labels
- validation

Avoid:

- tiny inputs
- complicated tables
- excessive fields

---

# 22. Match Result Screen

Result screen harus terasa rewarding.

Hero:

```text
🏆

Match Completed!
```

Score:

```text
6 — 4
4 — 6
10 — 7
```

Rating:

```text
3.42 → 3.51

+0.09
```

Primary CTA:

```text
[ View Match Details ]
```

Secondary:

```text
Back to Home
```

---

# 23. Stats Screen

## Header

```text
My Tennis
```

Main card:

```text
⭐ 3.42

↑ +0.18 this month

Reliability
78%
```

Stats:

```text
27 Matches
15 Wins
12 Losses
56% Win Rate
```

---

## Progress Chart

Use a simple line chart.

Avoid unnecessary visual complexity.

---

## Recent Form

Use compact indicators:

```text
W W W W L W W L
```

---

# 24. Profile Screen

Header:

```text
Avatar

Ihsan
Jakarta Selatan
```

Rating card:

```text
3.42
Upper Intermediate
```

Profile information:

```text
Playing Style
All Court

Preferred
Doubles

Availability
Weekday Night
Weekend Morning
```

CTA:

```text
[ Edit Profile ]
```

---

# 25. Community Screen

Community should feel social but not like Instagram.

Tabs:

```text
All
Your Area
Your Communities
```

Community card:

```text
Sunday Tennis

245 members

Jakarta Selatan

3 upcoming mabar

[ View Community ]
```

---

# 26. Community Feed

Allowed content:

- Match result
- Achievement
- Mabar announcement
- Community event

Avoid:

- random lifestyle content
- infinite social feed
- vanity metrics

---

# 27. Rating UI

Rating should always communicate:

### Current

```text
3.42
```

### Direction

```text
↑ +0.18
```

### Confidence

```text
Reliability 78%
```

Do not expose complex algorithm formulas to normal users.

---

# 28. Beginner UX

Beginner onboarding should be friendly.

Copy:

```text
Baru mulai tenis?

Santai. Kita bantu cari mabar
yang cocok dengan level kamu.
```

CTA:

```text
[ Tentukan Level Saya ]
```

Avoid:

> "Input UTR"

or advanced tennis terminology.

---

# 29. Advanced UX

Advanced users should have quick access to:

- Rating
- Competitive match
- Match history
- Leaderboard
- Challenge

Advanced features should not clutter beginner UI.

---

# 30. Responsive Design

## Mobile

Single column.

Bottom navigation.

Sticky CTA where appropriate.

---

## Tablet

Two-column layout where useful.

Example:

```text
Match List | Match Detail
```

---

## Desktop

Maximum content width:

```text
1200px
```

Centered layout.

Possible structure:

```text
Sidebar
|
Main Content
```

But desktop must still retain mobile-style simplicity.

---

# 31. Accessibility

Minimum requirements:

- sufficient contrast
- touch target >= 44px
- keyboard navigation
- visible focus state
- semantic HTML
- form labels
- error announcements
- no color-only status

---

# 32. Loading States

Use skeletons.

Example:

```text
████████████
██████
████████████████
```

Do not use full-page spinners unless necessary.

---

# 33. Empty States

Empty state structure:

```text
Icon
Headline
Explanation
Primary Action
```

Example:

```text
Belum ada match.

Cari mabar yang sesuai dengan level
dan jadwal kamu.

[ Find Mabar ]
```

---

# 34. Error States

Every error should answer:

> What happened?

> Why?

> What can I do?

Example:

```text
Mabar sudah penuh.

Semua slot sudah diambil.

[ Cari Mabar Lain ]
```

---

# 35. Confirmation Modal

Use modal only for meaningful destructive actions.

Examples:

- Cancel Mabar
- Leave Match
- Delete Account

Do not use modal for every interaction.

---

# 36. Toast

Use toast for lightweight success feedback.

Example:

```text
✓ Mabar berhasil dibuat.
```

Avoid toast for critical errors.

---

# 37. UX Copy Tone

Tone:

- Friendly
- Casual
- Sporty
- Indonesian
- Clear

Use:

> "Cari Mabar"

instead of:

> "Search Available Tennis Sessions"

Use:

> "Mabar berhasil dibuat."

instead of:

> "Session creation successfully completed."

---

# 38. Microcopy Principles

Keep copy:

- short
- actionable
- human

Examples:

```text
Siap main?

Cari Mabar

Buat Mabar

Join Mabar

Main lagi

Lihat Progress

Rating kamu naik! 🔥
```

---

# 39. Design Component Inventory

Required components:

```text
Button
IconButton
Input
Select
DatePicker
TimePicker
FilterChip
Badge
Avatar
AvatarGroup
Card
MatchCard
PlayerCard
RatingCard
StatsCard
CommunityCard
ScoreBoard
ScoreInput
ProgressChart
BottomNavigation
TopNavigation
Modal
Drawer
Toast
Skeleton
EmptyState
ErrorState
```

---

# 40. Component Rule

Do not create duplicate components for the same purpose.

Before creating a component:

1. Search existing component.
2. Reuse if possible.
3. Extend if necessary.
4. Create new component only when semantic responsibility differs.

---

# 41. Design Quality Checklist

Before considering a screen complete:

### Visual

- [ ] Typography hierarchy clear
- [ ] Spacing consistent
- [ ] CTA obvious
- [ ] No unnecessary decoration
- [ ] Responsive

### UX

- [ ] User knows what to do
- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists
- [ ] Success feedback exists

### Mobile

- [ ] Works at 360px
- [ ] Touch targets >= 44px
- [ ] No horizontal overflow
- [ ] Sticky actions work correctly

### Accessibility

- [ ] Contrast sufficient
- [ ] Keyboard accessible
- [ ] Focus visible
- [ ] Semantic labels available

---

# 42. Design North Star

Every design decision should optimize:

```text
Find a good game
        ↓
Play
        ↓
Improve
        ↓
Play Again
```

If a feature does not help this loop, it should not dominate the MVP UI.
