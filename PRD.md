# PRD — Tennis Mabar Platform

**Version:** 1.0  
**Status:** Draft / MVP  
**Product Type:** Tennis Social & Matchmaking Platform  
**Primary Platform:** Mobile-first Web App / PWA  
**Target Market:** Tennis players — Beginner sampai Advanced  
**Primary Market:** Indonesia

---

# 1. Product Overview

## 1.1 Product Vision

**Tennis Mabar** adalah platform yang membantu pemain tenis menemukan teman bermain yang sesuai, bergabung atau membuat sesi mabar, memainkan pertandingan yang seimbang, mencatat hasil pertandingan, dan melihat perkembangan kemampuan bermain.

Core philosophy:

> **Find. Play. Improve.**

Produk tidak diposisikan sebagai sekadar aplikasi booking lapangan.

Produk diposisikan sebagai:

> **Platform untuk menemukan, mengatur, dan meningkatkan pengalaman Tennis Mabar.**

---

# 2. Problem Statement

Saat ini pemain tenis menghadapi beberapa masalah:

### 2.1 Sulit mencari teman bermain

Player sering mengandalkan:

- WhatsApp Group
- komunitas
- Instagram
- teman kantor
- teman pribadi

Masalahnya, belum tentu orang yang tersedia memiliki:

- level yang sama
- waktu yang sama
- lokasi yang dekat
- format permainan yang sama

---

### 2.2 Sulit menemukan pertandingan yang sesuai level

Label:

- Beginner
- Intermediate
- Advanced

sering subjektif.

Player membutuhkan sistem yang dapat membantu menemukan lawan/partner yang lebih sesuai.

---

### 2.3 Mabar membutuhkan banyak koordinasi

Untuk membuat satu sesi doubles, organizer biasanya harus mencari:

- Player 1
- Player 2
- Player 3
- Player 4
- waktu
- lokasi
- biaya
- konfirmasi

Semua dilakukan secara manual.

---

### 2.4 Tidak ada tracking perkembangan yang sederhana

Setelah bermain, kebanyakan player hanya mengingat:

> "Tadi menang."

Tetapi tidak mengetahui:

- berapa pertandingan sudah dimainkan
- win rate
- perkembangan rating
- performa terakhir
- siapa lawan yang pernah dihadapi

---

### 2.5 Beginner sering kesulitan masuk komunitas

Beginner membutuhkan cara sederhana untuk mengatakan:

> "Gue baru belajar tenis dan mau cari teman main."

Tanpa merasa harus masuk ke komunitas yang terlalu kompetitif.

---

# 3. Product Goals

## Primary Goals

### Goal 1 — Mempermudah menemukan mabar

Player dapat menemukan pertandingan berdasarkan:

- tanggal
- waktu
- lokasi
- level
- format
- tipe pertandingan

---

### Goal 2 — Mempermudah membuat mabar

Player dapat membuat sesi mabar dan membuka slot untuk player lain.

---

### Goal 3 — Membantu menciptakan pertandingan yang seimbang

Sistem memberikan rekomendasi player berdasarkan:

- level
- rating
- lokasi
- availability
- format
- preferensi permainan

---

### Goal 4 — Membuat player memiliki tennis identity

Setiap player memiliki:

- Tennis Level
- Rating
- Match History
- Win/Loss
- Playing Style
- Playing Preference

---

### Goal 5 — Mendorong player bermain kembali

Setelah pertandingan:

```text
Play
↓
Record Result
↓
Rating Update
↓
Progress
↓
Find Next Match
```

---

# 4. Non-Goals

Fitur berikut **tidak menjadi fokus MVP**:

- Full tennis court booking engine
- Payment gateway
- Coaching marketplace
- Tennis equipment marketplace
- AI video analysis
- Automatic camera tracking
- Tournament management kompleks
- Advanced player analytics
- Court reservation integration
- WhatsApp Business API

Fitur tersebut dapat masuk roadmap setelah product-market fit.

---

# 5. Target Users

## 5.1 Beginner

Karakteristik:

