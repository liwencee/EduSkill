import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

/// SQLite database for offline progress, sync queue, and downloaded content metadata.
class LocalDatabase {
  static Database? _db;

  static Future<Database> get instance async {
    _db ??= await _init();
    return _db!;
  }

  static Future<Database> _init() async {
    final dbPath = await getDatabasesPath();
    return openDatabase(
      join(dbPath, 'skillbridge.db'),
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE lesson_progress (
            id            TEXT PRIMARY KEY,
            user_id       TEXT NOT NULL,
            lesson_id     TEXT NOT NULL,
            course_id     TEXT NOT NULL,
            watch_secs    INTEGER DEFAULT 0,
            is_completed  INTEGER DEFAULT 0,
            synced        INTEGER DEFAULT 0,
            updated_at    TEXT NOT NULL
          )
        ''');

        await db.execute('''
          CREATE TABLE sync_queue (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL,
            operation  TEXT NOT NULL,
            payload    TEXT NOT NULL,
            created_at TEXT NOT NULL,
            attempts   INTEGER DEFAULT 0
          )
        ''');

        await db.execute('''
          CREATE TABLE downloaded_courses (
            course_id    TEXT PRIMARY KEY,
            title        TEXT NOT NULL,
            size_kb      INTEGER DEFAULT 0,
            downloaded_at TEXT NOT NULL,
            video_paths  TEXT,
            status       TEXT DEFAULT 'complete'
          )
        ''');

        await db.execute('CREATE INDEX idx_progress_user ON lesson_progress(user_id)');
        await db.execute('CREATE INDEX idx_progress_synced ON lesson_progress(synced)');
      },
    );
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  static Future<void> upsertProgress({
    required String userId,
    required String lessonId,
    required String courseId,
    required int watchSecs,
    required bool isCompleted,
  }) async {
    final db = await instance;
    await db.insert('lesson_progress', {
      'id': '${userId}_$lessonId',
      'user_id': userId,
      'lesson_id': lessonId,
      'course_id': courseId,
      'watch_secs': watchSecs,
      'is_completed': isCompleted ? 1 : 0,
      'synced': 0,
      'updated_at': DateTime.now().toIso8601String(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  static Future<List<Map<String, dynamic>>> getUnsyncedProgress() async {
    final db = await instance;
    return db.query('lesson_progress', where: 'synced = 0');
  }

  static Future<void> markProgressSynced(String id) async {
    final db = await instance;
    await db.update('lesson_progress', {'synced': 1}, where: 'id = ?', whereArgs: [id]);
  }

  static Future<Map<String, dynamic>?> getLessonProgress(String userId, String lessonId) async {
    final db = await instance;
    final rows = await db.query('lesson_progress',
      where: 'user_id = ? AND lesson_id = ?', whereArgs: [userId, lessonId]);
    return rows.isNotEmpty ? rows.first : null;
  }

  // ── Downloads ─────────────────────────────────────────────────────────────

  static Future<void> saveDownload(String courseId, String title, int sizeKb, String videoPaths) async {
    final db = await instance;
    await db.insert('downloaded_courses', {
      'course_id': courseId, 'title': title, 'size_kb': sizeKb,
      'downloaded_at': DateTime.now().toIso8601String(), 'video_paths': videoPaths,
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  static Future<List<Map<String, dynamic>>> getDownloadedCourses() async {
    final db = await instance;
    return db.query('downloaded_courses', orderBy: 'downloaded_at DESC');
  }

  static Future<bool> isCourseDownloaded(String courseId) async {
    final db = await instance;
    final rows = await db.query('downloaded_courses', where: 'course_id = ?', whereArgs: [courseId]);
    return rows.isNotEmpty;
  }

  static Future<void> deleteDownload(String courseId) async {
    final db = await instance;
    await db.delete('downloaded_courses', where: 'course_id = ?', whereArgs: [courseId]);
  }
}
