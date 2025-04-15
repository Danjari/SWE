'use client';

import { RealtimeChat } from '@/components/realtime-chat'
import { redirect, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

import { LogoutButton } from '@/components/logout-button'

export default function ChatPage() {
    const { user } = useAuth() || { user: null }
    const searchParams = useSearchParams()
    const roomName = searchParams.get('room') || 'general'
    const initialMessage = searchParams.get('message') || null
    const [hasInitialized, setHasInitialized] = useState(false)

    useEffect(() => {
        if (!user) {
            redirect('/auth/login')
        }
    }, [user])

    if (!user) {
        return <div className="container mx-auto py-12 flex justify-center">Loading...</div>
    }

    return (
        <div className="h-[calc(100vh-64px)]">
            <RealtimeChat 
                roomName={roomName} 
                username={user.email} 
                initialMessage={initialMessage}
                hasInitialized={hasInitialized}
                onInitialized={() => setHasInitialized(true)}
            />
        </div>
    )
}