- baru belajar tenis
- belum memiliki banyak teman tenis
- belum memahami rating
- lebih mengutamakan fun
- membutuhkan lingkungan yang nyaman

Primary needs:

- Find players
- Find beginner-friendly matches
- Casual games
- Simple profile
- Basic progress

---

## 5.2 Intermediate

Karakteristik:

- sudah rutin bermain
- ingin menemukan lawan yang setara
- mulai peduli dengan rating
- mulai mencari competitive games

Primary needs:

- Smart matchmaking
- Rating
- Match history
- Competitive matches
- Community
- Challenge

---

## 5.3 Advanced

Karakteristik:

- bermain rutin
- kompetitif
- peduli kualitas lawan
- membutuhkan pertandingan yang seimbang

Primary needs:

- Accurate rating
- Competitive match
- Challenge
- Ladder
- Advanced statistics
- Strong matchmaking

---

# 6. Core Product Loop

Core product loop:

```text
Create Profile
      ↓
Determine Level
      ↓
Find Mabar
      ↓
Join Match
      ↓
Play
      ↓
Submit Result
      ↓
Rating Updated
      ↓
Track Progress
      ↓
Find Next Mabar
      ↺
```

Seluruh fitur MVP harus mendukung loop ini.

---

# 7. Product Principles

## 7.1 Mobile First

Primary usage device:

- Smartphone
- Tablet

User kemungkinan besar menggunakan aplikasi:

- sebelum bermain
- saat perjalanan
- ketika berada di tennis court
- setelah pertandingan

---

## 7.2 Play First

User harus dapat menemukan mabar dengan cepat.

Primary CTA:

> **Find Mabar**

---

## 7.3 Simple for Beginner

Beginner tidak boleh dipaksa memahami:

- rating algorithm
- advanced statistics
- ranking system

Gunakan progressive disclosure.

---

## 7.4 Deep Enough for Advanced

Advanced player tetap membutuhkan:

- rating
- competitive match
- match history
- challenge
- leaderboard
- statistics

---

## 7.5 WhatsApp Friendly

Produk tidak mencoba menggantikan WhatsApp.

Positioning:

```text
Tennis Mabar
= System of Record

WhatsApp
= Communication Layer
```

---

# 8. MVP Modules

MVP terdiri dari:

1. Authentication
2. Player Profile
3. Tennis Level & Rating
4. Find Mabar
5. Create Mabar
6. Join Mabar
7. Match Management
8. Score & Result
9. Rating & Match History
10. Player Progress
11. Community
12. WhatsApp Sharing

---

# 9. Module 01 — Authentication

## Objective

Memberikan akses sederhana ke platform.

## MVP

Support:

- Email
- Google Login

Optional future:

- Phone OTP

---

# 10. Module 02 — Player Profile

## Player Information

- Profile photo
- Display name
- Location
- Gender
- Dominant hand

## Tennis Information

- Tennis level
- Rating
- Reliability
- Playing style
- Preferred format
- Availability
- Playing objective

---

## Playing Style

Options:

- Baseline
- Aggressive Baseliner
- All Court
- Serve & Volley
- Counter Puncher
- Still Learning

---

## Playing Objective

Options:

- Fun
- Fitness
- Improve
- Competitive
- Tournament

---

## Preferred Format

- Singles
- Doubles
- Both

---

# 11. Module 03 — Tennis Level & Rating

## Initial Level Assessment

Saat pertama kali menggunakan aplikasi, user melakukan assessment sederhana.

Questions:

### Experience

```text
Sudah berapa lama bermain tenis?

○ Belum pernah
○ < 3 bulan
○ 3–12 bulan
○ > 1 tahun
```

### Rally

```text
Seberapa konsisten melakukan rally?

○ Belum bisa
○ Kadang
○ Cukup konsisten
○ Sangat konsisten
```

### Match Experience

```text
Pernah bermain pertandingan?

○ Belum
○ Friendly
○ Competitive
○ Tournament
```

---

## Level

MVP menggunakan:

