# QuickSync - Team Matchmaking Platform

QuickSync is a full-stack web application designed for team matchmaking at hackathons and collaboration events. It uses AI-powered matching to connect developers, designers, and innovators based on their skills, interests, and availability.

## 🚀 Features

### Core Features
- **Smart Matchmaking**: AI-powered teammate suggestions using Hugging Face sentence transformers
- **One-Click Team Invites**: Send instant team invitations with personalized messages
- **Availability Heatmap**: Visual weekly schedule comparison between users
- **Skill-based Project Suggestions**: Get project ideas tailored to your skill set
- **Real-time Team Management**: Create, join, and manage teams seamlessly

### User Experience
- **Firebase Authentication**: Secure login with Google authentication
- **Responsive Design**: Built with Chakra UI for mobile-first experience
- **User Profiles**: Comprehensive profiles with skills, interests, and event preferences
- **Team Discovery**: Browse and join existing teams or create your own

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Chakra UI** - Component library for beautiful, accessible UI
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Firebase Auth** - Authentication and user management

### Backend
- **Django 4.2+** - Python web framework
- **Django REST Framework** - RESTful API development
- **SQLite** (development) / **PostgreSQL** (production) - Database
- **Sentence Transformers** - AI-powered semantic matching
- **Firebase Admin SDK** - Server-side Firebase integration

### AI & Analytics
- **Hugging Face Transformers** - `all-MiniLM-L6-v2` model for semantic similarity
- **Custom Matching Algorithm** - Combines skills, interests, and availability
- **Real-time Compatibility Scoring** - Dynamic match percentages

## 📁 Project Structure

```
quicksync/
├── backend/                 # Django backend
│   ├── quicksync/          # Main Django project
│   ├── accounts/           # User management & profiles
│   ├── teams/              # Team creation & management
│   ├── matchmaking/        # AI-powered matching service
│   └── manage.py           # Django management script
├── frontend/               # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Main application pages
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API service layer
│   │   └── utils/         # Utility functions
├── requirements.txt       # Python dependencies
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🚦 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/quicksync.git
   cd quicksync
   ```

2. **Set up Python virtual environment**
   ```bash
   python -m venv quicksync_env
   source quicksync_env/bin/activate  # On Windows: quicksync_env\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Django**
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. **Run the Django development server**
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup
1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Google Authentication
   - Copy your Firebase config to `src/config.js`

3. **Start the React development server**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`

## 📱 Application Pages

### `/login` - Authentication
- Google OAuth integration
- Seamless user onboarding
- Automatic profile creation

### `/profile` - User Profile Management
- Edit personal information
- Manage skills and interests
- Set event preferences
- Configure weekly availability

### `/matchmaking` - Find Teammates
- AI-powered user recommendations
- Semantic similarity scoring
- Project suggestion engine
- One-click team invitations

### `/teams` - Team Management
- Create and manage teams
- View team member profiles
- Handle team invitations
- Team discovery and joining

### `/heatmap` - Availability Visualization
- Interactive weekly calendar
- Schedule overlap comparison
- Visual availability analysis
- Real-time availability updates

## 🤖 AI Matching Algorithm

QuickSync uses a sophisticated matching algorithm that considers:

1. **Skill Similarity** (30% weight)
   - Semantic matching of technical skills
   - Experience level compatibility
   - Complementary skill sets

2. **Interest Alignment** (20% weight)
   - Shared project interests
   - Domain expertise overlap
   - Innovation preferences

3. **Combined Profile** (50% weight)
   - Holistic compatibility score
   - Communication style matching
   - Collaboration preferences

4. **Availability Overlap**
   - Time zone compatibility
   - Weekly schedule alignment
   - Event participation timing

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/sync-firebase/` - Sync Firebase user
- `GET /api/auth/profile/` - Get user profile
- `PATCH /api/auth/profile/` - Update user profile

### Teams
- `GET /api/teams/` - List all teams
- `POST /api/teams/` - Create new team
- `GET /api/teams/my-teams/` - Get user's teams
- `POST /api/teams/{id}/invite/` - Send team invitation

### Matchmaking
- `POST /api/matchmaking/find/` - Find matching users
- `GET /api/matchmaking/projects/` - Get project suggestions
- `GET /api/matchmaking/availability/{user_id}/` - Get availability overlap

## 🎨 Design Principles

- **Mobile-First**: Responsive design for all screen sizes
- **Accessibility**: WCAG compliant with Chakra UI
- **Performance**: Optimized loading and smooth interactions
- **User-Centric**: Intuitive workflows and clear feedback
- **Scalable**: Modular architecture for easy expansion

## 🚀 Deployment

### Production Setup
1. **Configure PostgreSQL database**
2. **Set up environment variables**
3. **Build React app**: `npm run build`
4. **Deploy Django with gunicorn/nginx**
5. **Configure Firebase for production domain**

### Environment Variables
```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/db

# Firebase
FIREBASE_ADMIN_SDK_PATH=path/to/firebase-admin-sdk.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♀️ Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for hackathon teams and collaborative innovation**