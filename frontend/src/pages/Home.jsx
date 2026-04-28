import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Menu from '../components/Menu';
import HowItWorks from '../components/HowItWorks';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import About from '../components/About';
import Contact from '../components/Contact';
import OrderModal from '../components/OrderModal';

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
      <Navbar onOrderClick={() => openOrder()} />
      <Hero onOrderClick={() => openOrder()} />
      <Menu onOrder={openOrder} />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <About />
      <Contact onOrderClick={() => openOrder()} />
      {orderModalOpen && (
        <OrderModal
          product={selectedProduct}
          onClose={closeOrder}
        />
      )}
    </>
  );
}
