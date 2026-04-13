# Dokploy Environment Configuration

Berikut adalah informasi kredensial database untuk deployment di Dokploy:

## Internal Credentials
- **User**: `postgres`
- **Database Name**: `pgdb_klinik`
- **Password**: `pgdb_klinik`
- **Internal Host**: `klinik-pgdb-x8vfnn`
- **Internal Port**: `5432`
- **Connection URL**: `postgresql://postgres:pgdb_klinik@klinik-pgdb-x8vfnn:5432/pgdb_klinik`

## External Credentials
- **External Port**: `5432`

## Environment Variables for App
Jika aplikasi Anda membutuhkan variabel lingkungan untuk koneksi database, gunakan format berikut:

```env
DB_HOST=klinik-pgdb-x8vfnn
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=pgdb_klinik
DB_NAME=pgdb_klinik
DATABASE_URL=postgresql://postgres:pgdb_klinik@klinik-pgdb-x8vfnn:5432/pgdb_klinik
```
