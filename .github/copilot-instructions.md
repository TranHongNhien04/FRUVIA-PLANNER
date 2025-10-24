# Fruvia Planner - AI Agent Instructions

## Project Overview
Fruvia Planner is a React Native mobile application built with Expo and Firebase. The app features a tab-based navigation structure with calendar, home, project, and profile views.

## Architecture

### Key Components
- `app/(tabs)/_layout.tsx`: Tab navigation configuration
- `app/(tabs)/*.tsx`: Main tab screens (Home, Calendar, Project, Profile)
- `config/FirebaseConfig.ts`: Firebase configuration and initialization
- `shared/Colors.tsx`: App-wide color definitions

### Tech Stack
- Expo SDK 54
- React Native 0.81.4
- Firebase (Firestore)
- Clerk for authentication
- TypeScript

## Development Workflow

### Setup and Running
1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

### File Structure Conventions
- Use file-based routing in the `app` directory
- Keep shared components in `shared` directory
- Firebase configuration and services in `config` directory
- Assets (images, etc.) in `assets` directory

### State Management
- Firebase Firestore for data persistence
- Clerk for authentication state
- React Navigation for screen management

## Integration Points
1. Firebase Integration:
   - All Firebase initialization happens in `config/FirebaseConfig.ts`
   - Use `firestoreDb` export for database operations

2. Authentication:
   - Clerk handles user authentication
   - Use `@clerk/clerk-expo` components and hooks

## Common Patterns
1. Tab Navigation:
   - Each tab screen is defined in `app/(tabs)/`
   - Use React Navigation's bottom tab navigator

2. Styling:
   - Reference colors from `shared/Colors.tsx`
   - Use Expo's built-in components when possible

## Key Dependencies
- `@clerk/clerk-expo`: Authentication
- `expo-router`: File-based routing
- `firebase`: Backend services
- `react-native-reanimated`: Animations
- `expo-image`: Optimized image component

## Important Notes
- Always use TypeScript for new files
- Follow Expo's file-based routing conventions
- Use Firebase security rules for data access control