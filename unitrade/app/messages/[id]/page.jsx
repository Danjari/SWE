'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getChatById, getChatMessages, sendMessage, markChatAsRead } from '@/lib/chat-service'
import { useAuth } from '@/hooks/use-auth'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  User, 
  Package, 
  Clock, 
  ChevronLeft, 
  Send, 
  DollarSign,
  CheckCircle2
} from 'lucide-react'

export default function ChatPage() {
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const { user } = useAuth() || { user: null }
  const params = useParams()
  const router = useRouter()
  const chatId = params.id
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchChatData = async () => {
      setLoading(true)
      
      // Get chat details
      const { data: chatData, error: chatError } = await getChatById(chatId)
      
      if (chatError || !chatData) {
        console.error('Error fetching chat:', chatError)
        router.push('/messages')
        return
      }

      // Check if user is participant in this chat
      if (chatData.buyer_id !== user.id && chatData.seller_id !== user.id) {
        console.error('User is not part of this chat')
        router.push('/messages')
        return
      }
      
      setChat(chatData)
      
      // Get chat messages
      const { data: messagesData, error: messagesError } = await getChatMessages(chatId)
      
      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
      } else {
        setMessages(messagesData || [])
      }
      
      // Mark messages as read
      await markChatAsRead(chatId, user.id)
      
      setLoading(false)
    }

    if (chatId) {
      fetchChatData()
    }
  }, [chatId, user, router])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return
    
    setSending(true)
    
    const { data, error } = await sendMessage(
      chatId,
      user.id,
      newMessage.trim()
    )
    
    if (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } else {
      // Add the new message to the state
      setMessages(prev => [...prev, data])
      setNewMessage('')
    }
    
    setSending(false)
  }

  // Get the other participant in the chat (not the current user)
  const getOtherParticipant = () => {
    if (!user || !chat) return null
    
    return chat.buyer.id === user.id ? chat.seller : chat.buyer
  }

  // Format timestamps in human readable format
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    
    try {
      const date = new Date(timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      // If today, show time only
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } 
      // If yesterday, show "Yesterday" and time
      else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      } 
      // Otherwise show date and time
      else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
               ', ' + 
               date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    } catch (e) {
      return 'Invalid date'
    }
  }

  // Determine if a message is from the current user
  const isOwnMessage = (message) => {
    return message.sender_id === user?.id
  }

  // Group consecutive messages from the same sender
  const groupedMessages = () => {
    const result = []
    let currentGroup = null
    
    messages.forEach((message, index) => {
      const isOwn = isOwnMessage(message)
      
      // Start a new group if:
      // 1. This is the first message
      // 2. Previous message was from a different sender
      // 3. Time difference is > 5 minutes from previous message
      if (
        !currentGroup ||
        currentGroup.isOwn !== isOwn ||
        (index > 0 && 
         new Date(message.created_at) - new Date(messages[index - 1].created_at) > 5 * 60 * 1000)
      ) {
        if (currentGroup) {
          result.push(currentGroup)
        }
        
        currentGroup = {
          isOwn,
          messages: [message],
          time: message.created_at
        }
      } else {
        currentGroup.messages.push(message)
        // Use the latest timestamp for the group
        currentGroup.time = message.created_at
      }
    })
    
    // Add the last group
    if (currentGroup) {
      result.push(currentGroup)
    }
    
    return result
  }

  // Is the message part of a purchase request
  const isPurchaseRequest = (message) => {
    return message.purchase_request_id !== null
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  const otherUser = getOtherParticipant()

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Chat header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={() => router.push('/messages')}
        >
          <ChevronLeft size={18} />
          <span className="sr-only">Back</span>
        </Button>
        
        <div className="flex items-center">
          {/* User avatar */}
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 mr-3">
            <User size={18} />
          </div>
          
          <div>
            <h1 className="text-xl font-semibold">
              {otherUser?.name || otherUser?.full_name || otherUser?.email || 'Unknown User'}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <Badge variant="outline" className="mr-2 text-xs flex items-center">
                <Package size={10} className="mr-1" />
                {chat.listing.title}
              </Badge>
              <span>${chat.listing.price}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat container */}
      <div className="bg-card rounded-lg border shadow-sm h-[calc(100vh-250px)] flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageSquare size={40} className="mb-4 opacity-20" />
              <p>No messages yet</p>
              <p className="text-sm mt-1">Be the first to send a message!</p>
            </div>
          ) : (
            groupedMessages().map((group, groupIndex) => (
              <div 
                key={`group-${groupIndex}`} 
                className={`flex ${group.isOwn ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`max-w-[80%] ${group.isOwn ? 'order-2' : 'order-1'}`}>
                  {/* Sender info shown only for the other participant */}
                  {!group.isOwn && (
                    <div className="flex items-center mb-1">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground mr-2">
                        <User size={12} />
                      </div>
                      <span className="text-sm font-medium">
                        {otherUser?.name || otherUser?.full_name || otherUser?.email || 'Unknown User'}
                      </span>
                    </div>
                  )}
                  
                  {/* Message bubbles */}
                  <div className="space-y-1">
                    {group.messages.map((message, messageIndex) => {
                      // Special handling for purchase request messages
                      if (isPurchaseRequest(message)) {
                        return (
                          <div 
                            key={message.id}
                            className="bg-muted/40 border rounded-lg p-3 mb-2"
                          >
                            <div className="flex items-center text-primary mb-1">
                              <CheckCircle2 size={14} className="mr-1" />
                              <span className="text-sm font-medium">Purchase Request</span>
                            </div>
                            <pre className="whitespace-pre-wrap text-sm">{message.content}</pre>
                            <div className="text-xs text-muted-foreground mt-2 text-right">
                              {formatMessageTime(message.created_at)}
                            </div>
                          </div>
                        )
                      }
                      
                      // Regular messages
                      return (
                        <div 
                          key={message.id}
                          className={`${
                            group.isOwn 
                              ? 'bg-primary text-primary-foreground rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                              : 'bg-muted rounded-tl-lg rounded-tr-lg rounded-br-lg'
                          } p-3 break-words`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {/* Show time on the last message of the group */}
                          {messageIndex === group.messages.length - 1 && (
                            <div className={`text-xs mt-1 text-right ${
                              group.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatMessageTime(message.created_at)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div className="p-3 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!newMessage.trim() || sending}
            >
              <Send size={18} />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
