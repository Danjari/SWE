'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserChats, getUnreadMessageCount } from '@/lib/chat-service'
import { useAuth } from '@/hooks/use-auth'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, User, Package, Clock, ChevronRight } from 'lucide-react'

export default function MessagesPage() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth() || { user: null }
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchChats = async () => {
      setLoading(true)
      const { data, error } = await getUserChats(user.id)
      
      if (error) {
        console.error('Error fetching chats:', error)
      } else {
        setChats(data || [])
      }
      
      setLoading(false)
    }

    fetchChats()
  }, [user, router])

  const navigateToChat = (chatId) => {
    router.push(`/messages/${chatId}`)
  }

  // Get the other participant in the chat (not the current user)
  const getOtherParticipant = (chat) => {
    if (!user) return null
    
    return chat.buyer.id === user.id ? chat.seller : chat.buyer
  }

  // Format the last update time in human readable format
  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never'
    
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch (e) {
      return 'Unknown'
    }
  }

  // Generate a preview of the most recent message
  // In a real app, you would fetch the last message from the API
  const getMessagePreview = (chat) => {
    // This is a placeholder. In a real implementation, 
    // you would fetch the most recent message from the backend.
    return 'Click to view conversation'
  }

  // Get appropriate label for the chat
  const getChatLabel = (chat) => {
    if (user?.id === chat.buyer.id) {
      return 'You are buying'
    } else {
      return 'You are selling'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading your messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-7 w-7" />
            Messages
          </h1>
          <p className="text-muted-foreground mt-1">Your conversations with buyers and sellers</p>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[200px] flex flex-col items-center justify-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-xl font-medium mb-2">No messages yet</h3>
          <p className="text-muted-foreground mb-4">
            When you buy or sell items, your conversations will appear here
          </p>
          <Button onClick={() => router.push('/listings')}>
            Browse Listings
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => {
            const otherUser = getOtherParticipant(chat)
            
            return (
              <Card 
                key={chat.id}
                className="overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigateToChat(chat.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    {/* User avatar - replace with actual avatar if available */}
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                      <User size={20} />
                    </div>
                    
                    {/* Chat info */}
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {otherUser?.name || otherUser?.full_name || otherUser?.email || 'Unknown User'}
                        </h3>
                        <span className="text-xs text-muted-foreground flex items-center whitespace-nowrap ml-2">
                          <Clock size={12} className="mr-1" />
                          {formatLastUpdated(chat.updated_at)}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-sm text-muted-foreground truncate">
                        {getMessagePreview(chat)}
                      </div>
                      
                      <div className="mt-2 flex items-center">
                        <Badge variant="outline" className="text-xs flex items-center">
                          <Package size={10} className="mr-1" />
                          {chat.listing.title}
                        </Badge>
                        
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {getChatLabel(chat)}
                        </Badge>
                      </div>
                    </div>
                    
                    <ChevronRight size={18} className="text-muted-foreground ml-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
