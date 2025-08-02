import React from 'react'
import Hero from '../components/Hero'
import GetStart from '../components/GetStart.jsx'
import Guide from '../components/Guide.jsx'

const Home = () => {
  return (
    <div className='bg-black'>
      <Hero/>
      <GetStart/>
      <Guide/>
    </div>
  )
}

export default Home
