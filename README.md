# Zapminds Academy

A gamified learning platform for mastering AI, Machine Learning, and Software Engineering skills.

## Overview

Zapminds Academy is an interactive learning platform that combines high-quality educational content with gamification elements to create an engaging and motivating learning experience. Students progress through courses, earn XP, unlock badges, and compete on leaderboards while building real-world skills.

## Features

### 🎓 Comprehensive Courses

- **Python Foundations**: Master Python programming from basics to advanced concepts
- **Machine Learning**: Learn ML algorithms, model training, and deployment
- **Deep Learning**: Dive into neural networks, CNNs, RNNs, and transformers
- **LLM Engineering**: Build and fine-tune large language models
- **Agentic AI**: Create autonomous AI agents and multi-agent systems
- **RAG (Retrieval-Augmented Generation)**: Implement advanced retrieval systems
- **MCP (Model Context Protocol)**: Master modern AI communication protocols

### 🎮 XP System

- **7 Tiers**: Progress from Bronze to Grandmaster
- **Module Completion**: Earn 75-175 XP per module based on difficulty
- **Daily Streaks**: Maintain momentum with daily streak bonuses
- **Tier Badges**: Unlock exclusive badges as you advance
- **Real-time Progress**: Track your XP and tier progression

[Learn more about the XP System →](./XP_SYSTEM.md)

### 🏆 Badges & Achievements

- **Tier Badges**: Earned automatically when reaching new tiers
- **Streak Badges**: Recognize consistent daily learning (3, 7, 30, 100 days)
- **Course Badges**: Awarded for completing entire courses
- **Special Badges**: Limited-time event badges and achievements

### 📊 Leaderboard

- **Global Rankings**: See where you stand among all students
- **Tier Filtering**: Compare yourself with students in your tier
- **Real-time Updates**: Rankings update as students earn XP
- **Seasonal Competition**: Compete in time-limited seasons

### 🔥 Daily Streaks

- **Base Reward**: 120 XP per day
- **Streak Bonus**: +8 XP per consecutive day
- **Milestone Badges**: Earn special badges at 3, 7, 30, and 100 days
- **Countdown Timer**: Never miss a claim with our countdown feature

### 💻 Interactive Code Playground

- **In-browser Coding**: Write and test code directly in your browser
- **Instant Feedback**: Run tests and see results immediately
- **Monaco Editor**: Powered by VS Code's editor for a familiar experience
- **Multi-language Support**: Python, JavaScript, and more

## Tech Stack

### Frontend

- **Nuxt 3**: Vue.js framework for SSR and SSG
- **TypeScript**: Type-safe development
- **SCSS**: Modular styling with variables and mixins
- **GPU Curtains**: WebGL-powered visual effects
- **Monaco Editor**: Code editing experience

### Backend

- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Nuxt Server API**: Server-side API routes
- **TypeScript**: End-to-end type safety

### Infrastructure

- **Vercel**: Hosting and deployment
- **GitHub Actions**: CI/CD pipelines
- **Docker**: Containerization for local development

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/zapminds/academy.git
cd academy
```

2. **Install dependencies**

```bash
cd front-end
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Supabase Configuration
NUXT_SUPABASE_URL=https://your-project.supabase.co
NUXT_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# System User for Seeding
SEED_SYSTEM_EMAIL=system@zapminds.academy
SEED_SYSTEM_NAME=Zapminds Academy System
```

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Seed the database**

```bash
npm run db:seed
```

6. **Start the development server**

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app running.

## Project Structure

```
zapminds-academy/
├── front-end/                 # Nuxt 3 application
│   ├── assets/               # Static assets (images, styles)
│   │   └── scss/            # SCSS files (_vars, _mixins, _animations)
│   ├── components/          # Vue components
│   │   ├── atoms/          # Basic UI elements
│   │   ├── molecules/      # Composite components
│   │   └── organisms/      # Complex components
│   ├── composables/        # Vue composables
│   │   ├── use-auth.ts    # Authentication logic
│   │   ├── use-user-progress.ts  # User progress tracking
│   │   └── use-xp-tier.ts # XP tier calculations
│   ├── middleware/         # Route middleware
│   ├── pages/             # Application pages
│   │   ├── dashboard/    # Student dashboard
│   │   ├── courses/      # Course pages
│   │   ├── leaderboard.vue  # Leaderboard
│   │   └── daily-streak.vue # Daily streak
│   ├── server/           # Server-side code
│   │   ├── api/         # API endpoints
│   │   │   ├── user/   # User-related endpoints
│   │   │   ├── courses/ # Course progress endpoints
│   │   │   ├── exercises/ # Exercise submission
│   │   │   ├── leaderboard/ # Leaderboard endpoints
│   │   │   └── daily-streak/ # Streak endpoints
│   │   └── utils/      # Server utilities
│   │       ├── supabase-client.ts  # Supabase client
│   │       ├── xp-calculator.ts    # XP calculations
│   │       ├── badge-manager.ts    # Badge management
│   │       └── leaderboard-updater.ts # Leaderboard logic
│   ├── utils/          # Shared utilities
│   │   ├── xp-tiers.ts # XP tier definitions
│   │   └── module-xp-values.ts # Module XP values
│   └── types/         # TypeScript types
├── scripts/          # Database and utility scripts
│   └── seed-courses.ts # Database seeding script
├── supabase/        # Supabase configuration
│   └── migrations/  # Database migrations
├── API.md          # API documentation
├── XP_SYSTEM.md    # XP system guide
└── README.md       # This file
```

## Database Schema

### Core Tables

- **`profiles`**: User profiles with XP, tier, and display info
- **`courses`**: Course metadata
- **`modules`**: Course modules with XP values
- **`module_details`**: Detailed module content
- **`module_completions`**: User module completion records
- **`streaks`**: User daily streak data
- **`xp_transactions`**: XP transaction audit log
- **`xp_tier_definitions`**: Tier thresholds and metadata
- **`badge_definitions`**: Available badges
- **`user_badges`**: User-earned badges
- **`season_leaderboard_entries`**: Leaderboard rankings
- **`leaderboard_seasons`**: Leaderboard season metadata

[View complete schema →](./docs/DATABASE_SCHEMA.md)

## API Documentation

All API endpoints are documented in [API.md](./API.md).

### Key Endpoints

- `GET /api/user/stats` - User dashboard statistics
- `POST /api/exercises/submit` - Submit exercise and earn XP
- `GET /api/courses/:courseId/progress` - Course progress
- `POST /api/daily-streak/claim` - Claim daily streak
- `GET /api/leaderboard/:seasonId` - Leaderboard rankings
- `GET /api/user/xp-transactions` - XP transaction history

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Type Checking

```bash
npm run typecheck
```

### Building for Production

```bash
npm run build
npm run preview
```

## Deployment

The application is deployed on Vercel with automatic deployments from the `main` branch.

### Environment Variables

Ensure all required environment variables are set in your Vercel project settings:

- `NUXT_SUPABASE_URL`
- `NUXT_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use SCSS modules for component styling
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Support

- **Email**: support@zapminds.academy
- **Discord**: [Join our community](https://discord.gg/zapminds)
- **GitHub Issues**: [Report bugs](https://github.com/zapminds/academy/issues)

## Acknowledgments

- **Martin Laxenaire** - Original WebGL and visual effects
- **Supabase Team** - Backend infrastructure
- **Nuxt Team** - Framework and tooling
- **Monaco Editor** - Code editing experience

---

**Built with ❤️ by the Zapminds Team**

*Last Updated: November 2025*

