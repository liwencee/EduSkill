'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import ChatDrawer from './ChatDrawer'

interface Props {
  applicationId: string
  applicantName: string
  jobTitle:      string
  currentUserId: string
}

export default function ChatButton({
  applicationId,
  applicantName,
  jobTitle,
  currentUserId,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-[#378ADD] hover:bg-blue-100 transition-colors border border-blue-200">
        <MessageSquare className="w-3.5 h-3.5" />
        Chat
      </button>

      {open && (
        <ChatDrawer
          applicationId={applicationId}
          applicantName={applicantName}
          jobTitle={jobTitle}
          currentUserId={currentUserId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
