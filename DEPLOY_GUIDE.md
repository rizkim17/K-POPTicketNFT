# 🚀 Panduan Deploy Smart Contract ke Sepolia Testnet

Panduan ini menjelaskan cara deploy smart contract **KPopNFT** ke jaringan Sepolia Testnet sehingga semua transaksi terdesentralisasi dan bisa dilihat di [Sepolia Etherscan](https://sepolia.etherscan.io).

---

## 📋 Persiapan

### 1. Dapatkan Sepolia ETH (Gratis)
Anda butuh Sepolia ETH untuk membayar gas fee deployment.

**Faucet yang tersedia:**
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/) - Perlu akun Alchemy
- [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) - 0.05 ETH/hari
- [Infura Faucet](https://www.infura.io/faucet/sepolia) - Perlu akun Infura

### 2. Dapatkan RPC URL
Anda butuh endpoint untuk terhubung ke Sepolia network.

**Provider gratis:**
1. Buat akun di [Alchemy](https://www.alchemy.com/)
2. Create New App → Pilih "Ethereum" → "Sepolia"
3. Copy API Key → URL akan seperti: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

### 3. Export Private Key dari MetaMask
> ⚠️ **PENTING**: Jangan pernah share private key! Gunakan akun terpisah untuk development.

1. Buka MetaMask
2. Klik 3 titik pada akun → **Account Details**
3. **Show Private Key** → Masukkan password
4. Copy private key (dimulai dengan `0x`)

---

## 🔧 Konfigurasi

### 1. Buat file `.env`

Di folder project, buat file `.env` (copy dari `.env.example`):

```env
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_FROM_METAMASK
```

### 2. Pastikan `.env` di `.gitignore`

File `.env` mengandung private key sensitif. Pastikan tidak ter-commit ke Git!

---

## 🚀 Deploy ke Sepolia

### Langkah 1: Compile Contract

```bash
npx hardhat compile
```

### Langkah 2: Deploy ke Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Output yang diharapkan:

```
KPopNFT deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

**Alamat kontrak akan otomatis tersimpan di:**
`frontend/src/contracts/contract-address.json`

---

## ✅ Verifikasi Deployment

### 1. Cek di Sepolia Etherscan

Buka: `https://sepolia.etherscan.io/address/ALAMAT_KONTRAK_ANDA`

Anda akan melihat:
- Contract creation transaction
- Contract balance
- Semua transaksi yang terjadi

### 2. Update Admin Address

Setelah deploy, alamat wallet yang Anda gunakan otomatis menjadi **Owner** kontrak.

Update alamat admin di file-file berikut agar sesuai dengan wallet Anda:
- `frontend/admin-login.html` (baris ~143)
- `frontend/admin.html` (baris ~21)
- `frontend/admin-users.html`
- `frontend/admin-settings.html`
- `frontend/create-event.html`

Ganti:
```javascript
const ADMIN_ADDRESS = '0x22a43025906Ca17d7e8f5068c187c2c7C5b1e80a'.toLowerCase();
```
Dengan alamat wallet Anda.

---

## 🔗 Melihat Transaksi

Setelah deploy, semua transaksi akan terdesentralisasi dan bisa dilihat di blockchain:

| Aksi | Di mana melihat |
|------|-----------------|
| Deploy Contract | `https://sepolia.etherscan.io/address/ALAMAT_KONTRAK` |
| Create Event | Tab "Transactions" di Etherscan |
| Mint Ticket | Tab "Transactions" dan "Token Transfers" |
| Transfer NFT | Tab "ERC-721 Token Txns" |

---

## 🛠️ Troubleshooting

### Error: "insufficient funds"
→ Anda butuh lebih banyak Sepolia ETH. Gunakan faucet.

### Error: "nonce too low"
→ Reset akun di MetaMask: Settings → Advanced → Clear activity tab data

### Error: "could not detect network"
→ Cek SEPOLIA_URL di file `.env`. Pastikan valid.

### Private Key error
→ Pastikan private key dimulai dengan `0x` dan lengkap (66 karakter)

---

## 📝 Catatan Penting

1. **Sepolia adalah TESTNET** - ETH tidak memiliki nilai nyata
2. **Kontrak bersifat immutable** - Setelah deploy, kode tidak bisa diubah
3. **Simpan alamat kontrak** - Anda akan membutuhkannya untuk frontend
4. **Backup private key** - Jika hilang, tidak bisa diakses lagi

---

## 🎉 Selesai!

Setelah deploy berhasil:
1. ✅ Refresh halaman frontend
2. ✅ Login dengan wallet yang sama yang digunakan untuk deploy
3. ✅ Buat event pertama Anda
4. ✅ Cek transaksi di Etherscan!