```text
Beginner
Upper Beginner
Intermediate
Upper Intermediate
Advanced
Competitive
```

---

## Rating

Rating digunakan untuk merepresentasikan kemampuan player secara lebih dinamis.

Contoh:

```text
Rating
3.42

Reliability
78%
```

Rating akan berubah berdasarkan hasil pertandingan yang valid.

---

## Reliability

Reliability menunjukkan tingkat kepercayaan terhadap rating.

Contoh:

```text
New Player
Rating: 2.8
Reliability: 20%
```

Setelah banyak pertandingan:

```text
Rating: 3.42
Reliability: 78%
```

---

# 12. Module 04 — Find Mabar

## Objective

Memungkinkan player menemukan pertandingan yang sesuai.

---

## Filters

### Date

- Today
- Tomorrow
- This weekend
- Custom

### Time

- Morning
- Afternoon
- Evening
- Custom

### Location

- Current area
- Selected area
- Distance

### Format

- Singles
- Doubles

### Level

- Beginner
- Upper Beginner
- Intermediate
- Upper Intermediate
- Advanced
- Competitive

### Match Type

- Casual
- Competitive

---

## Match Card

Setiap match card menampilkan:

```text
Tennis Mabar — Kemang

Saturday, 8 Nov
07:00 – 09:00

Kemang Tennis Club

Level
2.5 – 3.5

Doubles

Players
3 / 4

Rp75.000 / player

[ JOIN ]
```

---

# 13. Module 05 — Create Mabar

Player dapat membuat sesi mabar.

## Required Fields

### Format

- Singles
- Doubles

### Date

Required.

### Start Time

Required.

### End Time

Required.

### Location

Required.

### Level Range

Contoh:

```text
2.5 – 3.5
```

### Match Type

- Casual
- Competitive

### Maximum Players

Singles:

```text
2
```

Doubles:

```text
4
```

### Estimated Cost

Optional.

---

## Create Flow

```text
Create Mabar
↓
Select Format
↓
Select Date
↓
Select Time
↓
Select Location
↓
Set Level
↓
Select Match Type
↓
Set Cost
↓
Review
↓
Create
```

---

# 14. Module 06 — Join Mabar

Player dapat melihat detail match sebelum join.

## Match Detail

Menampilkan:

- Organizer
- Date
- Time
- Location
- Level
- Format
- Match type
- Players
- Cost
- Match description

---

## Player List

Contoh:

```text
Players 3 / 4

👤 Andi
Rating 3.5

👤 Budi
Rating 3.4

👤 Sarah
Rating 3.2

+ 1 slot available
```

---

## Join Rules

System harus melakukan validation:

- Match belum penuh
- Match belum dimulai
- Player belum terdaftar
- Player sesuai eligibility
- Match belum dibatalkan

Jika gagal, tampilkan alasan yang jelas.

Contoh:

```text
This match is already full.
```

---

# 15. Module 07 — Smart Matchmaking

## Objective

Memberikan rekomendasi mabar/player yang paling relevan.

---

## Matching Factors

MVP:

```text
Level
+
Rating
+
Date
+
Time
+
Location
+
Format
+
Match Type
```

Future:

```text
Playing Style
+
Playing Objective
+
Past Match Compatibility
```

---

## Compatibility Score

Contoh:

```text
Match Compatibility

94%
```

Tidak perlu ditampilkan sebagai formula teknis.

User cukup melihat:

```text
🔥 Great Match
```

atau:

```text
Good Match
```

---

# 16. Module 08 — Match Management

Setelah match dimulai, status berubah:

```text
Upcoming
↓
Live
↓
Completed
```

---

## Match Status

- Open
- Full
- Upcoming
- Live
- Completed
- Cancelled
- Expired

---

# 17. Live Score

Untuk doubles:

```text
Team A
Andi + Sarah

6     4     10

Team B
Budi + Dika

4     6     7
```

User dapat memasukkan score per set.

---

## Score Validation

System harus melakukan validation terhadap:

- valid set score
- number of sets
- tiebreak
- incomplete result

Invalid result tidak boleh langsung disimpan.

