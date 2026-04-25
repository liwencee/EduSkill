import 'package:flutter/material.dart';
import '../../../core/constants.dart';
import '../../../data/local/database.dart';

class DownloadsScreen extends StatefulWidget {
  const DownloadsScreen({super.key});
  @override
  State<DownloadsScreen> createState() => _DownloadsScreenState();
}

class _DownloadsScreenState extends State<DownloadsScreen> {
  late Future<List<Map<String, dynamic>>> _downloadsFuture;

  @override
  void initState() {
    super.initState();
    _downloadsFuture = LocalDatabase.getDownloadedCourses();
  }

  Future<void> _deleteDownload(String courseId, String title) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Download'),
        content: Text('Remove "$title" from your device?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Delete', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
    if (confirmed == true) {
      await LocalDatabase.deleteDownload(courseId);
      setState(() { _downloadsFuture = LocalDatabase.getDownloadedCourses(); });
    }
  }

  String _formatSize(int kb) {
    if (kb < 1024) return '${kb}KB';
    return '${(kb / 1024).toStringAsFixed(1)}MB';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Downloaded Courses')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _downloadsFuture,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          final downloads = snap.data ?? [];
          if (downloads.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.download_outlined, size: 72, color: Colors.grey.shade300),
                    const SizedBox(height: 16),
                    const Text('No downloaded courses yet', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                    const SizedBox(height: 8),
                    Text('Download courses on WiFi to watch them offline, even with no internet.',
                      textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.school_outlined),
                      label: const Text('Browse Courses'),
                    ),
                  ],
                ),
              ),
            );
          }

          int totalKb = downloads.fold(0, (sum, d) => sum + (d['size_kb'] as int? ?? 0));

          return Column(
            children: [
              Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(AppConstants.brandLight),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(AppConstants.brandGreen).withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.storage, size: 16, color: Color(AppConstants.brandGreen)),
                    const SizedBox(width: 8),
                    Text('${downloads.length} course${downloads.length != 1 ? 's' : ''} · ${_formatSize(totalKb)} used',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(AppConstants.brandDark))),
                    const Spacer(),
                    Text('Max ${AppConstants.maxOfflineMB ~/ 1024}GB', style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                  ],
                ),
              ),

              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: downloads.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final d = downloads[i];
                    return Card(
                      child: ListTile(
                        leading: Container(
                          width: 44, height: 44,
                          decoration: BoxDecoration(
                            color: const Color(AppConstants.brandLight),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.play_circle_outline, color: Color(AppConstants.brandGreen)),
                        ),
                        title: Text(d['title'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                        subtitle: Text('${_formatSize(d['size_kb'] as int? ?? 0)} · Downloaded ${_formatDate(d['downloaded_at'] as String? ?? '')}',
                          style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
                        trailing: IconButton(
                          icon: Icon(Icons.delete_outline, color: Colors.red.shade400),
                          onPressed: () => _deleteDownload(d['course_id'] as String, d['title'] as String? ?? ''),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return '';
    }
  }
}
