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
