import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/signup_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/courses/screens/course_catalog_screen.dart';
import '../features/courses/screens/course_detail_screen.dart';
import '../features/courses/screens/video_player_screen.dart';
import '../features/downloads/screens/downloads_screen.dart';
import '../features/opportunity_hub/screens/jobs_screen.dart';
import '../features/profile/screens/profile_screen.dart';
import '../features/lesson_planner/screens/lesson_planner_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/home',
  redirect: (context, state) {
    final isLoggedIn  = Supabase.instance.client.auth.currentUser != null;
    final loc         = state.matchedLocation;
    final isAuthPage  = loc == '/login' || loc == '/signup';

    if (!isLoggedIn && !isAuthPage) return '/login';
    if (isLoggedIn  &&  isAuthPage) return '/home';
    return null;
  },
  routes: [
    GoRoute(path: '/login',           builder: (_, __) => const LoginScreen()),
    GoRoute(path: '/signup',          builder: (_, __) => const SignupScreen()),
    GoRoute(path: '/home',            builder: (_, __) => const HomeScreen()),

    // Courses
    GoRoute(path: '/courses',         builder: (_, __) => const CourseCatalogScreen(targetRole: 'youth')),
    GoRoute(path: '/courses/teacher', builder: (_, __) => const CourseCatalogScreen(targetRole: 'teacher')),
    GoRoute(
      path: '/courses/:slug',
      builder: (_, state) => CourseDetailScreen(slug: state.pathParameters['slug']!),
    ),

    // Video player
    GoRoute(
      path: '/video/:lessonId',
      builder: (_, state) => VideoPlayerScreen(
        lessonId:        state.pathParameters['lessonId']!,
        courseId:        state.uri.queryParameters['courseId'] ?? '',
        title:           state.uri.queryParameters['title'] ?? '',
        videoUrl:        state.uri.queryParameters['videoUrl'],
        localPath:       state.uri.queryParameters['localPath'],
        initialWatchSecs: int.tryParse(state.uri.queryParameters['watchSecs'] ?? '0') ?? 0,
      ),
    ),

    GoRoute(path: '/downloads',       builder: (_, __) => const DownloadsScreen()),
    GoRoute(path: '/jobs',            builder: (_, __) => const JobsScreen()),
    GoRoute(path: '/profile',         builder: (_, __) => const ProfileScreen()),
    GoRoute(path: '/lesson-planner',  builder: (_, __) => const LessonPlannerScreen()),
  ],
);
