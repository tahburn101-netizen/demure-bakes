import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Menu from '../components/Menu'
import HowItWorks from '../components/HowItWorks'
import Gallery from '../components/Gallery'
import Testimonials from '../components/Testimonials'
import About from '../components/About'
import Contact from '../components/Contact'

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Menu />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <About />
      <Contact />
    </>
  )
}
