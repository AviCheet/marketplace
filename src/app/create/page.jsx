'use client'

import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { FaTimes } from 'react-icons/fa'

export default function CreateListingPage() {
  const router = useRouter()
  const categories = [
    'Vehicles', 'Property Rentals', 'Apparel', 'Classifieds', 'Electronics',
    'Entertainment', 'Family', 'Free Stuff', 'Garden & Outdoor', 'Hobbies',
    'Home Goods', 'Home Improvement', 'Home Sales', 'Musical Instruments',
    'Office Supplies', 'Pet Supplies', 'Sporting Goods', 'Toys & Games', 'Buy and sell groups'
  ]

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    let image_url = null
    if (formData.photo && typeof formData.photo !== 'string') {
      const file = formData.photo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('listing-images').upload(fileName, file)

      if (error) {
        alert('Image upload failed')
        return
      }

      image_url = supabase.storage.from('listing-images').getPublicUrl(fileName).data.publicUrl
    }

    const { data: insertData, error: insertError } = await supabase.from('listings').insert({
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category: selectedCategory,
      seller_email: formData.email,
      image_url,
      location: formData.location || 'Palo Alto, CA'
    }).select()

    if (insertError) {
      alert('Failed to create listing: ' + insertError.message)
    } else {
      const newListing = insertData[0]
      router.push(`/listing/${newListing.id}`)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 p-12 bg-[#f0f2f5] min-h-screen">
      <form className="w-full max-w-md space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
        <h2 className="text-[20px] font-semibold mb-2">Create New Listing</h2>
        
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

        <input className="w-full p-2 border border-gray-300 rounded-md" placeholder="What are you selling?" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
        <select className="w-full p-2 border border-gray-300 rounded-md" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Select a category</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input className="w-full p-2 border border-gray-300 rounded-md" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
        <input className="w-full p-2 border border-gray-300 rounded-md" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
        <input className="w-full p-2 border border-gray-300 rounded-md" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        <textarea className="w-full p-2 border border-gray-300 rounded-md h-24" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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
        <h3 className="text-2xl font-bold mb-1">{formData.title || 'Title'}</h3>
        <p className="text-xl font-semibold mb-1">{formData.price ? `$${formData.price}` : 'Price'}</p>
        <p className="text-gray-500 text-base mb-2">Listed just now<br />in {formData.location || 'Location'}</p>
        <p className="font-semibold text-xl mt-4 mb-1">Seller</p>
        <p className="text-base text-gray-600">{formData.email || 'seller@email.com'}</p>
        <p className="font-semibold text-xl mt-4 mb-1">Description</p>
        <p className="text-base">{formData.description || 'Item details here...'}</p>
      </div>
    </div>
  )
}
