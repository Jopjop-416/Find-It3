# Find-It AI Matching Service

FastAPI service yang menghasilkan image embeddings menggunakan **OpenCLIP (ViT-B-32)** dan memungkinkan vector similarity search untuk sistem auto-matching Find-It.

## Persyaratan

- Python 3.10+
- 2 GB RAM minimum (model OpenCLIP + server overhead)
- CPU (GPU NVIDIA opsional, lebih cepat)

## Setup (Pertama Kali)

### 1. Buat virtual environment

```powershell
cd ai-service
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Setelah berhasil, `(.venv)` akan muncul di terminal.

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

> ⚠️ `torch` dan `open_clip_torch` cukup besar (~500 MB–1 GB). Pastikan koneksi stabil.

### 3. Konfigurasi environment

```powershell
Copy-Item .env.example .env
```

Edit `.env` dan isi nilai-nilai berikut:

```env
SUPABASE_URL=https://pkvmbyojnpgzchmaidfg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key_dari_supabase_dashboard>

CLIP_MODEL=ViT-B-32
CLIP_PRETRAINED=openai
```

> ⛔ **JANGAN** pernah memasukkan `SUPABASE_SERVICE_ROLE_KEY` ke dalam kode React/frontend.

### 4. Jalankan server

```powershell
uvicorn app.main:app --reload --port 8000
```

Output saat berhasil:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Loading OpenCLIP model 'ViT-B-32' (pretrained='openai') on device 'cpu' …
INFO:     OpenCLIP model loaded. Embedding dimension: 512
```

> 💡 Download model pertama kali bisa memakan waktu 1–5 menit tergantung kecepatan internet.

## API Endpoints

### `GET /`
Status dasar (tidak load model).

### `GET /health`
Health check detail — juga memuat model jika belum dimuat.

**Response:**
```json
{
  "status": "ok",
  "model": "ViT-B-32/openai",
  "dimension": 512
}
```

### `POST /embed`
Generate embedding dari gambar.

**Request:**
```json
{
  "image_url": "https://your-supabase-storage-url.../photo.jpg"
}
```

atau gunakan base64:
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "embedding": [0.021, -0.012, ...],
  "model": "ViT-B-32/openai",
  "dimension": 512,
  "source": "url"
}
```

### `POST /similarity`
Hitung cosine similarity antara dua embedding.

**Request:**
```json
{
  "embedding_a": [0.021, -0.012, ...],
  "embedding_b": [0.018, -0.009, ...]
}
```

**Response:**
```json
{
  "cosine_similarity": 0.87,
  "visual_score_percent": 87.0
}
```

> ⚠️ `visual_score_percent` adalah **indikator kemiripan visual** (0–100). Ini **bukan probabilitas** bahwa kedua barang adalah benda yang sama. Nilai harus dikalibrasi menggunakan dataset uji Anda sendiri.

## Integrasi dengan React

Variabel environment yang diperlukan di frontend (`.env`):

```env
VITE_AI_SERVICE_URL=http://127.0.0.1:8000
```

Frontend hanya memanggil `/embed` dan `/health`. Tidak ada secret yang dikirim ke frontend.

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `torch` tidak install | Coba `pip install torch --index-url https://download.pytorch.org/whl/cpu` |
| Model download gagal | Cek koneksi internet, coba ulang |
| CORS error dari React | Pastikan `ALLOWED_ORIGINS` di `.env` berisi `http://localhost:5173` |
| Import error `app.*` | Pastikan Anda menjalankan `uvicorn` dari dalam folder `ai-service/` |

## Catatan untuk Skripsi

Model yang digunakan: **OpenCLIP ViT-B-32 (pretrained: openai)**
- Menghasilkan embedding **512 dimensi**
- Cocok dengan kolom `image_embedding vector(512)` di database Supabase
- Tidak memerlukan API key (model open-source, dijalankan lokal)
- License: MIT

Algoritma lama (token-overlap) tetap tersedia sebagai `legacy-v1` untuk perbandingan.
Bandingkan performa keduanya menggunakan dataset dengan pasangan positif dan negatif.
