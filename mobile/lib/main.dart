import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:provider/provider.dart';

import 'core/constants.dart';
import 'core/theme.dart';
import 'core/router.dart';
import 'core/network_monitor.dart';
import 'data/repositories/course_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait (landscape only during video — handled per-screen)
  await SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

  // Status bar matches 30% blue nav colour
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(AppColors.blue),
    statusBarIconBrightness: Brightness.light,
  ));

  // Initialise Supabase
  await Supabase.initialize(
    url:     const String.fromEnvironment('SUPABASE_URL',      defaultValue: 'https://your-project.supabase.co'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'your-anon-key'),
  );

  // Initialise Hive (offline cache)
  await Hive.initFlutter();
  await Future.wait([
    Hive.openBox(AppConstants.coursesBox),
    Hive.openBox(AppConstants.profileBox),
    Hive.openBox(AppConstants.progressBox),
    Hive.openBox(AppConstants.downloadsBox),
    Hive.openBox(AppConstants.syncQueueBox),
  ]);

  runApp(const SkillBridgeApp());
}

class SkillBridgeApp extends StatelessWidget {
  const SkillBridgeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => NetworkMonitor()),
        Provider(create: (_) => CourseRepository(Supabase.instance.client)),
      ],
      child: MaterialApp.router(
        title: 'SkillBridge Nigeria',
        debugShowCheckedModeBanner: false,
        theme: appTheme,
        routerConfig: appRouter,
      ),
    );
  }
}
