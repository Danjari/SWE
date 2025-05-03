'use client'
import { createClient } from "./client"

export async function banListing(listingId) {
  const supabase = createClient()
  

  const {error,data} = await supabase
    .from("listings")
    .update({
      status: "banned",
      banned_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .select("id")
    .maybeSingle()
    
    

  if (error) {
    console.error("banListing error:", error)
    return { success: false, error: error.message }
  }
  if(!data){
    
    console.log("this is the received data, ",data)
  }


  return { success: true }
}


export async function unbanListing(listingId) {
    const supabase = createClient()
  
    const { error, data } = await supabase
      .from("listings")
      .update({
        status: "active",     
        banned_at: null,
      })
      .eq("id", listingId)
      .select("id")
      .maybeSingle()
  
    if (error) {
      console.error("unbanListing error:", error)
      return { success: false, error: error.message }
    }
  
    return { success: true }
  }
  
  
  
  
  
  
  