export const HISTORI_SCADATEL_COLUMNS = () => {
  return [
  {
    headerName: "Point Number",
    field: "point_number",
    pinned: "left",
    width: 150,
    
  },
  {
    headerName: "Tipe Point",
    field: "jenis",
    pinned: "left",
    width: 180,
    
  },
  {
    headerName: "B1 (Lokasi)",
    field: "path1",
    pinned: "left",
    width: 150,
    
  },
  {
    headerName: "B2 (Tegangan)",
    field: "path2",
    pinned: "left",
    width: 150,
    
  },
  {
    headerName: "B3 (Bay)",
    field: "path3",
    pinned: "left",
    width: 150,
    
  },
  {
    headerName: "Element",
    field: "path4",
    width: 150,
    
  },
  {
    headerName: "Info",
    field: "path5",
    width: 150,
    
  },

  // --- Group: Awal ---
  {
    headerName: "Awal",
    marryChildren: true,
    children: [
      {
        headerName: "Tanggal Awal",
        field: "datum_1",
        width: 120,
        
      },
      {
        headerName: "Status Awal",
        field: "status_1",
        width: 140,
        
      },
    ],
  },

  // --- Group: Akhir ---
  {
    headerName: "Akhir",
    marryChildren: true,
    children: [
      {
        headerName: "Tanggal Akhir",
        field: "datum_2",
        width: 120,
        
      },
      {
        headerName: "Status Akhir",
        field: "status_2",
        width: 140,
        
      },
    ],
  },

  {
    headerName: "Durasi Waktu Remote (dd:hh:mm:ss)",
    field: "durasi",
    width: 180,
    
  },
  {
    headerName: "Kesimpulan",
    field: "kesimpulan",
        width: 180,
    cellRenderer: (params: any) => {
      const status = params.value || "INVALID";
      const color =
        status === "VALID"
          ? "#198754"
          : status === "INVALID"
          ? "#dc3545"
          : "#6c757d";
      return `
        <span style="
          background-color: ${color};
          color: #fff;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
        ">
          ${status}
        </span>`;
    },
  },
  ]
}


export const HISTORI_TRIP_COLUMNS = () => {
  return [

  {
      headerName: "B1 (Lokasi)",
      field: "path1",
      pinned: "left",
      minWidth: 150,
      
    },
    {
      headerName: "B2 (Tegangan)",
      field: "path2",
      pinned: "left",
      minWidth: 150,
      
    },
    {
      headerName: "B3 (Bay)",
      field: "path3",
      pinned: "left",
      minWidth: 150,
      
    },

    {
      headerName: "Element",
      field: "path4",
      minWidth: 150,
      
    },
    {
      headerName: "Waktu Trip",
      field: "datum_1",
      minWidth: 150,
      
    },
    {
      headerName: "Waktu Normal",
      field: "datum_2",
      minWidth: 150,
      
    },

    { headerName: "OCR", field: "ocr", minWidth: 50 },
    { headerName: "GFR", field: "gfr", minWidth: 50 },
    { headerName: "I Beban", field: "beban", minWidth: 100 },
    { headerName: "IFR", field: "ifr", minWidth: 50 },
    { headerName: "IFS", field: "ifs", minWidth: 50 },
    { headerName: "IFT", field: "ift", minWidth: 50 },
    { headerName: "IFN", field: "ifn", minWidth: 50 },
    { headerName: "CBTR", field: "cbtr", minWidth: 50 },
  
  ];
}

export const HISTORI_SOE_COLUMNS = () => {
  return [
  {
      headerName: "Tanggal",
      field: "tanggal",
      minWidth: 160,
      filter: false,
      
    },
    {
      headerName: "Message",
      field: "message_text",
      minWidth: 180,
      
      
    },
    {
      headerName: "B1 (Lokasi)",
      field: "path1",
      minWidth: 150,
      
      
    },
    {
      headerName: "B2 (Tegangan)",
      field: "path2",
      minWidth: 150,
      
      
    },
    {
      headerName: "B3 (Bay)",
      field: "path3",
      minWidth: 150,
      
      
    },
    {
      headerName: "Element",
      field: "path4",
      minWidth: 150,
      
      
    },
    {
      headerName: "Info",
      field: "path5",
      minWidth: 150,
      
      
    },
    {
      headerName: "Status",
      field: "msgstatus",
      minWidth: 150,
      
      
    },
    {
      headerName: "Tag",
      field: "tag",
      minWidth: 150,
      
      
    },
    {
      headerName: "Operator",
      field: "operator",
      minWidth: 150,
      
      
    },
    {
      headerName: "Limit",
      field: "limit",
      minWidth: 150,
      
      
    },
    {
      headerName: "Value",
      field: "value",
      minWidth: 150,
      
      
    }
  ];
}


