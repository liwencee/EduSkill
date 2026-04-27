class AppColors {
  // 60% — Dominant background (warm cream)
  static const int bg        = 0xFFF1EFE8;
  static const int bgAlt     = 0xFFE8E5DC;

  // 30% — Structural / headers (blue)
  static const int blue      = 0xFF378ADD;
  static const int blueDark  = 0xFF1e4f8a;
  static const int blueLight = 0xFFEBF4FF;

  // 10% — Accent / CTA (amber)
  static const int amber     = 0xFFEF9F27;
  static const int amberDark = 0xFFC97E0A;

  // Text
  static const int ink       = 0xFF2C2C2A;
  static const int inkMid    = 0xFF5A5A58;
  static const int inkLight  = 0xFF9A9A97;

  // White surfaces
  static const int surface   = 0xFFFFFFFF;
}

class AppConstants {
  static const String appName       = 'SkillBridge Nigeria';
  static const String supabaseUrl   = String.fromEnvironment('SUPABASE_URL');
  static const String supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');

  // Offline / download limits
  static const int maxOfflineMB         = 2048;
  static const int videoCompressionKbps = 400;   // 2G-friendly
  static const int syncIntervalMinutes  = 15;

  // Pagination
  static const int pageSize = 10;

  // Hive box names
  static const String profileBox   = 'profile_box';
  static const String coursesBox   = 'courses_box';
  static const String progressBox  = 'progress_box';
  static const String downloadsBox = 'downloads_box';
  static const String syncQueueBox = 'sync_queue_box';
}
