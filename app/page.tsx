import { AppShell } from '@/components/app-shell'
import { AuthProvider } from '@/lib/auth-context'
import { StoreProvider } from '@/lib/store'

export default function Page() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </AuthProvider>
  )
}
