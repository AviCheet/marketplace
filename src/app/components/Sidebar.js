"use client"

import { useState, useEffect } from 'react'
import { FaTag, FaUser, FaSearch, FaTimes } from 'react-icons/fa'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const categories = [
    'Vehicles', 'Property Rentals', 'Apparel', 'Classifieds', 'Electronics',
    'Entertainment', 'Family', 'Free Stuff', 'Garden & Outdoor', 'Hobbies',
    'Home Goods', 'Home Improvement', 'Home Sales', 'Musical Instruments',
    'Office Supplies', 'Pet Supplies', 'Sporting Goods', 'Toys & Games', 'Buy and sell groups'
  ]

  const [activeCategory, setActiveCategory] = useState('Electronics')
  const [activePanel, setActivePanel] = useState('Choose listing type')
  const [isItemFormVisible, setItemFormVisible] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    email: '',
    description: '',
    photo: null,
    photoPreview: null
  })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [listingsByCategory, setListingsByCategory] = useState({})

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase.from('listings').select('*')
      if (!error) {
        const grouped = {}
        data.forEach(listing => {
          if (!grouped[listing.category]) grouped[listing.category] = []
          grouped[listing.category].push(listing)
        })
        setListingsByCategory(grouped)
      }
    }
    fetchListings()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const categoryFromURL = params.get('category')
  
    if (categoryFromURL && categories.includes(categoryFromURL)) {
      setActiveCategory(categoryFromURL)
      setActivePanel(categoryFromURL)
    }
  }, [])
  

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!selectedCategory) newErrors.category = 'Category is required'
    if (!formData.price) newErrors.price = 'Price is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSearch = () => {
    const trimmedSearch = searchTerm.trim().toLowerCase()
    const matchedCategory = categories.find(cat =>
      cat.toLowerCase().includes(trimmedSearch)
    )
  
    if (matchedCategory) {
      setActiveCategory(matchedCategory)
      setActivePanel(matchedCategory)
      setItemFormVisible(false)
  
      // Reset searchTerm so it doesn’t filter out results
      setSearchTerm('')
    } else {
      alert("No matching category found.")
    }
  }
  
  

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
  
    let image_url = null
  
    if (formData.photo && typeof formData.photo !== 'string') {
      const file = formData.photo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
  
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file)
  
      if (error) {
        alert('Image upload failed')
        return
      }
  
      image_url = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName).data.publicUrl
    }
  
    const { data: insertData, error: insertError } = await supabase
      .from('listings')
      .insert({
        title: formData.title,
        description: formData.description,
        price: formData.price,
        category: selectedCategory,
        seller_email: formData.email,
        image_url,
        location: formData.location || 'Palo Alto, CA'
      })
      .select()
  
    if (insertError) {
      alert('Failed to create listing: ' + insertError.message)
    } else {
      const newListing = insertData[0]
  
      // Update local state to reflect new listing in sidebar
          const { data: refreshedListings, error: fetchError } = await supabase
          .from('listings')
          .select('*')

        if (!fetchError && refreshedListings) {
          const grouped = {}
          refreshedListings.forEach(listing => {
            if (!grouped[listing.category]) grouped[listing.category] = []
            grouped[listing.category].push(listing)
          })
          setListingsByCategory(grouped)
        }

  
      setActiveCategory(newListing.category)
      setActivePanel(newListing.category)
      setItemFormVisible(false)
  
      //  Redirect to listing detail page
      router.push(`/listing/${newListing.id}?category=${encodeURIComponent(newListing.category)}`)
    }
  }
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setFormData({ ...formData, photo: file, photoPreview: preview })
    }
  }

  const removePhoto = () => {
    setFormData({ ...formData, photo: null, photoPreview: null })
  }
 
  const listingCards = [
    { title: 'Item for sale', desc: 'Lorem ipsum dolor sit' },
    { title: 'Create multiple listings', desc: 'Lorem ipsum dolor sit' },
    { title: 'Vehicle for sale', desc: 'Lorem ipsum dolor sit' },
    { title: 'Home for sale or rent', desc: 'Lorem ipsum dolor sit' }
  ]

  const showCards = ['Choose listing type', 'Your listings', 'Seller help'].includes(activePanel)

  return (
    <div className="flex bg-[#f0f2f5] min-h-screen">
      {!isItemFormVisible && (
        <div className="bg-white w-64 min-h-screen p-6 mt-4 ml-8 rounded-lg text-[15px]">
          <div className="mb-6 mt-0">
            <h2 className="text-[20px] font-bold mb-4">Create new listing</h2>
            {['Choose listing type', 'Your listings', 'Seller help'].map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  setActivePanel(item)
                  setItemFormVisible(false)
                }}
                className={`flex items-center gap-2 text-gray-700 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
                  activePanel === item ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                {i === 2 ? <FaUser className="text-gray-500" /> : <FaTag className="text-gray-500" />}
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-[20px] font-bold mb-4">Categories</h2>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li
                  key={category}
                  onClick={() => {
                    setActiveCategory(category)
                    setActivePanel(category)
                    setItemFormVisible(false)
                  }}
                  className={`px-3 py-2 rounded-md cursor-pointer transition-all ${
                    activeCategory === category
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex-1 pt-6 px-12">
        <div className="mb-6">
          <h1 className="text-[30px] font-bold mb-3">{activePanel}</h1>
          {categories.includes(activePanel) && !isItemFormVisible && (
  <div className="flex gap-2 items-center mb-4">
    <div className="relative w-full max-w-2xl">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
      <input
        type="text"
        placeholder="Search listings..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
    <button  onClick={handleSearch}className="bg-black text-white px-4 py-2 rounded-md text-sm">
      Search
    </button>
  </div>
)}
          {categories.includes(activePanel) && !isItemFormVisible && listingsByCategory[activeCategory] && (
             
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {
      (listingsByCategory[activeCategory] || [])
      .filter(listing => {
        if (searchTerm.trim() === '') return true
        return listing.title.toLowerCase().includes(searchTerm.toLowerCase())
      })

      .map(listing => (
        <div key={listing.id} className="bg-white p-4 rounded-lg shadow">
          <img src={listing.image_url} className="w-full h-48 object-cover rounded mb-3" />
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <p className="text-gray-600">${listing.price}</p>
          <p className="text-sm text-gray-500 mt-1">{listing.location}</p>
          <button
            onClick={() => router.push(`/listing/${listing.id}?category=${listing.category}`)}
            className="mt-3 text-blue-600 text-sm font-medium"
          >
            View Details →
          </button>
        </div>
      ))}
  </div>
)}
        </div>

        {showCards && !isItemFormVisible ? (
          <div className="flex flex-wrap gap-7 justify-center mt-2">
            {listingCards.map((card, index) => {
              const isTall = index === 1 || index === 3
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (card.title === 'Item for sale') setItemFormVisible(true)
                  }}
                  className={`bg-white rounded-xl ${
                    isTall ? 'h-[18rem]' : 'h-[16rem]'
                  } w-56 flex flex-col items-center justify-between hover:shadow-md transition p-3 cursor-pointer`}
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  </div>
                  <h3 className="text-[20px] font-bold text-center mt-8">{card.title}</h3>
                  <p className="text-gray-500 text-sm text-center mt-auto">{card.desc}</p>
                </div>
              )
            })}
          </div>
        ) : isItemFormVisible ? (
          <div className="flex gap-12 mt-6">
              <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
              <h2 className="text-[20px] font-semibold mb-2">Photos</h2>
              <div className="border border-dashed border-gray-300 rounded-lg h-72 w-full flex items-center justify-center text-center text-gray-500 text-sm relative overflow-hidden">
                {formData.photo ? (
                  <div className="relative w-full h-full overflow-auto">
                    <img src={formData.photoPreview} alt="Uploaded" className="w-full h-full object-cover rounded-md" />
                    <button type="button" className="absolute top-1 right-1 text-white bg-red-500 rounded-full p-1" onClick={removePhoto}>
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <p className="font-medium">Add photos</p>
                    <p>JPEG, PNG, or WebP (max 5MB)</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium">What are you selling?</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="E.g., Bicycle, Laptop..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block mb-1 font-medium">Select a category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-gray-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block mb-1 font-medium">Price</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block mb-1 font-medium">Location</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Palo Alto, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="your@email.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block mb-1 font-medium">Describe your item</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md h-24"
                  placeholder="Add details about the condition, features, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white px-6 py-2 rounded-md mt-2">Create Listing</button>
            </form>

            <div className="flex-1 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">Preview</h2>
              <div className="w-full h-96 rounded-md mb-4 bg-gray-100 flex items-center justify-center overflow-auto">
                {formData.photo ? (
                  <img src={formData.photoPreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <span className="text-gray-400">No image uploaded</span>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">{formData.title || 'Title'}</h3>
                <p className="text-xl font-semibold mb-1">{formData.price ? `$${formData.price}` : 'Price'}</p>
                <p className="text-gray-500 text-base mb-2">Listed just now<br />in {formData.location || 'Palo Alto, CA'}</p>
                <p className="font-semibold text-xl mt-4 mb-1">Seller Information</p>
                <p className="text-base text-gray-600">{formData.email || 'seller@email.com'}</p>
                <p className="font-semibold text-xl mt-4 mb-1">Description</p>
                <p className="text-xl mb-1">{formData.description ? `${formData.description}` : ''}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center mt-20 text-center">
            <p className="text-lg font-semibold mb-2">No listings found</p>
            <p className="text-gray-500 mb-4">Be the first to create a listing!</p>
            <button
              onClick={() => {
                setActivePanel('Choose listing type')
                setItemFormVisible(false)
              }}
              className="bg-black text-white px-5 py-2 rounded-md"
            >
              Create Listing
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

