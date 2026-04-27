import 'package:supabase_flutter/supabase_flutter.dart';
import '../local/database.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../core/constants.dart';

class CourseRepository {
  final SupabaseClient _supabase;
  CourseRepository(this._supabase);

  /// Fetch courses for SkillUp (youth) or EduPro (teacher).
  /// Returns cached Hive data when offline.
  Future<List<Map<String, dynamic>>> getCourses({
    required String targetRole,
    String? category,
    bool forceRemote = false,
  }) async {
    final cacheKey = 'courses_${targetRole}_${category ?? "all"}';
    final box = Hive.box(AppConstants.coursesBox);

    // Return cache immediately if offline or data is fresh (<15 min)
    final cached = box.get(cacheKey);
    final cachedAt = box.get('${cacheKey}_at') as DateTime?;
    final isFresh = cachedAt != null && DateTime.now().difference(cachedAt).inMinutes < 15;

    if (cached != null && (isFresh || !forceRemote)) {
      return List<Map<String, dynamic>>.from(
        (cached as List).map((e) => Map<String, dynamic>.from(e as Map)),
      );
    }

    try {
      var query = _supabase
          .from('courses')
          .select('*, instructor:profiles(full_name)')
          .eq('is_published', true)
          .eq('target_role', targetRole)
          .order('total_enrolled', ascending: false)
          .limit(AppConstants.pageSize);

      if (category != null) query = query.eq('category', category) as dynamic;

      final data = await query as List<dynamic>;
      final courses = data.map((e) => Map<String, dynamic>.from(e as Map)).toList();

      // Cache to Hive
      await box.put(cacheKey, courses);
      await box.put('${cacheKey}_at', DateTime.now());

      return courses;
    } catch (_) {
      // Offline fallback
      if (cached != null) {
        return List<Map<String, dynamic>>.from(
          (cached as List).map((e) => Map<String, dynamic>.from(e as Map)),
        );
      }
      return [];
    }
  }

  Future<Map<String, dynamic>?> getCourseDetail(String slug) async {
    final box = Hive.box(AppConstants.coursesBox);
    final cacheKey = 'course_detail_$slug';
    final cached = box.get(cacheKey);

    try {
      final data = await _supabase
          .from('courses')
          .select('*, instructor:profiles(full_name, bio, avatar_url)')
          .eq('slug', slug)
          .single();

      final modules = await _supabase
          .from('course_modules')
          .select('*, lessons(*)')
          .eq('course_id', data['id'])
          .order('order_index');

      final result = {...data, 'modules': modules};
      await box.put(cacheKey, result);
      return result;
    } catch (_) {
      return cached != null ? Map<String, dynamic>.from(cached as Map) : null;
    }
  }

  /// Track lesson progress locally first, sync when online.
  Future<void> trackProgress({
    required String userId,
    required String lessonId,
    required String courseId,
    required int watchSecs,
    required bool isCompleted,
  }) async {
    await LocalDatabase.upsertProgress(
      userId: userId,
      lessonId: lessonId,
      courseId: courseId,
      watchSecs: watchSecs,
      isCompleted: isCompleted,
    );
  }

  /// Sync all unsynced progress rows to Supabase.
  Future<void> syncProgress() async {
    final unsynced = await LocalDatabase.getUnsyncedProgress();
    if (unsynced.isEmpty) return;

    for (final row in unsynced) {
      try {
        await _supabase.from('lesson_progress').upsert({
          'user_id':      row['user_id'],
          'lesson_id':    row['lesson_id'],
          'course_id':    row['course_id'],
          'watch_secs':   row['watch_secs'],
          'is_completed': row['is_completed'] == 1,
          'last_watched_at': row['updated_at'],
        });
        await LocalDatabase.markProgressSynced(row['id'] as String);
      } catch (_) {
        // Leave for next sync cycle
      }
    }
  }

  Future<bool> isEnrolled(String userId, String courseId) async {
    try {
      final data = await _supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();
      return data != null;
    } catch (_) {
      return false;
    }
  }

  Future<void> enroll(String userId, String courseId) async {
    await _supabase.from('enrollments').upsert({
      'user_id': userId,
      'course_id': courseId,
    });
  }
}
