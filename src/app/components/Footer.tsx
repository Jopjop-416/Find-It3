import React from "react";
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import foundItLogo from "figma:asset/logo2.webp";

export function Footer() {
  return (
    <footer className="mt-6 w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:items-start">
          {/* About Section */}
          <div>
            <img
              src={foundItLogo}
              alt="Found It Logo"
              className="h-5 w-auto object-contain mb-9"
            />
            <h3 className="text-lg font-semibold text-orange-500 mb-4">
              Lost & Found UMM
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed text-justify">
              Platform digital untuk membantu mahasiswa dan civitas akademika
              menemukan atau melaporkan barang hilang dan ditemukan di
              lingkungan Universitas Muhammadiyah Malang.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:pt-14 md:ml-17">
            <h3 className="text-lg font-semibold text-orange-500 mb-4">
              Menu Cepat
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  Galeri Barang
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  Lapor Kehilangan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  Lapor Penemuan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-orange-500 transition-colors"
                >
                  Kontak Admin
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:pt-14">
            <h3 className="text-lg font-semibold text-orange-500 mb-4">
              Kontak Kami
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  Jl. Raya Tlogomas No.246, Malang, Jawa Timur 65144
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-gray-300">(0341) 464318</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-gray-300">info@umm.ac.id</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="md:pt-14">
            <h3 className="text-lg font-semibold text-orange-500 mb-4">
              Media Sosial
            </h3>
            <p className="text-sm text-gray-300">
              Ikuti kami di media sosial untuk update terbaru
            </p>
            <div className="flex space-x-4 mt-8">
              <a
                href="https://facebook.com/universitasmuhamadiyahmalang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/univ.muhammadiyahmalang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/umm_official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/universitasmuhamadiyahmalang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-orange-500 rounded-full flex items-center justify-center transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400 text-center md:text-left">
              &copy; {new Date().getFullYear()} Universitas Muhammadiyah Malang.
              All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-orange-500 transition-colors"
              >
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
