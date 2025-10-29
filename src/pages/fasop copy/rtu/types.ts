export interface FilterValues {
  page: number
  limit: number
  path1?: string
  path2?: string
  path3?: string
  path4?: string
  path5?: string
  durasi?: string
  kesimpulan?: string
  nama_pointtype?: string
  id_induk_pointtype?: string
}

export type HandleRespDataApiFn = (
  data: any[],
  page: number,
  limit: number
) => any[]
