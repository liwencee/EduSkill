import { createClient } from '@/lib/supabase/server'
import { CreditCard, TrendingUp, GraduationCap, Crown, Receipt } from 'lucide-react'

const SUB_LABELS: Record<string, string> = {
  teacher_premium: 'Teacher Premium',
  institutional:   'Institutional',
}

export default async function AdminPaymentsPage() {
  let purchases: any[] = []
  let subscribers: any[] = []
  let courseRevenue = 0
  let activeSubCount = 0

  try {
    const supabase = createClient()

    const { data: pData } = await supabase
      .from('enrollments')
      .select(`
        id, payment_ref, enrolled_at, course_id, user_id,
        course:courses(title, price_ngn),
        user:profiles(full_name, email)
      `)
      .eq('is_paid', true)
      .order('enrolled_at', { ascending: false })
      .limit(200)
    purchases = pData ?? []
    courseRevenue = purchases.reduce((sum, p) => {
      const course = Array.isArray(p.course) ? p.course[0] : p.course
      return sum + Number(course?.price_ngn ?? 0)
    }, 0)

    const { data: sData } = await supabase
      .from('profiles')
      .select('id, full_name, email, subscription, subscription_expires_at, lesson_plan_unlocked, result_gen_unlocked')
      .in('subscription', ['teacher_premium', 'institutional'])
      .order('subscription_expires_at', { ascending: false })
      .limit(200)
    subscribers = (sData ?? []).filter(s =>
      s.subscription_expires_at && new Date(s.subscription_expires_at) > new Date()
    )
    activeSubCount = subscribers.length
  } catch { /* DB unavailable */ }

  const estimatedMRR = activeSubCount * 5000

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-brand-blue" /> Payments &amp; Subscriptions
        </h1>
        <p className="text-sm text-brand-inkMid mt-1">
          Course purchases, teacher premium subscriptions, and revenue overview.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Course Revenue',    value: `₦${courseRevenue.toLocaleString()}`, icon: Receipt,      bg: 'bg-blue-50',   color: 'text-brand-blue' },
          { label: 'Course Purchases',  value: purchases.length,                     icon: GraduationCap, bg: 'bg-orange-50', color: 'text-brand-amber' },
          { label: 'Active Premium',    value: activeSubCount,                       icon: Crown,          bg: 'bg-purple-50', color: 'text-purple-600' },
          { label: 'Est. MRR',          value: `₦${estimatedMRR.toLocaleString()}`,  icon: TrendingUp,     bg: 'bg-green-50',  color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-brand-ink">{value}</p>
              <p className="text-xs text-brand-inkMid">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Premium Subscribers */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-brand-ink mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-purple-600" /> Active Premium Subscribers
        </h2>
        {subscribers.length === 0 ? (
          <div className="card p-10 text-center text-brand-inkLight">
            <Crown className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-brand-ink">No active premium subscribers yet</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0DDD5] bg-brand-bg">
                    <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Teacher</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Expires</th>
                    <th className="text-center px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden md:table-cell">Tools Unlocked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0DDD5]">
                  {subscribers.map((s: any) => (
                    <tr key={s.id} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-brand-ink">{s.full_name ?? '—'}</p>
                        <p className="text-xs text-brand-inkLight">{s.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          {SUB_LABELS[s.subscription] ?? s.subscription}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-inkMid">
                        {s.subscription_expires_at
                          ? new Date(s.subscription_expires_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          {s.lesson_plan_unlocked && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-brand-blue">Lesson Planner</span>}
                          {s.result_gen_unlocked && <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700">Result Gen</span>}
                          {!s.lesson_plan_unlocked && !s.result_gen_unlocked && <span className="text-brand-inkLight">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Course Purchases */}
      <div>
        <h2 className="text-lg font-bold text-brand-ink mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-brand-amber" /> Course Purchases
        </h2>
        {purchases.length === 0 ? (
          <div className="card p-10 text-center text-brand-inkLight">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-brand-ink">No paid course enrollments yet</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E0DDD5] bg-brand-bg">
                    <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Learner</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Course</th>
                    <th className="text-right px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide hidden lg:table-cell">Payment Ref</th>
                    <th className="text-right px-4 py-3 font-semibold text-brand-inkMid text-xs uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0DDD5]">
                  {purchases.map((p: any) => {
                    const course = Array.isArray(p.course) ? p.course[0] : p.course
                    const user   = Array.isArray(p.user) ? p.user[0] : p.user
                    return (
                      <tr key={p.id} className="hover:bg-brand-bg/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-brand-ink">{user?.full_name ?? '—'}</p>
                          <p className="text-xs text-brand-inkLight">{user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-brand-ink">{course?.title ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-brand-ink">
                          ₦{Number(course?.price_ngn ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs font-mono text-brand-inkLight">{p.payment_ref ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-brand-inkMid text-xs">
                          {p.enrolled_at
                            ? new Date(p.enrolled_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
