'use client';

import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo - Left */}
          <a href="/" className="flex items-center">
            <span className="text-white text-2xl font-light tracking-wider">notouchness</span>
          </a>
          
          {/* Menu - Center */}
          <div className="flex gap-12">
            <a href="/" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Home</a>
            <a href="#" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Nasıl Kullanılır?</a>
            <a href="#" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Ürün Özellikleri</a>
            <a href="/store" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Mağaza</a>
            <a href="#" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">İletişim</a>
            <a href="/user/login" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Giriş</a>
          </div>
          
          {/* Cart - Right */}
          <button 
            onClick={onCartClick}
            className="bg-white/10 text-white px-4 py-2 text-sm flex items-center gap-2 rounded-lg hover:bg-white/20 transition"
          >
            <ShoppingCart size={16} /> {cartCount}
          </button>
        </div>
      </div>
    </nav>
  );
}
