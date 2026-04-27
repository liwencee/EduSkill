import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants.dart';

class LessonPlannerScreen extends StatefulWidget {
  const LessonPlannerScreen({super.key});
  @override
  State<LessonPlannerScreen> createState() => _LessonPlannerScreenState();
}

class _LessonPlannerScreenState extends State<LessonPlannerScreen> {
  final _subjectCtrl    = TextEditingController();
  final _topicCtrl      = TextEditingController();
  final _objectivesCtrl = TextEditingController();

  String _grade    = 'SSS 1';
  String _duration = '45 minutes';
  bool _loading    = false;
  Map<String, dynamic>? _plan;

  static const _grades = ['Primary 1–3','Primary 4–6','JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3','TVET Level 1','TVET Level 2'];
  static const _durations = ['35 minutes','40 minutes','45 minutes','60 minutes','90 minutes','2 hours'];
  static const _subjects = ['Mathematics','English Language','Basic Science','Agricultural Science','Technical Drawing',
    'Computer Studies','Digital Skills','Business Studies','Vocational Technology','Home Economics','Physical Education'];

  @override
  void dispose() { _subjectCtrl.dispose(); _topicCtrl.dispose(); _objectivesCtrl.dispose(); super.dispose(); }

  Future<void> _generate() async {
    if (_subjectCtrl.text.trim().isEmpty || _topicCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter subject and topic first.')));
      return;
    }

    // Get auth token for API call
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) return;

    setState(() { _loading = true; _plan = null; });

    try {
      const baseUrl = String.fromEnvironment('NEXT_PUBLIC_APP_URL', defaultValue: 'http://localhost:3000');
      final res = await Dio().post(
        '$baseUrl/api/lesson-plan',
        data: {
          'subject':    _subjectCtrl.text.trim(),
          'topic':      _topicCtrl.text.trim(),
          'grade':      _grade,
          'duration':   _duration,
          'objectives': _objectivesCtrl.text.trim(),
        },
        options: Options(
          headers: {'Authorization': 'Bearer ${session.accessToken}', 'Content-Type': 'application/json'},
          receiveTimeout: const Duration(seconds: 30),
        ),
      );
      if (mounted) setState(() { _plan = Map<String, dynamic>.from(res.data['plan'] as Map); _loading = false; });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not generate plan. Check your connection.')));
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppColors.bg),
      appBar: AppBar(title: const Text('AI Lesson Planner')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Intro card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(AppColors.blueLight),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(AppColors.blue).withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.auto_awesome_rounded, color: Color(AppColors.blue), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text('Aligned to the Nigerian NERDC curriculum.\nFill in the details and get a full lesson plan in seconds.',
                      style: TextStyle(fontSize: 12, color: Color(AppColors.blue), height: 1.4)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Form card — white surface
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE0DDD5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Subject dropdown
                  const Text('Subject', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(AppColors.ink))),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<String>(
                    hint: const Text('Select subject…'),
                    items: _subjects.map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 13)))).toList(),
                    onChanged: (v) => _subjectCtrl.text = v ?? '',
                    decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10)),
                  ),
                  const SizedBox(height: 14),

                  // Topic
                  const Text('Topic / Lesson Title', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(AppColors.ink))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _topicCtrl,
                    decoration: const InputDecoration(hintText: 'e.g. Photosynthesis, Fractions, Ohm\'s Law'),
                  ),
                  const SizedBox(height: 14),

                  // Grade + Duration row
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Grade Level', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(AppColors.ink))),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: _grade,
                              items: _grades.map((g) => DropdownMenuItem(value: g, child: Text(g, style: const TextStyle(fontSize: 12)))).toList(),
                              onChanged: (v) => setState(() => _grade = v ?? _grade),
                              decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Duration', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(AppColors.ink))),
                            const SizedBox(height: 6),
                            DropdownButtonFormField<String>(
                              value: _duration,
                              items: _durations.map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontSize: 12)))).toList(),
                              onChanged: (v) => setState(() => _duration = v ?? _duration),
                              decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Objectives (optional)
                  const Text('Key Objectives (optional)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(AppColors.ink))),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _objectivesCtrl,
                    maxLines: 3,
                    decoration: const InputDecoration(hintText: 'What should students know or do by end of lesson?'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Generate — 10% amber CTA
            ElevatedButton.icon(
              onPressed: _loading ? null : _generate,
              icon: _loading
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(AppColors.ink)))
                  : const Icon(Icons.auto_awesome_rounded),
              label: Text(_loading ? 'Generating…' : 'Generate Lesson Plan'),
              style: ElevatedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
            ),

            // ── Output ────────────────────────────────────────────
            if (_plan != null) ...[
              const SizedBox(height: 24),
              _PlanSection('📋 Overview', _plan!['overview'] as String? ?? ''),
              _PlanList('🎯 Learning Objectives', (_plan!['learning_objectives'] as List<dynamic>?)?.cast<String>() ?? []),
              _PlanChips('🛠 Materials Needed', (_plan!['materials_needed'] as List<dynamic>?)?.cast<String>() ?? []),
              _PlanSection('🚀 Introduction',
                '${(_plan!['introduction'] as Map?)?['duration'] ?? ''}\n${(_plan!['introduction'] as Map?)?['activity'] ?? ''}'),
              _PlanSteps('📚 Main Activity',
                ((_plan!['main_activity'] as Map?)?['duration'] as String?) ?? '',
                ((_plan!['main_activity'] as Map?)?['steps'] as List<dynamic>?)?.cast<String>() ?? []),
              _PlanSection('✅ Assessment',
                '${(_plan!['assessment'] as Map?)?['type'] ?? ''}: ${(_plan!['assessment'] as Map?)?['description'] ?? ''}'),
              _PlanSection('🔚 Closure',
                '${(_plan!['closure'] as Map?)?['duration'] ?? ''}\n${(_plan!['closure'] as Map?)?['activity'] ?? ''}'),
              _PlanSection('🤝 Support (Struggling Learners)', (_plan!['differentiation'] as Map?)?['support'] as String? ?? ''),
              _PlanSection('🚀 Extension (Advanced Learners)', (_plan!['differentiation'] as Map?)?['extension'] as String? ?? ''),
              if (_plan!['homework'] != null && _plan!['homework'].toString().isNotEmpty)
                _PlanSection('📝 Homework', _plan!['homework'].toString()),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.save_outlined),
                label: const Text('Save to My Lesson Plans'),
                style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 46)),
              ),
              const SizedBox(height: 32),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Plan output widgets ──────────────────────────────────────────────────────

