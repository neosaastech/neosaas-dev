import { PrivateSidebar } from "@/components/private-dashboard/sidebar"
import { PrivateHeader } from "@/components/private-dashboard/header"
import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  // Vérifier si l'utilisateur est authentifié
  const session = await getSession()

  // Rediriger vers login si non authentifié
  if (!session?.user) {
    redirect('/auth/login')
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
