# LiveBoard Backend

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Start database
docker-compose up -d

# 4. Setup database
npm run db:migrate
npm run db:generate

# 5. Start development server
npm run dev
```

## Database Access
- **DBeaver Connection**: localhost:5433
- **Database**: liveboardDB
- **User**: liveboard
- **Password**: liveboard123

## API Endpoints
- `GET /` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post (auth required)
- `POST /api/posts/:id/like` - Toggle like (auth required)

## Deployment
1. Set production environment variables
2. Use `npm run db:deploy` for production migrations
3. Deploy to Railway/Render/AWS
