import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants.dart';
import '../../../core/network_monitor.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  Map<String, dynamic>? _profile;

  @override
  void initState() { super.initState(); _loadProfile(); }

  Future<void> _loadProfile() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;
    try {
      final data = await Supabase.instance.client.from('profiles').select().eq('id', user.id).single();
      if (mounted) setState(() => _profile = data);
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final network = context.watch<NetworkMonitor>();
    final role    = _profile?['role'] as String? ?? 'youth';

    final pages = [
      _DashboardPage(profile: _profile, role: role),
      if (role == 'teacher') _RoutePusher('/courses/teacher') else _RoutePusher('/courses'),
      const _RoutePusher('/jobs'),
      const _RoutePusher('/profile'),
    ];

    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 30% blue offline banner
          if (!network.isOnline)
            Container(
              color: const Color(AppColors.blue).withOpacity(0.9),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: [
                  const Icon(Icons.wifi_off_rounded, size: 12, color: Colors.white),
                  const SizedBox(width: 6),
                  const Text('Offline — using downloaded content', style: TextStyle(color: Colors.white, fontSize: 11)),
                ],
              ),
            ),
          // White nav bar with blue selected indicator
          NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (i) => setState(() => _currentIndex = i),
            destinations: [
              const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home_rounded), label: 'Home'),
              NavigationDestination(
                icon: Icon(role == 'teacher' ? Icons.auto_awesome_outlined : Icons.school_outlined),
                selectedIcon: Icon(role == 'teacher' ? Icons.auto_awesome_rounded : Icons.school_rounded),
                label: role == 'teacher' ? 'EduPro' : 'Learn',
              ),
              const NavigationDestination(icon: Icon(Icons.work_outline_rounded), selectedIcon: Icon(Icons.work_rounded), label: 'Jobs'),
              const NavigationDestination(icon: Icon(Icons.person_outline_rounded), selectedIcon: Icon(Icons.person_rounded), label: 'Profile'),
            ],
          ),
        ],
      ),
    );
  }
}

class _DashboardPage extends StatelessWidget {
  final Map<String, dynamic>? profile;
  final String role;
  const _DashboardPage({this.profile, required this.role});

  @override
  Widget build(BuildContext context) {
    final name = (profile?['full_name'] as String? ?? 'there').split(' ').first;
    return SafeArea(
      child: SingleChildScrollView(
        // 60% cream scaffold bg shows through
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),

            // Greeting row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Hi, $name 👋', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(AppColors.ink))),
                      const SizedBox(height: 4),
                      Text(
                        role == 'teacher'
                            ? 'Your students are waiting — what will you teach today?'
                            : 'Keep building. Your next job is one course away.',
                        style: const TextStyle(color: Color(AppColors.inkMid), fontSize: 13),
                      ),
                    ],
                  ),
                ),
                // Avatar — 30% blue ring
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(AppColors.blue), width: 2),
                  ),
                  child: CircleAvatar(
                    backgroundColor: const Color(AppColors.blueLight),
                    child: Text(name.isNotEmpty ? name[0] : 'U',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: Color(AppColors.blue))),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Quick actions grid
            const Text('Quick Actions', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Color(AppColors.ink))),
            const SizedBox(height: 10),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.5,
              children: [
                if (role == 'teacher') ...[
                  // 30% blue action
                  _QuickAction('AI Lesson Planner', Icons.auto_awesome_rounded, const Color(AppColors.blue), const Color(AppColors.blueLight), () => context.push('/lesson-planner')),
                  _QuickAction('My CPD Courses', Icons.school_rounded, const Color(AppColors.blue), const Color(AppColors.blueLight), () => context.push('/courses/teacher')),
                ] else ...[
                  _QuickAction('Browse Courses', Icons.school_rounded, const Color(AppColors.blue), const Color(AppColors.blueLight), () => context.push('/courses')),
                  // 10% amber action
                  _QuickAction('My Downloads', Icons.download_done_rounded, const Color(AppColors.amber), const Color(0xFFFFF3DC), () => context.push('/downloads')),
                ],
                _QuickAction('Find Jobs', Icons.work_rounded, const Color(AppColors.blue), const Color(AppColors.blueLight), () => context.push('/jobs')),
                _QuickAction('Certificates', Icons.verified_rounded, const Color(AppColors.amber), const Color(0xFFFFF3DC), () => context.push('/certificates')),
              ],
            ),
            const SizedBox(height: 20),

            // Streak card — 30% blue gradient
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(AppColors.blue), Color(AppColors.blueDark)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Text('🔥', style: TextStyle(fontSize: 32)),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('7-day streak!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
                        Text('Keep it up — log in tomorrow', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                  // 10% amber badge inside blue card
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(AppColors.amber).withOpacity(0.25),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('🏆', style: TextStyle(fontSize: 18)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Generic route-pusher page (for bottom nav tabs that just open a route)
class _RoutePusher extends StatelessWidget {
  final String route;
  const _RoutePusher(this.route);
  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) => context.push(route));
    return const SizedBox.shrink();
  }
}

class _QuickAction extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;
  const _QuickAction(this.label, this.icon, this.color, this.bgColor, this.onTap);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        // White card with coloured icon — sits on 60% cream bg
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE0DDD5)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6, offset: const Offset(0, 2))],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, color: color, size: 18),
            ),
            const Spacer(),
            Text(label, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: color)),
          ],
        ),
      ),
    );
  }
}
