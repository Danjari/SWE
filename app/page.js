import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to the listings page
  redirect('/listings')
}
