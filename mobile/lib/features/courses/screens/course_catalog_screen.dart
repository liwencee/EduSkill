import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants.dart';
import '../../../core/network_monitor.dart';
import '../../../data/repositories/course_repository.dart';
import '../../downloads/screens/downloads_screen.dart';

class CourseCatalogScreen extends StatefulWidget {
  final String targetRole; // 'youth' or 'teacher'
  const CourseCatalogScreen({super.key, this.targetRole = 'youth'});

  @override
  State<CourseCatalogScreen> createState() => _CourseCatalogScreenState();
}

class _CourseCatalogScreenState extends State<CourseCatalogScreen> {
  late Future<List<Map<String, dynamic>>> _coursesFuture;
  String? _selectedCategory;

  static const _categories = [
    {'value': null,                 'label': 'All'},
    {'value': 'digital_marketing',  'label': 'Digital Marketing'},
    {'value': 'coding',             'label': 'Coding'},
    {'value': 'fashion_design',     'label': 'Fashion'},
    {'value': 'solar_tech',         'label': 'Solar Tech'},
    {'value': 'agribusiness',       'label': 'Agribusiness'},
    {'value': 'financial_literacy', 'label': 'Finance'},
  ];

  @override
  void initState() {
    super.initState();
    _loadCourses();
  }

  void _loadCourses() {
    final repo = context.read<CourseRepository>();
    _coursesFuture = repo.getCourses(
      targetRole: widget.targetRole,
      category: _selectedCategory,
    );
  }

  @override
  Widget build(BuildContext context) {
    final network = context.watch<NetworkMonitor>();
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.targetRole == 'teacher' ? 'CPD Courses' : 'SkillUp Courses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_outlined),
            onPressed: () => context.push('/downloads'),
            tooltip: 'My Downloads',
          ),
        ],
      ),
      body: Column(
        children: [
          // Offline banner
          if (!network.isOnline)
            Container(
              width: double.infinity,
              color: const Color(AppColors.blueLight),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  const Icon(Icons.offline_bolt_rounded, size: 14, color: Color(AppColors.blue)),
                  const SizedBox(width: 6),
                  const Expanded(
                    child: Text('You\'re offline — showing downloaded courses',
                      style: TextStyle(fontSize: 12, color: Color(AppColors.blue), fontWeight: FontWeight.w500)),
                  ),
                ],
              ),
            ),

          // Category filter chips
          SizedBox(
            height: 50,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final cat = _categories[i];
                final selected = _selectedCategory == cat['value'];
                return FilterChip(
                  label: Text(cat['label'] as String, style: TextStyle(fontSize: 12, color: selected ? Colors.white : const Color(AppColors.ink))),
                  selected: selected,
                  selectedColor: const Color(AppColors.blue),
                  backgroundColor: Colors.white,
                  side: BorderSide(color: selected ? const Color(AppColors.blue) : Colors.grey.shade200),
                  onSelected: (_) {
                    setState(() { _selectedCategory = cat['value'] as String?; _loadCourses(); });
                  },
                );
              },
            ),
          ),

          // Course list
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _coursesFuture,
              builder: (context, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                final courses = snap.data ?? [];
                if (courses.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.school_outlined, size: 64, color: Colors.grey.shade300),
                        const SizedBox(height: 12),
                        Text('No courses found', style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        Text('Check your internet connection', style: TextStyle(color: Colors.grey.shade400, fontSize: 13)),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async { setState(_loadCourses); },
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: courses.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, i) => _CourseCard(course: courses[i]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CourseCard extends StatelessWidget {
  final Map<String, dynamic> course;
  const _CourseCard({required this.course});

  static const _categoryEmojis = {
    'digital_marketing': '📱', 'coding': '💻', 'fashion_design': '👗',
    'solar_tech': '☀️', 'agribusiness': '🌱', 'financial_literacy': '💰',
    'digital_classroom': '🏫', 'vocational_teaching': '🎓',
    'inclusive_education': '🤝', 'entrepreneurship': '🚀',
  };

  @override
  Widget build(BuildContext context) {
    final emoji = _categoryEmojis[course['category']] ?? '📚';
    final isFree = course['is_free'] as bool? ?? false;
    final isOffline = course['is_offline_ready'] as bool? ?? false;

    return GestureDetector(
      onTap: () => context.push('/courses/${course['slug']}'),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Emoji thumbnail
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(
                  color: const Color(AppColors.blueLight),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(child: Text(emoji, style: const TextStyle(fontSize: 26))),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (isFree) _Chip('FREE', Colors.amber.shade700, Colors.amber.shade50),
                        if (isOffline) ...[const SizedBox(width: 6), _Chip('Offline', const Color(AppColors.blue), const Color(AppColors.blueLight))],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(course['title'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text(course['description'] as String? ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade500), maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.schedule, size: 12, color: Colors.grey.shade400),
                        const SizedBox(width: 3),
                        Text('${course['duration_weeks']}w', style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                        const SizedBox(width: 12),
                        Icon(Icons.people_outline, size: 12, color: Colors.grey.shade400),
                        const SizedBox(width: 3),
                        Text('${(course['total_enrolled'] as int? ?? 0).toString()} enrolled',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade400)),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color textColor;
  final Color bgColor;
  const _Chip(this.label, this.textColor, this.bgColor);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(4)),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: textColor)),
    );
  }
}