---

# 18. Module 09 — Match Result

Setelah score selesai:

```text
MATCH COMPLETED

Team A
6 - 4
4 - 6
10 - 7

Team B
6 - 4
4 - 6
10 - 7
```

System menampilkan:

```text
Rating Updated

3.42 → 3.51

+0.09
```

---

# 19. Result Confirmation

Untuk mengurangi manipulasi score:

```text
Organizer submits result
        ↓
Opponent confirmation
        ↓
Result becomes official
```

Status:

```text
Pending Confirmation
```

atau:

```text
Confirmed
```

---

# 20. Module 10 — Match History

Player dapat melihat seluruh pertandingan.

Example:

```text
November

W
vs Budi
6-4 6-3

L
vs Andi
4-6 6-7

W
vs Sarah
6-2 6-4
```

Filter:

- All
- Wins
- Losses
- Casual
- Competitive
- Singles
- Doubles

---

# 21. Module 11 — Player Progress

## Overview

Dashboard menampilkan:

```text
Rating
3.42 ↑ +0.18

Matches
27

Wins
15

Losses
12

Win Rate
56%
```

---

## Rating Chart

Example:

```text
4.0 ┤
    │             ●
3.5 ┤        ●────┘
    │    ●───┘
3.0 ┤ ●──┘
    └────────────────
      Jun Jul Aug Sep Oct
```

---

## Recent Form

```text
W W W L W W L W
```

---

# 22. Module 12 — Community

Community memungkinkan player menemukan lingkungan bermain.

Community dapat memiliki:

- Name
- Description
- Location
- Members
- Events
- Mabar
- Leaderboard

---

## Community Example

```text
Sunday Tennis

📍 Jakarta Selatan

245 Members

Upcoming Mabar
Saturday 07:00

[ JOIN COMMUNITY ]
```

---

# 23. WhatsApp Sharing

Setiap mabar dapat dibagikan melalui WhatsApp.

CTA:

> **Share to WhatsApp**

Generated content:

```text
🎾 Tennis Mabar

📅 Sabtu, 8 Nov
🕖 07:00–09:00
📍 Kemang Tennis Club

⭐ Level: 2.5–3.5
🎾 Doubles
👥 3/4 players

💰 Rp75.000/player

Join Mabar:
[Link]
```

---

# 24. Home Dashboard

Home adalah pusat aktivitas player.

## Header

```text
Halo, Ihsan 👋
Siap main tenis hari ini?
```

---

## Primary CTA

```text
[ Find Your Next Match ]
```

---

## Quick Actions

```text
Create Mabar
Find Player
Leaderboard
Community
```

---

## Upcoming Matches

Menampilkan match yang akan datang.

---

## Rating Card

```text
⭐ 3.42

+0.18 this month
```

---

# 25. Navigation

Mobile bottom navigation:

```text
Home
Matches
Stats
Community
Profile
```

---

# 26. UX Requirements

## 26.1 Mobile First

Design harus optimal untuk:

- 360px
- 390px
- 414px

dan tetap responsive pada:

- Tablet
- Desktop

---

## 26.2 Primary CTA

Setiap halaman harus memiliki primary action yang jelas.

---

## 26.3 Empty State

Contoh:

```text
Belum ada mabar

Belum menemukan pertandingan
yang sesuai.

[ Find Mabar ]
```

---

## 26.4 Loading State

Gunakan skeleton loading untuk:

- Match list
- Profile
- Community
- Statistics

---

## 26.5 Error State

Error harus menjelaskan:

1. Apa yang terjadi
2. Mengapa terjadi
3. Apa yang dapat dilakukan

Contoh:

```text
Mabar sudah penuh.

Slot terakhir baru saja diambil
oleh player lain.

[ Cari Mabar Lain ]
```

---

# 27. Matchmaking UX

System harus menyediakan:

### Recommended Matches

```text
🔥 Best Match
94% compatible
```

### Nearby

```text
2.1 km away
```

### Same Level

```text
Similar level
```

### Soon

