import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      
      <div className=' bg-black flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 mt-10 text-sm'>

            <div >
                <img src={assets.logo} className='mb-5 w-20'alt="" />
                <p className='w-full md:w-2/3 text-slate-200'>
                  BunkMaadi is a smart attendance planner that helps students track subject-wise attendance, apply college-specific thresholds, and calculate how many classes they can safely miss—so they never fall short.
                </p>

            </div>

           <div>
  <p className="text-xl font-medium mb-5 text-white">COMPANY</p>
  <ul className="flex flex-col gap-1 text-slate-200 text-sm">
    <li>Home</li>
    <li>About BunkMaadi</li>
    <li>How It Works</li>
    <li>Privacy Policy</li>
  </ul>
</div>



            <div>
  <p className="text-xl font-semibold mb-5 text-white">GET IN TOUCH</p>
  <ul className="flex flex-col gap-1 text-slate-300 text-sm">
    <li>📞 +91-98802xxxxx</li>
    <li>📧 tonydolphin71@gmail.com</li>
    <li>👨‍💻 Creator: Manojkumar @BMSCE</li>
    <li>📍Built for students who are smarter</li>
  </ul>
</div>

      </div>
                <br />
            <div>
                <hr />
                <p className='py-5 text-sm text-center  text-slate-200'></p>
                        Copyright 2025@slaydrips.com - All Right Reserved.
                        <b></b><b></b>
                        <p className=' text-slate-200 text-center'>Made with ❤️</p>
                        <br />
                       

                
            </div>
    </div>
  )
}

export default Footer
