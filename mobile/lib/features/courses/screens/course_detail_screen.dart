import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants.dart';
import '../../../core/network_monitor.dart';
import '../../../data/local/database.dart';
import '../../../data/repositories/course_repository.dart';

class CourseDetailScreen extends StatefulWidget {
  final String slug;
  const CourseDetailScreen({super.key, required this.slug});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  Map<String, dynamic>? _course;
  bool _loading     = true;
  bool _isEnrolled  = false;
  bool _isDownloaded = false;
  bool _enrolling   = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final repo   = context.read<CourseRepository>();
    final course = await repo.getCourseDetail(widget.slug);
    final user   = Supabase.instance.client.auth.currentUser;

    bool enrolled   = false;
    bool downloaded = false;

    if (course != null && user != null) {
      enrolled   = await repo.isEnrolled(user.id, course['id'] as String);
      downloaded = await LocalDatabase.isCourseDownloaded(course['id'] as String);
    }

    if (mounted) {
      setState(() {
        _course      = course;
        _isEnrolled  = enrolled;
        _isDownloaded = downloaded;
        _loading     = false;
      });
    }
  }

  Future<void> _enroll() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) { context.go('/login'); return; }
    setState(() => _enrolling = true);
    await context.read<CourseRepository>().enroll(user.id, _course!['id'] as String);
    setState(() { _isEnrolled = true; _enrolling = false; });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🎉 Enrolled! Start learning below.')),
      );
    }
  }

  static const _langLabels = {'en': 'English', 'yo': 'Yoruba', 'ig': 'Igbo', 'ha': 'Hausa', 'pcm': 'Pidgin'};
  static const _categoryEmojis = {
    'digital_marketing': '📱', 'coding': '💻', 'fashion_design': '👗',
    'solar_tech': '☀️', 'agribusiness': '🌱', 'financial_literacy': '💰',
    'digital_classroom': '🏫', 'vocational_teaching': '🎓',
    'inclusive_education': '🤝', 'entrepreneurship': '🚀',
  };

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: const Color(AppColors.bg),
        appBar: AppBar(title: const Text('Loading…')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (_course == null) {
      return Scaffold(
        backgroundColor: const Color(AppColors.bg),
        appBar: AppBar(title: const Text('Course not found')),
        body: const Center(child: Text('Could not load this course.')),
      );
    }

    final c         = _course!;
    final network   = context.watch<NetworkMonitor>();
    final isFree    = c['is_free'] as bool? ?? false;
    final isOffline = c['is_offline_ready'] as bool? ?? false;
    final langs     = (c['available_langs'] as List<dynamic>?)?.map((l) => _langLabels[l] ?? l.toString()).join(', ') ?? 'English';
    final emoji     = _categoryEmojis[c['category']] ?? '📚';
    final modules   = c['modules'] as List<dynamic>? ?? [];

    return Scaffold(
      backgroundColor: const Color(AppColors.bg),
      body: CustomScrollView(
        slivers: [
          // ── Hero app bar — 30% blue ─────────────────────────────────
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: const Color(AppColors.blue),
            flexibleSpace: FlexibleSpaceBar(
              title: Text(c['title'] as String? ?? '',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                maxLines: 1, overflow: TextOverflow.ellipsis),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(AppColors.blue), Color(AppColors.blueDark)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 32),
                      Text(emoji, style: const TextStyle(fontSize: 64)),
                      const SizedBox(height: 8),
                      // 10% amber offline badge
                      if (isOffline)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(AppColors.amber),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text('Offline Available',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(AppColors.ink))),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Meta card — white surface ───────────────────────
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE0DDD5)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(c['title'] as String? ?? '',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(AppColors.ink))),
                      const SizedBox(height: 8),
                      Text(c['description'] as String? ?? '',
                        style: const TextStyle(fontSize: 13, color: Color(AppColors.inkMid), height: 1.5)),
                      const SizedBox(height: 12),

                      // Stats row
                      Wrap(
                        spacing: 12, runSpacing: 6,
                        children: [
                          _MetaChip(Icons.schedule_rounded, '${c['duration_weeks']} weeks'),
                          _MetaChip(Icons.people_outline_rounded, '${(c['total_enrolled'] as int? ?? 0).toLocaleString()} enrolled'),
                          _MetaChip(Icons.translate_rounded, langs),
                          if (isFree) _MetaChip(Icons.money_off_rounded, 'Free', color: const Color(AppColors.amber)),
                        ],
                      ),
                    ],
                  ),
                ),

                // ── Enrol / Download bar ────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      Expanded(
                        child: _isEnrolled
                            ? OutlinedButton.icon(
                                icon: const Icon(Icons.play_circle_outline_rounded),
                                label: const Text('Continue'),
                                onPressed: () {},
                              )
                            : ElevatedButton(
                                onPressed: _enrolling ? null : _enroll,
                                child: _enrolling
                                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                                    : Text(isFree ? 'Enrol Free' : 'Enrol Now'),
                              ),
                      ),
                      if (isOffline && _isEnrolled) ...[
                        const SizedBox(width: 10),
                        // 10% amber download button
                        OutlinedButton.icon(
                          icon: Icon(
                            _isDownloaded ? Icons.download_done_rounded : Icons.download_rounded,
                            color: const Color(AppColors.amber),
                          ),
                          label: Text(
                            _isDownloaded ? 'Downloaded' : 'Download',
                            style: const TextStyle(color: Color(AppColors.amber)),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(AppColors.amber)),
                          ),
                          onPressed: _isDownloaded ? null : () => _showDownloadDialog(),
                        ),
                      ],
                    ],
                  ),
                ),

                // ── What you'll learn ───────────────────────────────
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 20, 16, 8),
                  child: Text('What you\'ll learn',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(AppColors.ink))),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Wrap(
                    spacing: 8, runSpacing: 8,
                    children: (c['tags'] as List<dynamic>? ?? []).map((tag) =>
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(AppColors.blueLight),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(tag.toString(),
                          style: const TextStyle(fontSize: 12, color: Color(AppColors.blue), fontWeight: FontWeight.w500)),
                      ),
                    ).toList(),
                  ),
                ),

                // ── Curriculum ──────────────────────────────────────
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 20, 16, 8),
                  child: Text('Course Curriculum',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(AppColors.ink))),
                ),

                if (modules.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('Curriculum coming soon.', style: TextStyle(color: Color(AppColors.inkLight))),
                  )
                else
                  ...modules.map((mod) {
                    final m       = mod as Map<String, dynamic>;
                    final lessons = (m['lessons'] as List<dynamic>?) ?? [];
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE0DDD5)),
                      ),
                      child: ExpansionTile(
                        iconColor: const Color(AppColors.blue),
                        collapsedIconColor: const Color(AppColors.inkLight),
                        title: Text(m['title'] as String? ?? '',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Color(AppColors.ink))),
                        subtitle: Text('${lessons.length} lessons', style: const TextStyle(fontSize: 12, color: Color(AppColors.inkLight))),
                        children: lessons.map((lesson) {
                          final l         = lesson as Map<String, dynamic>;
                          final isFreeP   = l['is_free_preview'] as bool? ?? false;
                          final canWatch  = isFreeP || _isEnrolled;
                          final durationS = l['video_duration_secs'] as int? ?? 0;

                          return ListTile(
                            dense: true,
                            leading: Icon(
                              canWatch ? Icons.play_circle_filled_rounded : Icons.lock_rounded,
                              color: canWatch ? const Color(AppColors.blue) : const Color(AppColors.inkLight),
                              size: 20,
                            ),
                            title: Text(l['title'] as String? ?? '',
                              style: TextStyle(
                                fontSize: 13,
                                color: canWatch ? const Color(AppColors.ink) : const Color(AppColors.inkLight),
                              )),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (isFreeP)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(AppColors.amber).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text('Preview',
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(AppColors.amber))),
                                  ),
                                if (durationS > 0) ...[
                                  const SizedBox(width: 6),
                                  Text('${(durationS / 60).round()}m',
                                    style: const TextStyle(fontSize: 11, color: Color(AppColors.inkLight))),
                                ],
                              ],
                            ),
                            onTap: canWatch
                                ? () => context.push(
                                    '/video/${l['id']}?courseId=${c['id']}&title=${Uri.encodeComponent(l['title'] ?? '')}')
                                : null,
                          );
                        }).toList(),
                      ),
                    );
                  }).toList(),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showDownloadDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Download for Offline'),
        content: const Text('Download this course to watch without internet. Best done on WiFi to save data.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              // In production: trigger flutter_downloader for all lesson bundles
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Download started — we\'ll notify you when ready.')),
              );
            },
            child: const Text('Download Now'),
          ),
        ],
      ),
    );
  }
}

class _MetaChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? color;
  const _MetaChip(this.icon, this.label, {this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? const Color(AppColors.inkMid);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: c),
        const SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 12, color: c, fontWeight: FontWeight.w500)),
      ],
    );
  }
}

extension on int {
  String toLocaleString() {
    final s = toString();
    final result = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) result.write(',');
      result.write(s[i]);
    }
    return result.toString();
  }
}
