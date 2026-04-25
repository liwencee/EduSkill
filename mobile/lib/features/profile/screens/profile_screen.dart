import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  List<Map<String, dynamic>> _certs = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) { context.go('/login'); return; }
    try {
      final profile = await Supabase.instance.client
          .from('profiles').select().eq('id', user.id).single();
      final certs = await Supabase.instance.client
          .from('certificates')
          .select('*, course:courses(title)')
          .eq('user_id', user.id)
          .order('issued_at', ascending: false);
      if (mounted) setState(() { _profile = profile; _certs = List<Map<String, dynamic>>.from(certs as List); _loading = false; });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  Future<void> _signOut() async {
    await Supabase.instance.client.auth.signOut();
    if (mounted) context.go('/login');
  }

  static const _roleLabels = {'youth': '🎓 Youth Learner', 'teacher': '👨‍🏫 Teacher', 'employer': '💼 Employer', 'admin': '🔧 Admin'};
  static const _planLabels  = {'free': 'Free Plan', 'youth_premium': 'Youth Premium', 'teacher_premium': 'Teacher Premium', 'institutional': 'Institutional'};

  @override
  Widget build(BuildContext context) {
    if (_loading) return Scaffold(backgroundColor: const Color(AppColors.bg), appBar: AppBar(title: const Text('Profile')), body: const Center(child: CircularProgressIndicator()));

    final name  = _profile?['full_name'] as String? ?? 'User';
    final email = _profile?['email']     as String? ?? '';
    final role  = _profile?['role']      as String? ?? 'youth';
    final plan  = _profile?['subscription'] as String? ?? 'free';
    final state = _profile?['state']     as String?;
    final initials = name.split(' ').where((w) => w.isNotEmpty).map((w) => w[0]).take(2).join().toUpperCase();

    return Scaffold(
      backgroundColor: const Color(AppColors.bg),
      appBar: AppBar(
        title: const Text('My Profile'),
        actions: [
          IconButton(icon: const Icon(Icons.edit_outlined), onPressed: () {}, tooltip: 'Edit Profile'),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // ── Header — 30% blue ───────────────────────────────────
            Container(
              width: double.infinity,
              color: const Color(AppColors.blue),
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
              child: Column(
                children: [
                  // Avatar
                  Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(AppColors.amber),
                    ),
                    child: Center(child: Text(initials, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(AppColors.ink)))),
                  ),
                  const SizedBox(height: 12),
                  Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
                  const SizedBox(height: 4),
                  Text(email, style: const TextStyle(fontSize: 13, color: Colors.white70)),
                  const SizedBox(height: 8),
                  // Role + plan pills
                  Wrap(
                    spacing: 8,
                    children: [
                      _Pill(_roleLabels[role] ?? role, Colors.white.withOpacity(0.2), Colors.white),
                      _Pill(_planLabels[plan] ?? plan,
                        plan == 'free' ? Colors.white.withOpacity(0.15) : const Color(AppColors.amber).withOpacity(0.25),
                        plan == 'free' ? Colors.white70 : const Color(AppColors.amber)),
                    ],
                  ),
                ],
              ),
            ),

            // ── Stats row — white surface ───────────────────────────
            Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _Stat('Courses', '3'),
                  _divider(),
                  _Stat('Certificates', '${_certs.length}'),
                  _divider(),
                  _Stat('Streak', '7 days'),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Certificates ────────────────────────────────────────
            if (_certs.isNotEmpty) ...[
              _SectionHeader('My Certificates'),
              ..._certs.map((c) => _CertCard(cert: c)),
              const SizedBox(height: 4),
            ],

            // ── Settings list ───────────────────────────────────────
            _SectionHeader('Account'),
            _SettingsTile(Icons.language_rounded,       'Language Preference', subtitle: 'English'),
            _SettingsTile(Icons.location_on_outlined,   'State / Location',    subtitle: state ?? 'Not set'),
            _SettingsTile(Icons.notifications_outlined, 'Notifications'),
            _SettingsTile(Icons.download_outlined,      'My Downloads',        onTap: () => context.push('/downloads')),
            _SettingsTile(Icons.privacy_tip_outlined,   'Privacy Policy'),
            _SettingsTile(Icons.help_outline_rounded,   'Help & Support'),

            // ── Upgrade — 10% amber CTA ─────────────────────────────
            if (plan == 'free') ...[
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(AppColors.amber), Color(AppColors.amberDark)],
                      begin: Alignment.topLeft, end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Upgrade to Premium', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Color(AppColors.ink))),
                            SizedBox(height: 2),
                            Text('Unlock all courses & offline downloads', style: TextStyle(fontSize: 12, color: Color(AppColors.inkMid))),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(AppColors.ink), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10)),
                        child: const Text('Upgrade', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Sign out
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: OutlinedButton.icon(
                onPressed: _signOut,
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Sign Out'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red.shade600,
                  side: BorderSide(color: Colors.red.shade200),
                  minimumSize: const Size(double.infinity, 48),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  final String label;
  final Color bg;
  final Color fg;
  const _Pill(this.label, this.bg, this.fg);

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
    child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: fg)),
  );
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  const _Stat(this.label, this.value);

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(AppColors.ink))),
      const SizedBox(height: 2),
      Text(label, style: const TextStyle(fontSize: 11, color: Color(AppColors.inkMid))),
    ],
  );
}

Widget _divider() => Container(width: 1, height: 32, color: const Color(0xFFE0DDD5));

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
    child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Color(AppColors.inkMid))),
  );
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;
  const _SettingsTile(this.icon, this.title, {this.subtitle, this.onTap});

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 3),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: const Color(0xFFE0DDD5)),
    ),
    child: ListTile(
      dense: true,
      leading: Icon(icon, color: const Color(AppColors.blue), size: 20),
      title: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(AppColors.ink))),
      subtitle: subtitle != null ? Text(subtitle!, style: const TextStyle(fontSize: 12, color: Color(AppColors.inkLight))) : null,
      trailing: const Icon(Icons.chevron_right_rounded, color: Color(AppColors.inkLight), size: 18),
      onTap: onTap ?? () {},
    ),
  );
}

class _CertCard extends StatelessWidget {
  final Map<String, dynamic> cert;
  const _CertCard({required this.cert});

  @override
  Widget build(BuildContext context) {
    final courseTitle = (cert['course'] as Map<String, dynamic>?)?['title'] as String? ?? 'Course';
    final issuedAt = cert['issued_at'] as String? ?? '';

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(AppColors.amber).withOpacity(0.4)),
      ),
      child: Row(
        children: [
          // 10% amber icon
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: const Color(AppColors.amber).withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.verified_rounded, color: Color(AppColors.amber), size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(courseTitle, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(AppColors.ink))),
                const SizedBox(height: 2),
                Text('Issued ${_fmtDate(issuedAt)}', style: const TextStyle(fontSize: 11, color: Color(AppColors.inkLight))),
              ],
            ),
          ),
          const Icon(Icons.open_in_new_rounded, size: 16, color: Color(AppColors.inkLight)),
        ],
      ),
    );
  }

  String _fmtDate(String iso) {
    try {
      final d = DateTime.parse(iso);
      return '${d.day}/${d.month}/${d.year}';
    } catch (_) { return ''; }
  }
}
