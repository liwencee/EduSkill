import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';

enum NetworkQuality { none, poor, fair, good }

class NetworkMonitor extends ChangeNotifier {
  NetworkQuality _quality = NetworkQuality.good;
  bool _isOnline = true;

  NetworkQuality get quality => _quality;
  bool get isOnline => _isOnline;
  bool get isPoor => _quality == NetworkQuality.poor || _quality == NetworkQuality.none;

  NetworkMonitor() {
    Connectivity().onConnectivityChanged.listen(_onConnectivityChanged);
    _checkInitial();
  }

  Future<void> _checkInitial() async {
    final result = await Connectivity().checkConnectivity();
    _onConnectivityChanged(result);
  }

  void _onConnectivityChanged(ConnectivityResult result) {
    switch (result) {
      case ConnectivityResult.none:
        _isOnline = false;
        _quality = NetworkQuality.none;
      case ConnectivityResult.mobile:
        _isOnline = true;
        // Treat all mobile as potentially poor/2G in Nigeria
        _quality = NetworkQuality.poor;
      case ConnectivityResult.wifi:
        _isOnline = true;
        _quality = NetworkQuality.good;
      default:
        _isOnline = true;
        _quality = NetworkQuality.fair;
    }
    notifyListeners();
  }

  /// Returns true if we should use offline-first (cached) data
  bool get preferOffline => _quality == NetworkQuality.none || _quality == NetworkQuality.poor;

  /// Returns the recommended video bitrate in kbps based on connection
  int get recommendedVideoBitrate {
    switch (_quality) {
      case NetworkQuality.none:  return 0;
      case NetworkQuality.poor:  return 400;   // 2G-friendly
      case NetworkQuality.fair:  return 800;   // 3G
      case NetworkQuality.good:  return 1500;  // WiFi/4G
    }
  }
}
