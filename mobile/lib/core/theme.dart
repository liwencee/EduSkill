import 'package:flutter/material.dart';
import 'constants.dart';

final ThemeData appTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme(
    brightness: Brightness.light,
    // 30% structural blue as the "primary" Material role
    primary:          const Color(AppColors.blue),
    onPrimary:        Colors.white,
    primaryContainer: const Color(AppColors.blueLight),
    onPrimaryContainer: const Color(AppColors.blueDark),
    // 10% amber as the "secondary / tertiary" Material role
    secondary:        const Color(AppColors.amber),
    onSecondary:      const Color(AppColors.ink),
    secondaryContainer: const Color(0xFFFFF3DC),
    onSecondaryContainer: const Color(AppColors.amberDark),
    // 60% cream as the "background" Material role
    surface:          const Color(AppColors.surface),
    onSurface:        const Color(AppColors.ink),
    background:       const Color(AppColors.bg),
    onBackground:     const Color(AppColors.ink),
    error:            const Color(0xFFDC2626),
    onError:          Colors.white,
    outline:          const Color(0xFFD5D2C8),
  ),
  fontFamily: 'Inter',

  // ── Scaffold ───────────────────────────────────────────────────────
  scaffoldBackgroundColor: const Color(AppColors.bg),  // 60% cream

  // ── AppBar — 30% blue ──────────────────────────────────────────────
  appBarTheme: const AppBarTheme(
    backgroundColor: Color(AppColors.blue),
    foregroundColor: Colors.white,
    elevation: 0,
    centerTitle: false,
    titleTextStyle: TextStyle(
      fontFamily: 'Inter',
      fontWeight: FontWeight.w700,
      fontSize: 18,
      color: Colors.white,
    ),
    iconTheme: IconThemeData(color: Colors.white),
  ),

  // ── Elevated button — 10% amber (primary CTA) ─────────────────────
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: const Color(AppColors.amber),
      foregroundColor: const Color(AppColors.ink),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      elevation: 0,
      textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, fontSize: 15),
    ),
  ),

  // ── Outlined button — 30% blue ────────────────────────────────────
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: const Color(AppColors.blue),
      side: const BorderSide(color: Color(AppColors.blue), width: 1.5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600, fontSize: 15),
    ),
  ),

  // ── Text button — 30% blue ────────────────────────────────────────
  textButtonTheme: TextButtonThemeData(
    style: TextButton.styleFrom(
      foregroundColor: const Color(AppColors.blue),
      textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600),
    ),
  ),

  // ── Input — white surface with blue focus ─────────────────────────
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: Colors.white,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFD5D2C8))),
    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFD5D2C8))),
    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(AppColors.blue), width: 2)),
    hintStyle: const TextStyle(color: Color(AppColors.inkLight)),
    labelStyle: const TextStyle(color: Color(AppColors.inkMid)),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  ),

  // ── Card — white surface on cream bg ─────────────────────────────
  cardTheme: CardTheme(
    elevation: 0,
    color: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: const BorderSide(color: Color(0xFFE0DDD5)),
    ),
  ),

  // ── BottomNavBar — white bg, blue selected ───────────────────────
  navigationBarTheme: NavigationBarThemeData(
    backgroundColor: Colors.white,
    indicatorColor: const Color(AppColors.blueLight),
    iconTheme: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return const IconThemeData(color: Color(AppColors.blue));
      }
      return const IconThemeData(color: Color(AppColors.inkLight));
    }),
    labelTextStyle: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.selected)) {
        return const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, fontSize: 11, color: Color(AppColors.blue));
      }
      return const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w500, fontSize: 11, color: Color(AppColors.inkLight));
    }),
  ),

  // ── Progress indicator — 10% amber ───────────────────────────────
  progressIndicatorTheme: const ProgressIndicatorThemeData(
    color: Color(AppColors.amber),
    linearTrackColor: Color(AppColors.bgAlt),
  ),

  // ── Chip — blue tones ─────────────────────────────────────────────
  chipTheme: ChipThemeData(
    backgroundColor: Colors.white,
    selectedColor: const Color(AppColors.blueLight),
    labelStyle: const TextStyle(fontFamily: 'Inter', fontSize: 12),
    side: const BorderSide(color: Color(0xFFD5D2C8)),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
  ),

  // ── Snackbar ──────────────────────────────────────────────────────
  snackBarTheme: SnackBarThemeData(
    backgroundColor: const Color(AppColors.blueDark),
    contentTextStyle: const TextStyle(fontFamily: 'Inter', color: Colors.white),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
    behavior: SnackBarBehavior.floating,
  ),
);
