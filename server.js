require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Mengizinkan akses dari GitHub Pages
app.use(express.json()); // Mengizinkan server membaca format JSON

// Inisialisasi Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Endpoint Tes Apakah Server Jalan
app.get('/', (req, res) => {
    res.send('Server Website Kelas Berhasil Berjalan!');
});

// Endpoint Menerima Data Absen dari Frontend
app.post('/api/absen', async (req, res) => {
    const { namaSiswa, nomorAbsen, statusAbsen, alasan } = req.body;

    // Masukkan data ke tabel bernama 'absensi' di Supabase
    const { data, error } = await supabase
        .from('absensi')
        .insert([
            { 
                nama_siswa: namaSiswa, 
                nomor_absen: parseInt(nomorAbsen), 
                status_absen: statusAbsen || 'Hadir', 
                alasan: alasan || null 
            }
        ]);

    if (error) {
        return res.status(400).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, message: 'Absen berhasil dicatat!' });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

