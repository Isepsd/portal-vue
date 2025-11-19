export interface IJaringanUnitPembangkit {
  nama_lokasi?: string
  alamat?: string
  id_unit_induk?: string
  path1?: string
  path2?: string
  path3?: string
  status_listrik?: string
  lat?: number
  lon?: number
  id_user_created?: string
  id_user_updated?: string
}

export const JaringanUnitPembangkitField: IJaringanUnitPembangkit = {
  nama_lokasi: '',
  alamat: '',
  id_unit_induk: '',
  path1: '',
  path2: '',
  path3: '',
  status_listrik: '0',
  lat: 0,
  lon: 0
}
