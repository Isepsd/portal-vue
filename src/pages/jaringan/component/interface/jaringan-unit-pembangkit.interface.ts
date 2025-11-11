export interface IJaringanUnitPembangkit {
  nama_lokasi?: string
  alamat?: string
  id_pembangkit?: string
  id_unit_induk?: string
  path1?: string
  path2?: string
  path3?: string
  status_listrik?: string
  sinkron_data?: string
  ssot_number?: string
  id_up2b?: string
  kode_lokasi?: string
  jenis_layanan?: string
  jenis_gi?: string
  load?: string
  rekon_beban?: string
  lat?: number
  lon?: number
  id_user_created?: string
  id_user_updated?: string
}

export const JaringanUnitPembangkitField: IJaringanUnitPembangkit = {
  nama_lokasi: '',
  alamat: '',
  id_pembangkit: '',
  id_unit_induk: '',
  path1: '',
  path2: '',
  path3: '',
  status_listrik: '0',
  sinkron_data: '',
  ssot_number: '',
  id_up2b: '',
  kode_lokasi: '',
  jenis_layanan: '',
  jenis_gi: '',
  load: '',
  rekon_beban: '0',
  lat: 0,
  lon: 0
}
