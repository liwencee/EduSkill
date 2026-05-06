import { redirect } from 'next/navigation'

// CPD certificates are on the shared certificates dashboard
export default function EduProCertificatesPage() {
  redirect('/dashboard/certificates')
}
