'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  HiOutlineViewGrid,
  HiOutlineCreditCard,
  HiOutlineReceiptRefund,
  HiOutlineCurrencyDollar,
  HiOutlineFlag,
  HiUserCircle,
  HiMenu,
  HiX,
  HiMoon,
  HiSun,
} from 'react-icons/hi';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile sidebar open/close
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', isDark);
  }, [isDark]);

  // Nav items with icons
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <HiOutlineViewGrid size={20} /> },
    { href: '/expenses', label: 'Expenses', icon: <HiOutlineCreditCard size={20} /> },
    { href: '/receipts', label: 'Receipts', icon: <HiOutlineReceiptRefund size={20} /> },
    { href: '/budgets', label: 'Budgets', icon: <HiOutlineCurrencyDollar size={20} /> },
    { href: '/goals', label: 'Goals', icon: <HiOutlineFlag size={20} /> },
  ];

  return (
    <>
      {/* Hamburger (Mobile) */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded bg-teal-700 text-white shadow-lg hover:bg-teal-800 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-teal-700 text-white dark:bg-black dark:text-white
          z-40 flex flex-col
          p-6
          w-64
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          shadow-lg md:shadow-none
          flex-shrink-0
        `}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center md:justify-start">
          <h1 className="text-3xl font-extrabold tracking-tight whitespace-nowrap">
            PVA
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3 text-base font-medium flex-grow">
          {navLinks.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200
                  ${
                    active
                      ? 'bg-white text-teal-700 dark:bg-teal-600 dark:text-white'
                      : 'hover:bg-white/20'
                  }
                `}
              >
                <span className="min-w-[20px]">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User Avatar and Dark Mode toggle */}
        <div className="mt-auto flex flex-col">
          {/* User Avatar */}




{/* User Avatar */}
<div className="mb-6 flex items-center gap-3">
  <HiUserCircle size={40} />
  <div>
    <Link
      href="/profile"  // change this to your actual profile route
      className="block font-medium text-white hover:text-teal-300 cursor-pointer"
    >
      <p>Puneet</p>
      <p className="text-xs text-teal-300">puneet@example.com</p>
    </Link>
  </div>
</div>


          {/* Dark Mode Toggle */}
          <label className="flex items-center justify-between cursor-pointer text-sm font-medium">
            <span>{isDark ? <><HiMoon /> Dark Mode</> : <><HiSun /> Light Mode</>}</span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isDark}
                onChange={() => setIsDark(!isDark)}
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 rounded-full peer-checked:bg-teal-500 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-full" />
            </div>
          </label>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