class _PlanSection extends StatelessWidget {
  final String title;
  final String body;
  const _PlanSection(this.title, this.body);

  @override
  Widget build(BuildContext context) => _card(
    title,
    Text(body.trim(), style: const TextStyle(fontSize: 13, color: Color(AppColors.inkMid), height: 1.5)),
  );
}

class _PlanList extends StatelessWidget {
  final String title;
  final List<String> items;
  const _PlanList(this.title, this.items);

  @override
  Widget build(BuildContext context) => _card(title,
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.asMap().entries.map((e) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 20, height: 20,
              margin: const EdgeInsets.only(right: 8, top: 1),
              decoration: BoxDecoration(color: const Color(AppColors.blue), shape: BoxShape.circle),
              child: Center(child: Text('${e.key + 1}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white))),
            ),
            Expanded(child: Text(e.value, style: const TextStyle(fontSize: 13, color: Color(AppColors.inkMid), height: 1.4))),
          ],
        ),
      )).toList(),
    ),
  );
}

class _PlanChips extends StatelessWidget {
  final String title;
  final List<String> items;
  const _PlanChips(this.title, this.items);

  @override
  Widget build(BuildContext context) => _card(title,
    Wrap(
      spacing: 8, runSpacing: 6,
      children: items.map((m) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(color: const Color(AppColors.blueLight), borderRadius: BorderRadius.circular(8)),
        child: Text(m, style: const TextStyle(fontSize: 12, color: Color(AppColors.blue), fontWeight: FontWeight.w500)),
      )).toList(),
    ),
  );
}

class _PlanSteps extends StatelessWidget {
  final String title;
  final String duration;
  final List<String> steps;
  const _PlanSteps(this.title, this.duration, this.steps);

  @override
  Widget build(BuildContext context) => _card(title,
    Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (duration.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: const Color(AppColors.amber).withOpacity(0.12), borderRadius: BorderRadius.circular(6)),
            child: Text(duration, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(AppColors.amber))),
          ),
        ...steps.asMap().entries.map((e) => Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('•  ', style: TextStyle(color: Color(AppColors.blue), fontWeight: FontWeight.w700)),
              Expanded(child: Text(e.value, style: const TextStyle(fontSize: 13, color: Color(AppColors.inkMid), height: 1.4))),
            ],
          ),
        )),
      ],
    ),
  );
}

Widget _card(String title, Widget child) => Container(
  margin: const EdgeInsets.only(bottom: 12),
  padding: const EdgeInsets.all(14),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: const Color(0xFFE0DDD5)),
  ),
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Color(AppColors.ink))),
      const SizedBox(height: 8),
      child,
    ],
  ),
);
