export const PEMBANGKIT_COLUMNS = () => {
  return [
  { headerName: "Point Number", field: "point_number" },
  { headerName: "Tipe Point", field: "nama_pointtype" },
  { headerName: "B1 (Lokasi)", field: "path1" },
  { headerName: "B2 (Tegangan)", field: "path2" },
  { headerName: "B3 (Bay)", field: "path3" },
  { headerName: "B4 (Element)", field: "path4" },
  { headerName: "B5 (Info)", field: "path5" },
  { headerName: "Tanggal Value", field: "datum_capture" },
  { headerName: "Value", field: "value" },
  { headerName: "Tanggal Status", field: "datum_2" },
  { headerName: "Status", field: "status_2" },
  { headerName: "Durasi", field: "durasi" },
  {
    headerName: "Kesimpulan",
    field: "kesimpulan",
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