```text
Starting in 2 hours
```

---

# 28. Doubles Team Balancing

Future MVP+ feature.

Ketika empat player sudah bergabung, system dapat memberikan rekomendasi team.

Example:

```text
Suggested Teams

Team A
Andi + Dika
Average Rating 3.35

VS

Team B
Budi + Sarah
Average Rating 3.32

⚖️ Balanced Match
```

Organizer dapat:

- Accept
- Shuffle
- Manually change

---

# 29. Notifications

MVP notifications:

### Match Joined

> Sarah joined your mabar.

### Match Full

> Your mabar is now full.

### Match Reminder

> Your match starts in 2 hours.

### Result Confirmation

> Please confirm the match result.

### Rating Update

> Your rating increased to 3.51.

---

# 30. Weather Integration

Future feature untuk outdoor tennis.

System dapat menunjukkan:

```text
Saturday 07:00

🌧️ 78% rain probability

⚠️ High rain risk
```

Organizer dapat:

- Keep
- Reschedule
- Cancel

---

# 31. Rating System — MVP Simplification

Untuk MVP, rating algorithm harus dibuat sederhana dan explainable.

Initial:

```text
Assessment
↓
Initial Rating
```

Setelah pertandingan:

```text
Match Result
+
Opponent Rating
+
Rating Reliability
↓
Rating Adjustment
```

Jangan membuat algorithm terlalu kompleks pada tahap awal.

Tujuan MVP:

> **Validasi apakah player merasa rating merepresentasikan kemampuan mereka.**

---

# 32. Trust & Anti-Abuse

Karena rating adalah core feature, sistem harus memiliki:

### Result Confirmation

Minimal dua pihak melakukan confirmation.

### Duplicate Prevention

Match tidak boleh dicatat dua kali.

### Match Participant Validation

Hanya player yang terdaftar dalam match yang dapat submit/confirm result.

### Result Dispute

Future:

```text
Dispute Result
```

---

# 33. Core Data Entities

Minimal entity:

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

---

# 34. Core Relationships

```text
User
 │
 └── PlayerProfile
        │
        ├── PlayerRating
        │
        ├── MabarParticipant
        │
        └── MatchParticipant

Mabar
 │
 ├── Organizer
 ├── Participants
 └── Match

Match
 │
 ├── Teams
 ├── Sets
 └── Result

Community
 │
 ├── Members
 └── Mabar
```

---

# 35. Key Business Rules

## BR-001

Player harus memiliki Player Profile sebelum dapat membuat atau join mabar.

## BR-002

Mabar tidak dapat diikuti jika sudah penuh.

## BR-003

Player tidak dapat join match yang sama lebih dari satu kali.

## BR-004

Player tidak dapat join match yang sudah dimulai.

## BR-005

Competitive match menghasilkan rating impact.

## BR-006

Casual match tidak mengubah competitive rating.

## BR-007

Match result harus melewati confirmation sebelum menjadi official.

## BR-008

Hanya participant yang dapat memberikan result confirmation.

## BR-009

Cancelled match tidak masuk ke match history sebagai completed match.

## BR-010

Rating hanya berubah setelah result menjadi official.

---

# 36. MVP User Journey

## New Player

```text
Landing
↓
Register
↓
Create Profile
↓
Tennis Assessment
↓
Initial Level
↓
Home
↓
Find Mabar
↓
View Match
↓
Join
↓
Play
↓
Submit Result
↓
Rating Updated
```

---

# 37. Organizer Journey

```text
Home
↓
Create Mabar
↓
Set Format
↓
Set Schedule
↓
Set Location
↓
Set Level
↓
Set Match Type
↓
Publish
↓
Share WhatsApp
↓
Players Join
↓
Match Full
↓
Play
↓
Submit Result
```

---

# 38. Success Metrics

## North Star Metric

> **Completed Mabar per Active Player**

Karena tujuan utama produk adalah membuat player benar-benar bermain.

---

## Primary Metrics

### Match Creation

Jumlah mabar yang dibuat.

### Match Join Rate

