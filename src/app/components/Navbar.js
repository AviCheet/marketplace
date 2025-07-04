import { FaBell, FaEnvelope, FaUserCircle } from 'react-icons/fa'

export default function Navbar() {
  return (
    <div className="flex items-center justify-between px-6 py-2 bg-white">
    {/* Left Section */}
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 text-white rounded-full w-10 h-10 ml-10 flex items-center justify-center font-bold text-[20px]">
        F
      </div>
      <span className="font-semibold  text-[25px]">Marketplace</span>
    </div>
  
    {/* Right Icons */}
    <div className="flex items-center gap-6 text-gray-500 text-xl mr-10">
      <FaEnvelope className="hover:opacity-80 cursor-pointer" />
      <FaBell className="hover:opacity-80 cursor-pointer" />
      <FaUserCircle className="hover:opacity-80 cursor-pointer" />
    </div>
  </div>
  )
}


