'use client'
import { ShieldCheck, Star, Award, BadgeCheck } from 'lucide-react'

interface Props {
  badgeType?: string | null
  hasBadge?: boolean
  kycStatus?: string
  certVerified?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const BADGE_CONFIG: Record<string, {
  icon: React.ElementType
  label: string
  bg: string
  border: string
  text: string
  iconColor: string
}> = {
  master: {
    icon: Award,
    label: 'Master Educator',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-700',
    iconColor: 'text-amber-500',
  },
  gold: {
    icon: Star,
    label: 'Gold Teacher',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-700',
    iconColor: 'text-yellow-500',
  },
  verified: {
    icon: ShieldCheck,
    label: 'Verified Teacher',
    bg: 'bg-indigo-50',
    border: 'border-indigo-300',
    text: 'text-indigo-700',
    iconColor: 'text-indigo-500',
  },
  kyc_approved: {
    icon: BadgeCheck,
    label: 'KYC Approved',
    bg: 'bg-green-50',
    border: 'border-green-300',
    text: 'text-green-700',
    iconColor: 'text-green-500',
  },
}

const SIZE_MAP = {
  sm: { icon: 'w-3 h-3', text: 'text-xs', pad: 'px-1.5 py-0.5', gap: 'gap-1' },
  md: { icon: 'w-4 h-4', text: 'text-xs', pad: 'px-2 py-1',   gap: 'gap-1.5' },
  lg: { icon: 'w-5 h-5', text: 'text-sm', pad: 'px-3 py-1.5', gap: 'gap-2' },
}

export default function TeacherBadge({
  badgeType,
  hasBadge,
  kycStatus,
  certVerified,
  size = 'md',
  showLabel = true,
}: Props) {
  // Determine which badge to show
  let key = 'verified'
  if (badgeType === 'master')  key = 'master'
  else if (badgeType === 'gold') key = 'gold'
  else if (kycStatus === 'approved') key = 'kyc_approved'

  // Only show badge if verified
  const shouldShow = hasBadge || kycStatus === 'approved' || certVerified

  if (!shouldShow) return null

  const cfg = BADGE_CONFIG[key]
  const sz  = SIZE_MAP[size]
  const Icon = cfg.icon

  return (
    <span className={`inline-flex items-center ${sz.gap} ${sz.pad} rounded-full border font-medium ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      <Icon className={`${sz.icon} ${cfg.iconColor} shrink-0`} />
      {showLabel && <span className={sz.text}>{cfg.label}</span>}
    </span>
  )
}

/** Compact dot-only badge for avatars */
export function TeacherBadgeDot({ kycStatus, hasBadge }: { kycStatus?: string; hasBadge?: boolean }) {
  if (!hasBadge && kycStatus !== 'approved') return null
  return (
    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center">
      <BadgeCheck className="w-2.5 h-2.5 text-white" />
    </span>
  )
}
