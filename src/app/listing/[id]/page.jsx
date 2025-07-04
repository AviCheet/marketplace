'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../utils/supabase'

export default function ListingDetails() {
const { id } = useParams()
const [messageEmail, setMessageEmail] = useState('')
const [messageText, setMessageText] = useState("I'm interested in your item!")
const [emailError, setEmailError] = useState('')
const [messageSuccess, setMessageSuccess] = useState('')
const [listing, setListing] = useState(null)

  useEffect(() => {
    async function fetchListing() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) {
        setListing(data)
      }
    }

    if (id) fetchListing()
  }, [id])

  if (!listing) {
    return <div className="p-8">Loading...</div>
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setEmailError('')
    setMessageSuccess('')
  
    if (!messageEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(messageEmail)) {
      setEmailError('Please enter a valid email')
      return
    }
  
    const { error } = await supabase.from('messages').insert({
      listing_id: listing.id,
      buyer_email: messageEmail,
      seller_email: listing.seller_email, 
      message: messageText
    })
  
    if (error) {
      console.error('Error sending message:', error)
      alert('Message sending failed')
    } else {
      setMessageSuccess('Message sent successfully!')
      setMessageEmail('')
      setMessageText("I'm interested in your item!")
    }
  }
  

  return (
    <div className="p-12 bg-[#f0f2f5] min-h-screen flex justify-center">
      <div className="max-w-6xl w-full bg-white p-8 rounded-lg shadow flex gap-8">
        <div className="w-1/2">
          <img
            src={listing.image_url}
            alt={listing.title}
            className="w-full h-[500px] object-cover rounded-md"
          />
        </div>
        <div className="w-1/2 flex flex-col justify-between">
            <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <p className="text-xl text-gray-700 mb-2">${listing.price}</p>
                <p className="text-sm text-gray-500 mb-1">{listing.location}</p>
                <p className="text-sm text-gray-500 mb-4">Category: {listing.category}</p>

                <h3 className="text-lg font-semibold mt-4 mb-1">Description</h3>
                <p className="text-gray-600 mb-4">{listing.description}</p>

                <h3 className="text-sm font-medium text-gray-700 mb-1">Seller Email</h3>
                <p className="text-gray-600 mb-6">{listing.seller_email}</p>

                <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Message Seller</h3>

                <form onSubmit={handleSendMessage} className="space-y-3">
            <div>
                <label className="block text-sm font-medium mb-1">Your Email</label>
                <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="your@email.com"
                value={messageEmail}
                onChange={(e) => setMessageEmail(e.target.value)}
                />
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="I'm interested in your item!"
                />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Send Message
            </button>
            {messageSuccess && <p className="text-green-600 text-sm mt-2">{messageSuccess}</p>}
            </form>

        </div>

    </div>
        </div>
    </div>
    </div>
  )
}
