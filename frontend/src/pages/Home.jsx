import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Menu from '../components/Menu';
import HowItWorks from '../components/HowItWorks';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import LeaveReview from '../components/LeaveReview';
import About from '../components/About';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import OrderModal from '../components/OrderModal';
import WhatsAppButton from '../components/WhatsAppButton';
import SlotBanner from '../components/SlotBanner';

export default function Home() {
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const openOrder = (product = null) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
  };

  const closeOrder = () => {
    setOrderModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <SlotBanner onOrderClick={() => openOrder()} />
      <Navbar onOrderClick={() => openOrder()} />
      <Hero onOrderClick={() => openOrder()} />
      <Menu onOrder={openOrder} />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <LeaveReview />
      <About />
      <FAQ />
      <Contact onOrderClick={() => openOrder()} />
      <WhatsAppButton />
      {orderModalOpen && (
        <OrderModal
          product={selectedProduct}
          onClose={closeOrder}
        />
      )}
    </>
  );
}