Persentase mabar yang mendapatkan participant.

### Match Completion Rate

Persentase mabar yang benar-benar selesai.

### Repeat Play Rate

Persentase player yang bermain lagi dalam 30 hari.

### Match Fill Rate

Rata-rata persentase slot yang terisi.

### Rating Participation

Persentase competitive match yang menghasilkan rating update.

---

# 39. MVP Acceptance Criteria

MVP dianggap berhasil jika user dapat melakukan:

### Player

- Register
- Create profile
- Complete level assessment
- See rating
- Search mabar
- Filter mabar
- View mabar detail
- Join mabar
- View upcoming matches
- View match history
- View rating progress

### Organizer

- Create mabar
- Configure format
- Configure level
- Configure schedule
- Configure location
- Configure match type
- Share mabar
- Manage participants

### Match

- Start match
- Input score
- Submit result
- Confirm result
- Update rating
- Save match history

### Community

- Browse community
- View community members
- View community mabar
- Join community

---

# 40. MVP Priority

## P0 — Must Have

```text
Authentication
Player Profile
Level Assessment
Rating
Find Mabar
Create Mabar
Join Mabar
Match Detail
Match Result
Match History
Rating Update
WhatsApp Sharing
```

---

## P1 — Should Have

```text
Smart Matchmaking
Community
Leaderboard
Notifications
Doubles Team Balancing
```

---

## P2 — Future

```text
Challenge
Tennis Ladder
Advanced Statistics
Weather Intelligence
Court Intelligence
Tournament
Coaching
AI Tennis Analysis
Payment Integration
Court Booking Integration
```

---

# 41. Product Roadmap

## Phase 1 — Mabar MVP

Focus:

> **Find → Join → Play**

Features:

- Profile
- Level
- Mabar
- Join
- Match
- Score
- History

---

## Phase 2 — Tennis Progress

Focus:

> **Play → Improve**

Features:

- Rating
- Progress
- Leaderboard
- Performance
- Competitive Match
- Smart Matchmaking

---

## Phase 3 — Tennis Community

Focus:

> **Play Together**

Features:

- Community
- Challenge
- Ladder
- Events
- Community Ranking

---

## Phase 4 — Tennis Ecosystem

Focus:

> **Everything Tennis**

Potential:

- Court booking
- Payment
- Coaching
- Tournament
- Equipment
- Weather
- AI performance analysis

---

# 42. Product Positioning

## Primary Positioning

> **Tennis Mabar — Find. Play. Improve.**

## Value Proposition

> Temukan teman main yang cocok, ikut atau buat mabar, main dengan level yang seimbang, dan lihat perkembangan permainan tenis kamu.

---

# 43. Core Differentiators

Produk harus fokus membangun tiga differentiator:

## 1. Smart Tennis Matchmaking

> Menemukan player yang cocok, bukan hanya player yang tersedia.

---

## 2. Balanced Doubles

> Membantu menciptakan pasangan/team yang lebih seimbang.

---

## 3. Living Tennis Rating

> Rating berkembang berdasarkan aktivitas pertandingan nyata.

---

# 44. Final Product Loop

```text
                 ┌───────────────┐
                 │    PLAYER     │
                 └───────┬───────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Tennis Profile  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Find / Create  │
                │      Mabar      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  Smart Matching │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │      PLAY       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   Match Result  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Rating Updated  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Track Progress  │
                └────────┬────────┘
                         │
                         └──────────────┐
                                        ▼
                                  Find Next Mabar
```

---

# 45. One Sentence Product Definition

> **Tennis Mabar adalah platform social matchmaking untuk membantu pemain tenis dari Beginner sampai Advanced menemukan teman/lawan yang cocok, bergabung atau membuat mabar, memainkan pertandingan yang seimbang, serta melacak perkembangan kemampuan mereka dari setiap pertandingan.**

---

# 46. MVP Guiding Principle

> **Don't build a tennis booking app. Build the easiest way for a tennis player to get a good game.**

**Find the right people.  
Play the right game.  
Track your progress.  
Come back and play again.**
