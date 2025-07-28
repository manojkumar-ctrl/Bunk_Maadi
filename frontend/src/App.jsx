import React from 'react'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Workflow from './pages/Workflow'
import Logger from './pages/Logger'
import Calculator from './pages/Calculator'
import Footer from './components/Footer'
import Login from './pages/Login'

const App = () => {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-black">
      <Navbar />
      
      {/* Page content wrapper that grows to fill space */}
      <div className="flex-grow w-full px-0">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/workflow' element={<Workflow />} />
          <Route path='/logger' element={<Logger />} />
          <Route path='/calculator' element={<Calculator />} />
          <Route path='/login' element={<Login />} />

        </Routes>
      </div>

      {/* Footer will always be at the bottom */}
      <Footer />
    </div>
  )
}

export default App
