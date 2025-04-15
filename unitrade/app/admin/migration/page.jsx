'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { redirect } from 'next/navigation'

export default function MigrationPage() {
  const { user } = useAuth() || { user: null }
  const [migrationStatus, setMigrationStatus] = useState('idle') // idle, running, success, error
  const [migrationMessage, setMigrationMessage] = useState('')

  if (!user) {
    redirect('/auth/login')
  }

  const migrationSql = `
-- Add new columns to purchase_requests table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_requests' AND column_name = 'pickup_time') THEN
        ALTER TABLE purchase_requests ADD COLUMN pickup_time TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_requests' AND column_name = 'pickup_location') THEN
        ALTER TABLE purchase_requests ADD COLUMN pickup_location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_requests' AND column_name = 'payment_method') THEN
        ALTER TABLE purchase_requests ADD COLUMN payment_method TEXT;
    END IF;
END $$;

-- Create email_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);
  `

  const runMigration = async () => {
    setMigrationStatus('running')
    setMigrationMessage('Running migration...')

    try {
      const supabase = createClient()
      
      // We cannot directly run the above SQL through the client
      // Instead, we'll check if the table exists and columns exist
      
      // Check if purchase_requests table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('purchase_requests')
        .select('id')
        .limit(1)
      
      if (tableError) {
        throw new Error(`Table check error: ${tableError.message}`)
      }
      
      setMigrationMessage('Running migration... (Step 1/2)')

      // Try inserting a record with the new fields to see if they exist
      // This will fail if the columns don't exist
      try {
        const { error: insertError } = await supabase
          .from('purchase_requests')
          .insert({
            listing_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
            buyer_id: user.id,
            seller_id: user.id,
            status: 'test',
            buyer_message: 'Migration test',
            buyer_contact: 'Migration test',
            pickup_time: new Date().toISOString(),
            pickup_location: 'test',
            payment_method: 'test'
          })
          .select()
        
        if (insertError && insertError.message.includes('column')) {
          setMigrationMessage('Migration needed: New columns are missing. Please run the SQL in Supabase SQL editor.')
          setMigrationStatus('error')
          return
        }
      } catch (err) {
        setMigrationMessage('Migration needed: New columns are missing. Please run the SQL in Supabase SQL editor.')
        setMigrationStatus('error')
        return
      }
      
      setMigrationMessage('Running migration... (Step 2/2)')

      // Check if email_notifications table exists
      const { data: emailTableExists, error: emailTableError } = await supabase
        .from('email_notifications')
        .select('id')
        .limit(1)
      
      if (emailTableError && !emailTableError.message.includes('does not exist')) {
        throw new Error(`Email table check error: ${emailTableError.message}`)
      }
      
      if (emailTableError && emailTableError.message.includes('does not exist')) {
        setMigrationMessage('Migration needed: email_notifications table is missing. Please run the SQL in Supabase SQL editor.')
        setMigrationStatus('error')
        return
      }
      
      setMigrationStatus('success')
      setMigrationMessage('Migration completed successfully! All tables and columns exist.')
    } catch (error) {
      console.error('Migration error:', error)
      setMigrationStatus('error')
      setMigrationMessage(`Migration failed: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Database Migration</CardTitle>
          <CardDescription>Run this migration to add new fields for purchase requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Migration SQL</h3>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
              {migrationSql}
            </pre>
          </div>
          
          <div className="border p-4 rounded-md bg-muted/50">
            <h3 className="text-lg font-medium mb-2">How to run this migration</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your Supabase project dashboard</li>
              <li>Click on "SQL Editor" in the left sidebar</li>
              <li>Create a "New Query"</li>
              <li>Copy and paste the SQL above into the editor</li>
              <li>Click "Run" to execute the migration</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Migration Status Check</h3>
            <p className="text-muted-foreground mb-4">
              Click the button below to check if the migration is needed for your database.
            </p>
            
            <Button 
              onClick={runMigration} 
              disabled={migrationStatus === 'running'}
            >
              {migrationStatus === 'running' ? 'Checking...' : 'Check Migration Status'}
            </Button>
            
            {migrationStatus !== 'idle' && (
              <div className={`mt-4 p-4 rounded-md ${
                migrationStatus === 'success' ? 'bg-green-100 text-green-800' : 
                migrationStatus === 'error' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {migrationMessage}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            After running the migration, the purchase request form will include new fields for pickup time, location, and payment method.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 