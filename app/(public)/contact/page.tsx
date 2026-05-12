'use client';

import React, { useState } from 'react';
import { showSuccess } from '@/lib/swal';

// Tipe data untuk form
interface FormData {
  nama: string;
  email: string;
  pesan: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    email: '',
    pesan: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handler untuk mendeteksi perubahan input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler saat form disubmit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Di sini Anda akan menghubungkan ke API (misal: endpoint Prisma yang kita buat sebelumnya)
    // Contoh: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
    
    console.log('Data yang siap dikirim:', formData);
    
    // Simulasi loading sebentar
    setTimeout(() => {
      showSuccess(`Terima kasih ${formData.nama}, pesan Anda telah terkirim!`);
      setFormData({ nama: '', email: '', pesan: '' }); // Reset form
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans">
      
      {/* Container Utama */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Sisi Kiri: Informasi Kontak */}
        <div className="bg-slate-900 text-white p-8 md:p-12 md:w-2/5 flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-4">Mari Berbincang!</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Punya pertanyaan, ide, atau proyek menarik? Jangan ragu untuk menghubungi kami. Kami akan membalas secepatnya.
          </p>
          
          <div className="space-y-6">
            <div>
              <span className="block text-slate-300 font-semibold mb-1">📧 Email</span>
              <a href="mailto:halo@perusahaananda.com" className="text-white hover:text-blue-400 transition-colors">
                halo@perusahaananda.com
              </a>
            </div>
            <div>
              <span className="block text-slate-300 font-semibold mb-1">📞 Telepon / WhatsApp</span>
              <p className="text-white">+62 812 3456 7890</p>
            </div>
            <div>
              <span className="block text-slate-300 font-semibold mb-1">📍 Alamat Kantor</span>
              <p className="text-white leading-relaxed">
                Jl. Sudirman No. 123, Jakarta Selatan<br />Indonesia, 12190
              </p>
            </div>
          </div>
        </div>

        {/* Sisi Kanan: Formulir Kontak */}
        <div className="p-8 md:p-12 md:w-3/5">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Kirim Pesan</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nama" className="block text-sm font-semibold text-slate-600 mb-2">Nama Lengkap</label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama Anda"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-600 mb-2">Alamat Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@contoh.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>
            
            <div>
              <label htmlFor="pesan" className="block text-sm font-semibold text-slate-600 mb-2">Pesan Anda</label>
              <textarea
                id="pesan"
                name="pesan"
                value={formData.pesan}
                onChange={handleChange}
                placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white resize-y"
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg transition-all ${
                isSubmitting 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Pesan Sekarang'}
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default Contact;