import { RealtimeChat } from '@/components/realtime-chat'
import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'

export default async function ChatPage() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

  return <RealtimeChat roomName="my room" username={data?.user.email} />
}
