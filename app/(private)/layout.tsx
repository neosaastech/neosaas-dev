import { PrivateSidebar } from "@/components/private-dashboard/sidebar"
import { PrivateHeader } from "@/components/private-dashboard/header"
import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  // Vérifier si l'utilisateur est authentifié
  const session = await auth0.getSession()

  // Rediriger vers signin si non authentifié
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen">
      <PrivateSidebar />
      <div className="flex flex-1 flex-col">
        <PrivateHeader />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
