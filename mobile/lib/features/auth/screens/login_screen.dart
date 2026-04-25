import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey   = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _pwdCtrl   = TextEditingController();
  bool _obscure    = true;
  bool _loading    = false;

  @override
  void dispose() { _emailCtrl.dispose(); _pwdCtrl.dispose(); super.dispose(); }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await Supabase.instance.client.auth.signInWithPassword(
        email: _emailCtrl.text.trim(), password: _pwdCtrl.text,
      );
      if (mounted) context.go('/home');
    } on AuthException catch (e) {
      if (mounted) _showError(e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(AppColors.bg),  // 60% cream
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 24),

                // Logo — 30% blue container
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: const Color(AppColors.blue),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.school_rounded, color: Colors.white, size: 26),
                    ),
                    const SizedBox(width: 10),
                    const Text('SkillBridge', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(AppColors.ink))),
                    // 10% amber brand word
                    const Text(' Nigeria', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(AppColors.amber))),
                  ],
                ),

                const SizedBox(height: 48),

                // Card — white surface on cream bg
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFE0DDD5)),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text('Welcome back', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800, color: const Color(AppColors.ink))),
                      const SizedBox(height: 4),
                      Text('Log in to continue your learning journey', style: TextStyle(color: const Color(AppColors.inkMid), fontSize: 13)),
                      const SizedBox(height: 24),

                      TextFormField(
                        controller: _emailCtrl,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: const InputDecoration(labelText: 'Email address', prefixIcon: Icon(Icons.email_outlined)),
                        validator: (v) => v != null && v.contains('@') ? null : 'Enter a valid email',
                      ),
                      const SizedBox(height: 14),

                      TextFormField(
                        controller: _pwdCtrl,
                        obscureText: _obscure,
                        onFieldSubmitted: (_) => _login(),
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined),
                            onPressed: () => setState(() => _obscure = !_obscure),
                          ),
                        ),
                        validator: (v) => v != null && v.length >= 6 ? null : 'Password is too short',
                      ),

                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(onPressed: () {}, child: const Text('Forgot password?')),
                      ),
                      const SizedBox(height: 4),

                      // 10% amber primary CTA
                      ElevatedButton(
                        onPressed: _loading ? null : _login,
                        child: _loading
                            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(AppColors.ink)))
                            : const Text('Log In'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("Don't have an account? ", style: TextStyle(color: const Color(AppColors.inkMid), fontSize: 13)),
                    GestureDetector(
                      onTap: () => context.go('/signup'),
                      // 30% blue link
                      child: const Text('Sign up free', style: TextStyle(color: Color(AppColors.blue), fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Offline notice — cream bg info box
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(AppColors.bgAlt),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFD5D2C8)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.offline_bolt_rounded, size: 16, color: Color(AppColors.amber)),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Works offline — download courses once and learn anywhere, even on 2G.',
                          style: TextStyle(fontSize: 12, color: Color(AppColors.inkMid)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
