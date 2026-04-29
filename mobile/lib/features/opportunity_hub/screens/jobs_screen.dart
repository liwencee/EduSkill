import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants.dart';
import '../../../core/network_monitor.dart';
import 'package:provider/provider.dart';

class JobsScreen extends StatefulWidget {
  const JobsScreen({super.key});
  @override
  State<JobsScreen> createState() => _JobsScreenState();
}

class _JobsScreenState extends State<JobsScreen> {
  List<Map<String, dynamic>> _jobs = [];
  bool _loading = true;
  String _selectedType = '';
  final _searchCtrl = TextEditingController();

  static const _jobTypes = {
    '':              'All',
    'full_time':     'Full-time',
    'apprenticeship':'Apprenticeship',
    'freelance':     'Freelance',
    'part_time':     'Part-time',
    'internship':    'Internship',
  };

  @override
  void initState() { super.initState(); _fetchJobs(); }

  @override
  void dispose() { _searchCtrl.dispose(); super.dispose(); }

  Future<void> _fetchJobs() async {
    setState(() => _loading = true);
    try {
      var q = Supabase.instance.client
          .from('job_listings')
          .select('*, employer:profiles(full_name)')
          .eq('is_active', true)
          .order('is_featured', ascending: false)
          .order('created_at', ascending: false)
          .limit(30);

      if (_selectedType.isNotEmpty) q = q.eq('job_type', _selectedType) as dynamic;

      final data = await q as List<dynamic>;
      if (mounted) {
        setState(() {
          _jobs   = data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _apply(String jobId, String jobTitle) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    try {
      await Supabase.instance.client.from('job_applications').insert({
        'job_id': jobId, 'applicant_id': user.id,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Applied to "$jobTitle" ✅')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Already applied or an error occurred.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final network = context.watch<NetworkMonitor>();

    return Scaffold(
      backgroundColor: const Color(AppColors.bg),
      appBar: AppBar(
        title: const Text('OpportunityHub'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
            child: TextField(
              controller: _searchCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search jobs, skills, companies…',
                hintStyle: const TextStyle(color: Colors.white54),
                prefixIcon: const Icon(Icons.search_rounded, color: Colors.white70),
                filled: true,
                fillColor: Colors.white.withOpacity(0.15),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
              onSubmitted: (_) => _fetchJobs(),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Offline banner
          if (!network.isOnline)
            Container(
              color: const Color(AppColors.blueLight),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: const Row(
                children: [
                  Icon(Icons.wifi_off_rounded, size: 13, color: Color(AppColors.blue)),
                  SizedBox(width: 6),
                  Text('Offline — job listings may be outdated', style: TextStyle(fontSize: 12, color: Color(AppColors.blue))),
                ],
              ),
            ),

          // Job type filter chips
          SizedBox(
            height: 50,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              children: _jobTypes.entries.map((e) {
                final selected = _selectedType == e.key;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(e.value, style: TextStyle(fontSize: 12, color: selected ? Colors.white : const Color(AppColors.ink))),
                    selected: selected,
                    selectedColor: const Color(AppColors.blue),
                    backgroundColor: Colors.white,
                    side: BorderSide(color: selected ? const Color(AppColors.blue) : const Color(0xFFE0DDD5)),
                    onSelected: (_) {
                      setState(() => _selectedType = e.key);
                      _fetchJobs();
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Jobs list
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _jobs.isEmpty
                    ? _EmptyState()
                    : RefreshIndicator(
                        onRefresh: _fetchJobs,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(12),
                          itemCount: _jobs.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (_, i) => _JobCard(job: _jobs[i], onApply: _apply),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  final Map<String, dynamic> job;
  final Future<void> Function(String, String) onApply;
  const _JobCard({required this.job, required this.onApply});

  static const _typeLabels = {
    'full_time': 'Full-time', 'part_time': 'Part-time',
    'apprenticeship': 'Apprenticeship', 'freelance': 'Freelance', 'internship': 'Internship',
  };

  @override
  Widget build(BuildContext context) {
    final isFeatured = job['is_featured'] as bool? ?? false;
    final type       = _typeLabels[job['job_type']] ?? job['job_type'] as String? ?? '';
    final skills     = (job['required_skills'] as List<dynamic>?)?.take(3).toList() ?? [];
    final salMin     = job['salary_min_ngn'] as num?;
    final salMax     = job['salary_max_ngn'] as num?;
    final deadline   = job['deadline'] as String?;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isFeatured ? const Color(AppColors.amber) : const Color(0xFFE0DDD5), width: isFeatured ? 1.5 : 1),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(job['title'] as String? ?? '',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(AppColors.ink))),
                      const SizedBox(height: 2),
                      Text(job['company_name'] as String? ?? '',
                        style: const TextStyle(fontSize: 13, color: Color(AppColors.inkMid))),
                    ],
                  ),
                ),
                if (isFeatured)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(AppColors.amber).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(AppColors.amber).withOpacity(0.4)),
                    ),
                    child: const Text('Featured', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(AppColors.amber))),
                  ),
              ],
            ),
            const SizedBox(height: 10),

            // Meta chips
            Wrap(
              spacing: 8, runSpacing: 6,
              children: [
                _MetaTag(Icons.work_outline_rounded, type, const Color(AppColors.blue)),
                if ((job['location_state'] as String?)?.isNotEmpty == true)
                  _MetaTag(Icons.location_on_outlined, job['location_state'] as String, const Color(AppColors.inkMid)),
                if (job['is_remote'] as bool? == true)
                  _MetaTag(Icons.public_rounded, 'Remote', const Color(AppColors.inkMid)),
                if (salMin != null)
                  _MetaTag(Icons.payments_outlined,
                    '₦${_fmt(salMin.toInt())}–₦${_fmt((salMax ?? salMin).toInt())}/mo',
                    const Color(AppColors.inkMid)),
              ],
            ),

            // Skills
            if (skills.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6, runSpacing: 4,
                children: skills.map((s) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(AppColors.bg),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFD5D2C8)),
                  ),
                  child: Text(s.toString(), style: const TextStyle(fontSize: 11, color: Color(AppColors.inkMid))),
                )).toList(),
              ),
            ],

            if (deadline != null) ...[
              const SizedBox(height: 6),
              Text('Deadline: $deadline', style: const TextStyle(fontSize: 11, color: Color(AppColors.inkLight))),
            ],

            const SizedBox(height: 12),
            // CTA — 10% amber
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => onApply(job['id'] as String, job['title'] as String? ?? ''),
                child: const Text('Apply Now'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _fmt(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000)    return '${(n / 1000).toStringAsFixed(0)}K';
    return n.toString();
  }
}

class _MetaTag extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _MetaTag(this.icon, this.label, this.color);

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 12, color: color),
      const SizedBox(width: 3),
      Text(label, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
    ],
  );
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.work_off_outlined, size: 72, color: const Color(AppColors.inkLight).withOpacity(0.4)),
          const SizedBox(height: 16),
          const Text('No jobs found', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: Color(AppColors.ink))),
          const SizedBox(height: 8),
          const Text('Try a different filter or check back later.', textAlign: TextAlign.center,
            style: TextStyle(color: Color(AppColors.inkMid), fontSize: 13)),
        ],
      ),
    ),
  );
}
