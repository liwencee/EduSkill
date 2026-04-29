import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:provider/provider.dart';
import '../../../core/constants.dart';
import '../../../core/network_monitor.dart';
import '../../../data/local/database.dart';
import '../../../data/repositories/course_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class VideoPlayerScreen extends StatefulWidget {
  final String lessonId;
  final String courseId;
  final String title;
  final String? videoUrl;     // remote Cloudflare URL
  final String? localPath;    // downloaded file path
  final int initialWatchSecs;

  const VideoPlayerScreen({
    super.key,
    required this.lessonId,
    required this.courseId,
    required this.title,
    this.videoUrl,
    this.localPath,
    this.initialWatchSecs = 0,
  });

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  VideoPlayerController? _vpController;
  ChewieController?      _chewieController;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.landscapeLeft, DeviceOrientation.portraitUp]);
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    final network = context.read<NetworkMonitor>();

    // Prefer local file → fallback to stream
    final useLocal = widget.localPath != null && File(widget.localPath!).existsSync();
    final useStream = !useLocal && widget.videoUrl != null && network.isOnline;

    if (!useLocal && !useStream) {
      setState(() { _error = 'This lesson is not downloaded and you are offline. Download the course on WiFi first.'; _isLoading = false; });
      return;
    }

    try {
      _vpController = useLocal
          ? VideoPlayerController.file(File(widget.localPath!))
          : VideoPlayerController.networkUrl(
              Uri.parse(_buildAdaptiveUrl(widget.videoUrl!, network.recommendedVideoBitrate)),
            );

      await _vpController!.initialize();

      // Seek to last watched position
      if (widget.initialWatchSecs > 0) {
        await _vpController!.seekTo(Duration(seconds: widget.initialWatchSecs));
      }

      _chewieController = ChewieController(
        videoPlayerController: _vpController!,
        autoPlay: true,
        allowFullScreen: true,
        allowMuting: true,
        showControls: true,
        progressIndicatorDelay: const Duration(milliseconds: 400),
      );

      // Save progress every 10 seconds
      _vpController!.addListener(_onProgressTick);
      setState(() => _isLoading = false);
    } catch (e) {
      setState(() { _error = 'Could not load video. Try downloading for offline use.'; _isLoading = false; });
    }
  }

  int _lastSavedSecs = 0;

  void _onProgressTick() {
    if (_vpController == null) return;
    final pos = _vpController!.value.position.inSeconds;
    final dur = _vpController!.value.duration.inSeconds;

    // Save every 10 seconds of new watch time
    if (pos - _lastSavedSecs >= 10) {
      _lastSavedSecs = pos;
      final userId = Supabase.instance.client.auth.currentUser?.id ?? '';
      final isCompleted = dur > 0 && pos >= dur - 5;
      context.read<CourseRepository>().trackProgress(
        userId: userId, lessonId: widget.lessonId, courseId: widget.courseId,
        watchSecs: pos, isCompleted: isCompleted,
      );
    }
  }

  /// Build adaptive stream URL with bitrate hint for Cloudflare Stream
  String _buildAdaptiveUrl(String url, int bitrate) {
    if (bitrate <= 400) {
      // For 2G: request lowest quality manifest
      return url.replaceAll('/manifest/video.m3u8', '/manifest/video.m3u8?bitrate=400');
    }
    return url;
  }

  @override
  void dispose() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _vpController?.removeListener(_onProgressTick);
    _chewieController?.dispose();
    _vpController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(widget.title, style: const TextStyle(color: Colors.white, fontSize: 14)),
      ),
      body: Column(
        children: [
          // Video area (16:9)
          AspectRatio(
            aspectRatio: 16 / 9,
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(AppConstants.brandGreen)))
                : _error != null
                    ? _ErrorWidget(message: _error!)
                    : Chewie(controller: _chewieController!),
          ),

          // Lesson info
          Expanded(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(height: 8),
                  if (widget.localPath != null)
                    const Row(
                      children: [
                        Icon(Icons.offline_bolt, size: 14, color: Color(AppConstants.brandGreen)),
                        SizedBox(width: 4),
                        Text('Playing offline', style: TextStyle(fontSize: 12, color: Color(AppConstants.brandGreen), fontWeight: FontWeight.w600)),
                      ],
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorWidget extends StatelessWidget {
  final String message;
  const _ErrorWidget({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade900,
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.white54, size: 48),
          const SizedBox(height: 12),
          Text(message, style: const TextStyle(color: Colors.white70, fontSize: 13), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
