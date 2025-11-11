export const PEMBANGKIT_COLUMNS = () => {
  return [
    { headerName: 'Unit Induk', field: 'nama_pemilik' },
    { headerName: 'Nama Pembangkit', field: 'nama' },
    // { headerName: 'Unit Pembangkit', field: 'parent_lokasi' },
    { headerName: 'latitude', field: 'lat' },
    { headerName: 'longitude', field: 'lon' },
     {
    headerName: 'Mapping SCADA',
      // headerClass: 'text-center',
    marryChildren: true,
    children: [
      { headerName: 'Path1', field: 'path1', minWidth: 120 },
      { headerName: 'Path2', field: 'path2', minWidth: 120 },
      { headerName: 'Path3', field: 'path3', minWidth: 120 },
      { headerName: 'ID I (Arus)', field: 'id_i', minWidth: 120 },
      { headerName: 'ID V (Tegangan)', field: 'id_v', minWidth: 140 },
      { headerName: 'ID P (Daya)', field: 'id_p', minWidth: 120 },
    ],
        },
        {
          headerName: 'Mapping AMR',
            headerClass: 'text-center',
          marryChildren: true,
          children: [
            { headerName: 'ID AMR', field: 'id_amr', minWidth: 150 },
          ],
        },
        {
          headerName: 'Mapping Portal External',
            headerClass: 'text-center',
          marryChildren: true,
          children: [
            { headerName: 'ID Portal EXT', field: 'id_portal_ext', minWidth: 120 },
            { headerName: 'URL Webservice', field: 'url_webservice', minWidth: 150 },
          ],
        },
        {
          headerName: 'Status Aktif',
          field: 'status_listrik',
          minWidth: 100,
          filter: true,
        },
  ]
}

export const JENIS_PEMBANGKIT_COLUMNS = () => {
  return [
    { headerName: 'Nama', field: 'nama', minWidth: 200 },
  ]
}

// Di dalam script setup
const statusRenderer = (params: any) => {
  if (params.value === 'Aktif') {
    return `<span class="v-chip v-chip--density-default v-chip--variant-tonal theme--light v-theme--light bg-success text-white" style="font-size:11px;">AKTIF</span>`
  }
  return `<span class="v-chip v-chip--density-default v-chip--variant-tonal theme--light v-theme--light bg-error text-white" style="font-size:11px;">TIDAK AKTIF</span>`
}

const rekonRenderer = (params: any) => {
  if (params.value === 'IYA') {
    return `<span class="v-chip v-chip--density-default v-chip--variant-tonal theme--light v-theme--light bg-success text-white" style="font-size:11px;">IYA</span>`
  }
  return `<span class="v-chip v-chip--density-default v-chip--variant-tonal theme--light v-theme--light bg-error text-white" style="font-size:11px;">TIDAK</span>`
}

export const GARDU_INDUK_COLUMNS = () => {
  return [
    { headerName: 'Pembangkit', field: 'parent_lokasi', minWidth: 150, filter: true },
    { headerName: 'UP2B', field: 'up2b', minWidth: 150, filter: true },
    { headerName: 'Unit Induk', field: 'unit_induk', minWidth: 150, filter: true },
    { headerName: 'Kode SSOT', field: 'ssot_number', minWidth: 150, filter: true },
    { headerName: 'Kode Gardu Induk', field: 'kode_lokasi', minWidth: 150, filter: true },
    { headerName: 'Nama Gardu Induk', field: 'nama_lokasi', minWidth: 250, filter: true },
    { headerName: 'Jenis Layanan', field: 'jenis_layanan', minWidth: 100, filter: true },
    { headerName: 'Jenis GI', field: 'jenis_gi', minWidth: 100, filter: true },
    {
      headerName: 'Mapping SCADA', field: '', minWidth: 120, filter: true, children: [
        { headerName: 'Path1', field: 'path1', minWidth: 120, filter: true, },
        { headerName: 'Path2', field: 'path2', minWidth: 120, filter: true, },
        { headerName: 'Path3', field: 'path3', minWidth: 120, filter: true, },
        { headerName: 'ID I(Arus)', field: 'id_i', minWidth: 120, filter: true, },
        { headerName: 'ID V(Tegangan)', field: 'id_v', minWidth: 140, filter: true, },
        { headerName: 'ID P(Daya)', field: 'id_p', minWidth: 120, filter: true, }
      ]
    },
    {
      headerName: 'Mapping AMR', field: '', minWidth: 120, filter: true, children: [
        { headerName: 'ID AMR', field: 'id_amr', minWidth: 120, filter: true, }

      ]
    },
    {
      headerName: 'Mapping Portal External', field: 'id_portal_ext', minWidth: 120, filter: true, children: [
        { headerName: 'ID Portal Ext', field: 'id_portal_ext', minWidth: 120, filter: true, },
        { headerName: 'URL Webservice', field: 'url_webservice', minWidth: 120, filter: true, }

      ]
    },
    { headerName: 'Alamat', field: 'alamat', minWidth: 250, filter: true },
    { headerName: 'latitude', field: 'lat', minWidth: 150, filter: true },
    { headerName: 'longitude', field: 'lon', minWidth: 150, filter: true },
    { headerName: 'Status Aktif', field: 'status_listrik', minWidth: 100, filter: true,
      cellRenderer: statusRenderer,
    },
    { headerName: 'Rekon Beban', field: 'rekon_beban', minWidth: 180, filter: true,
      cellRenderer: rekonRenderer,
      
     },

  ]
}
