require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Konfigurasi CORS agar client/GitHub Pages dapat mengakses backend Vercel
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Inisialisasi Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Endpoint Tes
app.get('/', (req, res) => {
    res.json({ status: "online", message: "Server Website Kelas Berhasil Berjalan di Vercel!" });
});

// API Get Perangkat Kelas
app.get('/api/perangkat', async (req, res) => {
    try {
        const { data, error } = await supabase.from('perangkat').select('*');
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Get Jadwal Piket
app.get('/api/piket', async (req, res) => {
    try {
        const { data, error } = await supabase.from('piket').select('*');
        if (error) throw error;
        return res.json(data);
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Register
app.post('/api/register', async (req, res) => {
    const { nama, username, foto, password } = req.body;
    try {
        const { data: existingUser } = await supabase.from('users').select('username').eq('username', username).maybeSingle();
        if (existingUser) return res.status(400).json({ success: false, message: "Username sudah terdaftar!" });

        const { data, error } = await supabase.from('users').insert([{ nama, username, foto, password }]).select();
        if (error) throw error;
        return res.status(201).json({ success: true, message: "Registrasi berhasil!", user: data[0] });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
        if (error || !user) return res.status(404).json({ success: false, message: "Username tidak terdaftar!" });
        if (user.password !== password) return res.status(401).json({ success: false, message: "Password salah!" });

        const { password: _, ...userData } = user;
        return res.status(200).json({ success: true, message: "Login berhasil!", user: userData });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// API Absensi
app.post('/api/absen', async (req, res) => {
    const { namaSiswa, nomorAbsen, statusAbsen, alasan } = req.body;
    try {
        const { data, error } = await supabase.from('absensi').insert([{
            nama_siswa: namaSiswa,
            nomor_absen: parseInt(nomorAbsen),
            status_absen: statusAbsen || 'Hadir',
            alasan: alasan || null
        }]);
        if (error) throw error;
        return res.status(200).json({ success: true, message: 'Absen berhasil dicatat!' });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = app;