'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sepet sayısı değiştiğinde animasyon göster
  useEffect(() => {
    if (cartCount > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartAnimation(true);
      const timer = setTimeout(() => setCartAnimation(false), 600);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center z-50">
            <Image 
              src="/notouchness3.png" 
              alt="Logo" 
              width={200} 
              height={180}
              className="w-32 sm:w-40 md:w-48 h-auto"
              priority
            />
          </Link>
          
          {/* Desktop Menu - Center */}
          <div className="hidden lg:flex gap-8 xl:gap-12">
            <Link href="/" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Ana Sayfa</Link>
            <Link href="/#how-it-works" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide" scroll>
              Nasıl Kullanılır?
            </Link>
            <Link href="/hakkimizda" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Hakkımızda</Link>
            <Link href="/store" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">Mağaza</Link>
            <Link href="/iletisim" className="text-white/70 hover:text-white transition text-sm font-light tracking-wide">İletişim</Link>
          </div>
          
          {/* Right Side - Cart & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button 
              onClick={onCartClick}
              className={`bg-white/10 text-white px-3 sm:px-4 py-2 text-sm flex items-center gap-2 rounded-lg hover:bg-white/20 transition relative ${
                cartAnimation ? 'scale-110' : ''
              }`}
            >
              <ShoppingCart size={16} className={cartAnimation ? 'animate-bounce' : ''} />
              <span className={`font-semibold hidden sm:inline ${cartAnimation ? 'scale-125' : ''} transition-transform`}>
                {cartCount}
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></span>
              )}
            </button>

            <Link
              href="/card/login"
              className="hidden lg:inline-flex items-center px-4 py-2 bg-white text-black text-sm font-medium rounded-lg shadow-sm hover:bg-gray-100 transition"
            >
              Giriş
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Menu */}
            <div className="lg:hidden fixed inset-0 top-16 sm:top-20 bg-black z-40">
              {/* Header with Logo and Close Button */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                  {/* <Image 
                    src="/notouchness3.png" 
                    alt="Logo" 
                    width={200} 
                    height={180}
                    className="w-32 sm:w-40 h-auto"
                  /> */}
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:text-white/70 transition p-2 -mr-2"
                  aria-label="Menüyü Kapat"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Menu Items */}
              <div className="flex flex-col overflow-y-auto">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/5 transition px-6 py-4 border-b border-white/5"
                >
                  Ana Sayfa
                </Link>
                <Link 
                  href="/#how-it-works" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/5 transition px-6 py-4 border-b border-white/5"
                  scroll
                >
                  Nasıl Kullanılır?
                </Link>
                <Link 
                  href="/hakkimizda" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/5 transition px-6 py-4 border-b border-white/5"
                >
                  Hakkımızda
                </Link>
                <Link 
                  href="/store" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/5 transition px-6 py-4 border-b border-white/5"
                >
                  Mağaza
                </Link>
                <Link 
                  href="/iletisim" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/5 transition px-6 py-4 border-b border-white/5"
                >
                  İletişim
                </Link>
                <Link 
                  href="/card/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/5 transition px-6 py-4 border-b border-white/5"
                >
                  Giriş
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
