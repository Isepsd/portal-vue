/////////////////////////////////////////////////////////////////////////////////////////////////
//TRAFO GI
export function mappingLineChartTrafo(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [],
    a: [],
    v: []
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data.forEach((e: any) => {
    const { trafo } = e || {};
    if (!groupedData[trafo]) {
      groupedData[trafo] = [];
    }
    groupedData[trafo].push(e);
  });

  // Iterasi setiap kelompok trafo
  Object.keys(groupedData).forEach((trafo) => {
    const trafoData = groupedData[trafo];

    // Dataset untuk trafo ini
    const mwData = [
      { name: `Beban Max (MW) - ${trafo}`, data: [] as number[] },
      { name: `Beban AVG (MW) - ${trafo}`, data: [] as number[] },
      { name: `Beban Max Siang (MW) - ${trafo}`, data: [] as number[] },
      { name: `Beban Max Malam (MW) - ${trafo}`, data: [] as number[] },
    ];
    const aData = [
      { name: `Beban Max (A) - ${trafo}`, data: [] as number[] },
      { name: `Beban AVG (A) - ${trafo}`, data: [] as number[] },
      { name: `Beban Max Siang (A) - ${trafo}`, data: [] as number[] },
      { name: `Beban Max Malam (A) - ${trafo}`, data: [] as number[] },
    ];
    const vData = [
      { name: `Tegangan Average (kV) - ${trafo}`, data: [] as number[] },
      { name: `Tegangan Max (kV) - ${trafo}`, data: [] as number[] },
      { name: `Tegangan Min (kV) - ${trafo}`, data: [] as number[] },
    ];

    // Tambahkan data ke dataset berdasarkan nilai dari data trafo
    trafoData.forEach((e: any) => {
      const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum, v_avg, v_min, v_max } = e || {};
      
      mwData[0].data.push(parseFloat(p_max));
      mwData[3].data.push(parseFloat(p_max_malam));
      mwData[2].data.push(parseFloat(p_max_siang));
      mwData[1].data.push(parseFloat(p_avg));

     aData[0].data.push(parseFloat(i_max));
     aData[1].data.push(parseFloat(i_avg));
     aData[2].data.push(parseFloat(i_max_siang));
     aData[3].data.push(parseFloat(i_max_malam));

     vData[0].data.push(parseFloat(v_avg));
     vData[1].data.push(parseFloat(v_max));
     vData[2].data.push(parseFloat(v_min));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok trafo
      // if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      // }
    });

    // Tambahkan dataset trafo ini ke hasil
    res.mw.push(...mwData);
    res.a.push(...aData);
    res.v.push(...vData);
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerjamTrafo(data: any, moment: any) {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data?.forEach((e: any) => {
    const { trafo } = e || {};
    if (!groupedData[trafo]) {
      groupedData[trafo] = [];
    }
    groupedData[trafo].push(e);
  });

  // Iterasi setiap kelompok trafo
  Object.keys(groupedData).forEach((trafo) => {
    const trafoData = groupedData[trafo];
    
    // Dataset untuk trafo ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    trafoData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        // cat.push(moment(datum).format(jamFormat));
        cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
      // }
    });

    // Tambahkan dataset baru untuk trafo ini
    res.mw.push({ name: `Beban (MW) - ${trafo}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${trafo}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${trafo}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerhariTrafo(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data?.forEach((e: any) => {
    const { trafo } = e || {};
    if (!groupedData[trafo]) {
      groupedData[trafo] = [];
    }
    groupedData[trafo].push(e);
  });

  // Iterasi setiap kelompok trafo
  Object.keys(groupedData).forEach((trafo) => {
    const trafoData = groupedData[trafo];
    
    // Dataset untuk trafo ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    trafoData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        cat.push(moment(datum).format(jamFormat));
      // }
    });

    // Tambahkan dataset baru untuk trafo ini
    res.mw.push({ name: `Beban (MW) - ${trafo}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${trafo}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${trafo}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartLoadFactorTrafo(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = [];
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data?.forEach((e: any) => {
    const { trafo } = e || {};
    if (!groupedData[trafo]) {
      groupedData[trafo] = [];
    }
    groupedData[trafo].push(e);
  });

  // Iterasi setiap kelompok trafo
  Object.keys(groupedData).forEach((trafo) => {
    const trafoData = groupedData[trafo];

    // Buat dataset untuk trafo ini
    const dataset = {
      name: `Load Factor - ${trafo}`,
      data: [] as number[],
    };

    // Tambahkan data ke dataset
    trafoData.forEach((e: any, index: number) => {
      const { load_faktor, datum } = e || {};
      dataset.data.push(parseFloat(load_faktor));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok trafo
      if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      }
    });

    // Tambahkan dataset ke hasil
    res.push(dataset);
  });

  return { res: res, cat: cat };
}
////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
//PENYULANG
export function mappingLineChartPenyulang(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [],
    a: [],
    v: []
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data.forEach((e: any) => {
    const { penyulang } = e || {};
    if (!groupedData[penyulang]) {
      groupedData[penyulang] = [];
    }
    groupedData[penyulang].push(e);
  });

  // Iterasi setiap kelompok penyulang
  Object.keys(groupedData).forEach((penyulang) => {
    const penyulangData = groupedData[penyulang];

    // Dataset untuk penyulang ini
    const mwData = [
      { name: `Beban Max (MW) - ${penyulang}`, data: [] as number[] },
      { name: `Beban AVG (MW) - ${penyulang}`, data: [] as number[] },
      { name: `Beban Max Siang (MW) - ${penyulang}`, data: [] as number[] },
      { name: `Beban Max Malam (MW) - ${penyulang}`, data: [] as number[] },
    ];
    const aData = [
      { name: `Beban Max (A) - ${penyulang}`, data: [] as number[] },
      { name: `Beban AVG (A) - ${penyulang}`, data: [] as number[] },
      { name: `Beban Max Siang (A) - ${penyulang}`, data: [] as number[] },
      { name: `Beban Max Malam (A) - ${penyulang}`, data: [] as number[] },
    ];
    const vData = [
      { name: `Tegangan Average (kV) - ${penyulang}`, data: [] as number[] },
      { name: `Tegangan Max (kV) - ${penyulang}`, data: [] as number[] },
      { name: `Tegangan Min (kV) - ${penyulang}`, data: [] as number[] },
    ];

    // Tambahkan data ke dataset berdasarkan nilai dari data penyulang
    penyulangData.forEach((e: any) => {
      const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum, v_avg, v_min, v_max } = e || {};
      
      mwData[0].data.push(parseFloat(p_max));
      mwData[3].data.push(parseFloat(p_max_malam));
      mwData[2].data.push(parseFloat(p_max_siang));
      mwData[1].data.push(parseFloat(p_avg));

     aData[0].data.push(parseFloat(i_max));
     aData[1].data.push(parseFloat(i_avg));
     aData[2].data.push(parseFloat(i_max_siang));
     aData[3].data.push(parseFloat(i_max_malam));

     vData[0].data.push(parseFloat(v_avg));
     vData[1].data.push(parseFloat(v_max));
     vData[2].data.push(parseFloat(v_min));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok penyulang
      // if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      // }
    });

    // Tambahkan dataset penyulang ini ke hasil
    res.mw.push(...mwData);
    res.a.push(...aData);
    res.v.push(...vData);
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerjamPenyulang(data: any, moment: any) {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan penyulang
  data?.forEach((e: any) => {
    const { penyulang } = e || {};
    if (!groupedData[penyulang]) {
      groupedData[penyulang] = [];
    }
    groupedData[penyulang].push(e);
  });

  // Iterasi setiap kelompok penyulang
  Object.keys(groupedData).forEach((penyulang) => {
    const penyulangData = groupedData[penyulang];
    
    // Dataset untuk penyulang ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    penyulangData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        // cat.push(moment(datum).format(jamFormat));
        cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
      // }
    });

    // Tambahkan dataset baru untuk penyulang ini
    res.mw.push({ name: `Beban (MW) - ${penyulang}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${penyulang}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${penyulang}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerhariPenyulang(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan penyulang
  data?.forEach((e: any) => {
    const { penyulang } = e || {};
    if (!groupedData[penyulang]) {
      groupedData[penyulang] = [];
    }
    groupedData[penyulang].push(e);
  });

  // Iterasi setiap kelompok penyulang
  Object.keys(groupedData).forEach((penyulang) => {
    const penyulangData = groupedData[penyulang];
    
    // Dataset untuk penyulang ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    penyulangData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        cat.push(moment(datum).format(jamFormat));
      // }
    });

    // Tambahkan dataset baru untuk penyulang ini
    res.mw.push({ name: `Beban (MW) - ${penyulang}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${penyulang}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${penyulang}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartLoadFactorPenyulang(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = [];
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan penyulang
  data?.forEach((e: any) => {
    const { penyulang } = e || {};
    if (!groupedData[penyulang]) {
      groupedData[penyulang] = [];
    }
    groupedData[penyulang].push(e);
  });

  // Iterasi setiap kelompok penyulang
  Object.keys(groupedData).forEach((penyulang) => {
    const penyulangData = groupedData[penyulang];

    // Buat dataset untuk penyulang ini
    const dataset = {
      name: `Load Factor - ${penyulang}`,
      data: [] as number[],
    };

    // Tambahkan data ke dataset
    penyulangData.forEach((e: any, index: number) => {
      const { load_faktor, datum } = e || {};
      dataset.data.push(parseFloat(load_faktor));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok penyulang
      if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      }
    });

    // Tambahkan dataset ke hasil
    res.push(dataset);
  });

  return { res: res, cat: cat };
}
////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
//UP3
export function mappingLineChartUP3(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [],
    a: [],
    v: []
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data.forEach((e: any) => {
    const { up3 } = e || {};
    if (!groupedData[up3]) {
      groupedData[up3] = [];
    }
    groupedData[up3].push(e);
  });

  // Iterasi setiap kelompok up3
  Object.keys(groupedData).forEach((up3) => {
    const up3Data = groupedData[up3];

    // Dataset untuk up3 ini
    const mwData = [
      { name: `Beban Max (MW) - ${up3}`, data: [] as number[] },
      { name: `Beban AVG (MW) - ${up3}`, data: [] as number[] },
      { name: `Beban Max Siang (MW) - ${up3}`, data: [] as number[] },
      { name: `Beban Max Malam (MW) - ${up3}`, data: [] as number[] },
    ];
    const aData = [
      { name: `Beban Max (A) - ${up3}`, data: [] as number[] },
      { name: `Beban AVG (A) - ${up3}`, data: [] as number[] },
      { name: `Beban Max Siang (A) - ${up3}`, data: [] as number[] },
      { name: `Beban Max Malam (A) - ${up3}`, data: [] as number[] },
    ];
    const vData = [
      { name: `Tegangan Average (kV) - ${up3}`, data: [] as number[] },
      { name: `Tegangan Max (kV) - ${up3}`, data: [] as number[] },
      { name: `Tegangan Min (kV) - ${up3}`, data: [] as number[] },
    ];

    // Tambahkan data ke dataset berdasarkan nilai dari data up3
    up3Data.forEach((e: any) => {
      const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum, v_avg, v_min, v_max } = e || {};
      
      mwData[0].data.push(parseFloat(p_max));
      mwData[3].data.push(parseFloat(p_max_malam));
      mwData[2].data.push(parseFloat(p_max_siang));
      mwData[1].data.push(parseFloat(p_avg));

     aData[0].data.push(parseFloat(i_max));
     aData[1].data.push(parseFloat(i_avg));
     aData[2].data.push(parseFloat(i_max_siang));
     aData[3].data.push(parseFloat(i_max_malam));

     vData[0].data.push(parseFloat(v_avg));
     vData[1].data.push(parseFloat(v_max));
     vData[2].data.push(parseFloat(v_min));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok up3
      // if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      // }
    });

    // Tambahkan dataset up3 ini ke hasil
    res.mw.push(...mwData);
    res.a.push(...aData);
    res.v.push(...vData);
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerjamUP3(data: any, moment: any) {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan up3
  data?.forEach((e: any) => {
    const { up3 } = e || {};
    if (!groupedData[up3]) {
      groupedData[up3] = [];
    }
    groupedData[up3].push(e);
  });

  // Iterasi setiap kelompok up3
  Object.keys(groupedData).forEach((up3) => {
    const up3Data = groupedData[up3];
    
    // Dataset untuk up3 ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    up3Data.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        // cat.push(moment(datum).format(jamFormat));
        cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
      // }
    });

    // Tambahkan dataset baru untuk up3 ini
    res.mw.push({ name: `Beban (MW) - ${up3}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${up3}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${up3}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerhariUP3(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan up3
  data?.forEach((e: any) => {
    const { up3 } = e || {};
    if (!groupedData[up3]) {
      groupedData[up3] = [];
    }
    groupedData[up3].push(e);
  });

  // Iterasi setiap kelompok up3
  Object.keys(groupedData).forEach((up3) => {
    const up3Data = groupedData[up3];
    
    // Dataset untuk up3 ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    up3Data.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        cat.push(moment(datum).format(jamFormat));
      // }
    });

    // Tambahkan dataset baru untuk up3 ini
    res.mw.push({ name: `Beban (MW) - ${up3}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${up3}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${up3}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartLoadFactorUP3(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = [];
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan up3
  data?.forEach((e: any) => {
    const { up3 } = e || {};
    if (!groupedData[up3]) {
      groupedData[up3] = [];
    }
    groupedData[up3].push(e);
  });

  // Iterasi setiap kelompok up3
  Object.keys(groupedData).forEach((up3) => {
    const up3Data = groupedData[up3];

    // Buat dataset untuk up3 ini
    const dataset = {
      name: `Load Factor - ${up3}`,
      data: [] as number[],
    };

    // Tambahkan data ke dataset
    up3Data.forEach((e: any, index: number) => {
      const { load_faktor, datum } = e || {};
      dataset.data.push(parseFloat(load_faktor));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok up3
      if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      }
    });

    // Tambahkan dataset ke hasil
    res.push(dataset);
  });

  return { res: res, cat: cat };
}
////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
//PEMBANGKIT
export function mappingLineChartpembangkit(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [],
    a: [],
    v: []
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data.forEach((e: any) => {
    const { pembangkit } = e || {};
    if (!groupedData[pembangkit]) {
      groupedData[pembangkit] = [];
    }
    groupedData[pembangkit].push(e);
  });

  // Iterasi setiap kelompok pembangkit
  Object.keys(groupedData).forEach((pembangkit) => {
    const pembangkitData = groupedData[pembangkit];

    // Dataset untuk pembangkit ini
    const mwData = [
      { name: `Beban Max (MW) - ${pembangkit}`, data: [] as number[] },
      { name: `Beban AVG (MW) - ${pembangkit}`, data: [] as number[] },
      { name: `Beban Max Siang (MW) - ${pembangkit}`, data: [] as number[] },
      { name: `Beban Max Malam (MW) - ${pembangkit}`, data: [] as number[] },
    ];
    const aData = [
      { name: `Beban Max (A) - ${pembangkit}`, data: [] as number[] },
      { name: `Beban AVG (A) - ${pembangkit}`, data: [] as number[] },
      { name: `Beban Max Siang (A) - ${pembangkit}`, data: [] as number[] },
      { name: `Beban Max Malam (A) - ${pembangkit}`, data: [] as number[] },
    ];
    const vData = [
      { name: `Tegangan Average (kV) - ${pembangkit}`, data: [] as number[] },
      { name: `Tegangan Max (kV) - ${pembangkit}`, data: [] as number[] },
      { name: `Tegangan Min (kV) - ${pembangkit}`, data: [] as number[] },
    ];

    // Tambahkan data ke dataset berdasarkan nilai dari data pembangkit
    pembangkitData.forEach((e: any) => {
      const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum, v_avg, v_min, v_max } = e || {};
      
      mwData[0].data.push(parseFloat(p_max));
      mwData[3].data.push(parseFloat(p_max_malam));
      mwData[2].data.push(parseFloat(p_max_siang));
      mwData[1].data.push(parseFloat(p_avg));

     aData[0].data.push(parseFloat(i_max));
     aData[1].data.push(parseFloat(i_avg));
     aData[2].data.push(parseFloat(i_max_siang));
     aData[3].data.push(parseFloat(i_max_malam));

     vData[0].data.push(parseFloat(v_avg));
     vData[1].data.push(parseFloat(v_max));
     vData[2].data.push(parseFloat(v_min));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok pembangkit
      // if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      // }
    });

    // Tambahkan dataset pembangkit ini ke hasil
    res.mw.push(...mwData);
    res.a.push(...aData);
    res.v.push(...vData);
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerjampembangkit(data: any, moment: any) {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan pembangkit
  data?.forEach((e: any) => {
    const { pembangkit } = e || {};
    if (!groupedData[pembangkit]) {
      groupedData[pembangkit] = [];
    }
    groupedData[pembangkit].push(e);
  });

  // Iterasi setiap kelompok pembangkit
  Object.keys(groupedData).forEach((pembangkit) => {
    const pembangkitData = groupedData[pembangkit];
    
    // Dataset untuk pembangkit ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    pembangkitData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        // cat.push(moment(datum).format(jamFormat));
        cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
      // }
    });

    // Tambahkan dataset baru untuk pembangkit ini
    res.mw.push({ name: `Beban (MW) - ${pembangkit}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${pembangkit}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${pembangkit}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerharipembangkit(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan pembangkit
  data?.forEach((e: any) => {
    const { pembangkit } = e || {};
    if (!groupedData[pembangkit]) {
      groupedData[pembangkit] = [];
    }
    groupedData[pembangkit].push(e);
  });

  // Iterasi setiap kelompok pembangkit
  Object.keys(groupedData).forEach((pembangkit) => {
    const pembangkitData = groupedData[pembangkit];
    
    // Dataset untuk pembangkit ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    pembangkitData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        cat.push(moment(datum).format(jamFormat));
      // }
    });

    // Tambahkan dataset baru untuk pembangkit ini
    res.mw.push({ name: `Beban (MW) - ${pembangkit}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${pembangkit}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${pembangkit}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartLoadFactorpembangkit(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = [];
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan pembangkit
  data?.forEach((e: any) => {
    const { pembangkit } = e || {};
    if (!groupedData[pembangkit]) {
      groupedData[pembangkit] = [];
    }
    groupedData[pembangkit].push(e);
  });

  // Iterasi setiap kelompok pembangkit
  Object.keys(groupedData).forEach((pembangkit) => {
    const pembangkitData = groupedData[pembangkit];

    // Buat dataset untuk pembangkit ini
    const dataset = {
      name: `Load Factor - ${pembangkit}`,
      data: [] as number[],
    };

    // Tambahkan data ke dataset
    pembangkitData.forEach((e: any, index: number) => {
      const { load_faktor, datum } = e || {};
      dataset.data.push(parseFloat(load_faktor));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok pembangkit
      if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      }
    });

    // Tambahkan dataset ke hasil
    res.push(dataset);
  });

  return { res: res, cat: cat };
}
////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
//SUBSISTEM
export function mappingLineChartsubsistem(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [],
    a: [],
    v: []
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data.forEach((e: any) => {
    const { subsistem } = e || {};
    if (!groupedData[subsistem]) {
      groupedData[subsistem] = [];
    }
    groupedData[subsistem].push(e);
  });

  // Iterasi setiap kelompok subsistem
  Object.keys(groupedData).forEach((subsistem) => {
    const subsistemData = groupedData[subsistem];

    // Dataset untuk subsistem ini
    const mwData = [
      { name: `Beban Max (MW) - ${subsistem}`, data: [] as number[] },
      { name: `Beban AVG (MW) - ${subsistem}`, data: [] as number[] },
      { name: `Beban Max Siang (MW) - ${subsistem}`, data: [] as number[] },
      { name: `Beban Max Malam (MW) - ${subsistem}`, data: [] as number[] },
    ];
    const aData = [
      { name: `Beban Max (A) - ${subsistem}`, data: [] as number[] },
      { name: `Beban AVG (A) - ${subsistem}`, data: [] as number[] },
      { name: `Beban Max Siang (A) - ${subsistem}`, data: [] as number[] },
      { name: `Beban Max Malam (A) - ${subsistem}`, data: [] as number[] },
    ];
    const vData = [
      { name: `Tegangan Average (kV) - ${subsistem}`, data: [] as number[] },
      { name: `Tegangan Max (kV) - ${subsistem}`, data: [] as number[] },
      { name: `Tegangan Min (kV) - ${subsistem}`, data: [] as number[] },
    ];

    // Tambahkan data ke dataset berdasarkan nilai dari data subsistem
    subsistemData.forEach((e: any) => {
      const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum, v_avg, v_min, v_max } = e || {};
      
      mwData[0].data.push(parseFloat(p_max));
      mwData[3].data.push(parseFloat(p_max_malam));
      mwData[2].data.push(parseFloat(p_max_siang));
      mwData[1].data.push(parseFloat(p_avg));

     aData[0].data.push(parseFloat(i_max));
     aData[1].data.push(parseFloat(i_avg));
     aData[2].data.push(parseFloat(i_max_siang));
     aData[3].data.push(parseFloat(i_max_malam));

     vData[0].data.push(parseFloat(v_avg));
     vData[1].data.push(parseFloat(v_max));
     vData[2].data.push(parseFloat(v_min));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok subsistem
      // if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      // }
    });

    // Tambahkan dataset subsistem ini ke hasil
    res.mw.push(...mwData);
    res.a.push(...aData);
    res.v.push(...vData);
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerjamsubsistem(data: any, moment: any) {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan subsistem
  data?.forEach((e: any) => {
    const { subsistem } = e || {};
    if (!groupedData[subsistem]) {
      groupedData[subsistem] = [];
    }
    groupedData[subsistem].push(e);
  });

  // Iterasi setiap kelompok subsistem
  Object.keys(groupedData).forEach((subsistem) => {
    const subsistemData = groupedData[subsistem];
    
    // Dataset untuk subsistem ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    subsistemData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        // cat.push(moment(datum).format(jamFormat));
        cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
      // }
    });

    // Tambahkan dataset baru untuk subsistem ini
    res.mw.push({ name: `Beban (MW) - ${subsistem}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${subsistem}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${subsistem}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerharisubsistem(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan subsistem
  data?.forEach((e: any) => {
    const { subsistem } = e || {};
    if (!groupedData[subsistem]) {
      groupedData[subsistem] = [];
    }
    groupedData[subsistem].push(e);
  });

  // Iterasi setiap kelompok subsistem
  Object.keys(groupedData).forEach((subsistem) => {
    const subsistemData = groupedData[subsistem];
    
    // Dataset untuk subsistem ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    subsistemData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        cat.push(moment(datum).format(jamFormat));
      // }
    });

    // Tambahkan dataset baru untuk subsistem ini
    res.mw.push({ name: `Beban (MW) - ${subsistem}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${subsistem}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${subsistem}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartLoadFactorsubsistem(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = [];
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan subsistem
  data?.forEach((e: any) => {
    const { subsistem } = e || {};
    if (!groupedData[subsistem]) {
      groupedData[subsistem] = [];
    }
    groupedData[subsistem].push(e);
  });

  // Iterasi setiap kelompok subsistem
  Object.keys(groupedData).forEach((subsistem) => {
    const subsistemData = groupedData[subsistem];

    // Buat dataset untuk subsistem ini
    const dataset = {
      name: `Load Factor - ${subsistem}`,
      data: [] as number[],
    };

    // Tambahkan data ke dataset
    subsistemData.forEach((e: any, index: number) => {
      const { load_faktor, datum } = e || {};
      dataset.data.push(parseFloat(load_faktor));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok subsistem
      if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      }
    });

    // Tambahkan dataset ke hasil
    res.push(dataset);
  });

  return { res: res, cat: cat };
}
////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
//UP2B
export function mappingLineChartup2b(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [],
    a: [],
    v: []
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data.forEach((e: any) => {
    const { up2b } = e || {};
    if (!groupedData[up2b]) {
      groupedData[up2b] = [];
    }
    groupedData[up2b].push(e);
  });

  // Iterasi setiap kelompok up2b
  Object.keys(groupedData).forEach((up2b) => {
    const up2bData = groupedData[up2b];

    // Dataset untuk up2b ini
    const mwData = [
      { name: `Beban Max (MW) - ${up2b}`, data: [] as number[] },
      { name: `Beban AVG (MW) - ${up2b}`, data: [] as number[] },
      { name: `Beban Max Siang (MW) - ${up2b}`, data: [] as number[] },
      { name: `Beban Max Malam (MW) - ${up2b}`, data: [] as number[] },
    ];
    const aData = [
      { name: `Beban Max (A) - ${up2b}`, data: [] as number[] },
      { name: `Beban AVG (A) - ${up2b}`, data: [] as number[] },
      { name: `Beban Max Siang (A) - ${up2b}`, data: [] as number[] },
      { name: `Beban Max Malam (A) - ${up2b}`, data: [] as number[] },
    ];
    const vData = [
      { name: `Tegangan Average (kV) - ${up2b}`, data: [] as number[] },
      { name: `Tegangan Max (kV) - ${up2b}`, data: [] as number[] },
      { name: `Tegangan Min (kV) - ${up2b}`, data: [] as number[] },
    ];

    // Tambahkan data ke dataset berdasarkan nilai dari data up2b
    up2bData.forEach((e: any) => {
      const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum, v_avg, v_min, v_max } = e || {};
      
      mwData[0].data.push(parseFloat(p_max));
      mwData[3].data.push(parseFloat(p_max_malam));
      mwData[2].data.push(parseFloat(p_max_siang));
      mwData[1].data.push(parseFloat(p_avg));

     aData[0].data.push(parseFloat(i_max));
     aData[1].data.push(parseFloat(i_avg));
     aData[2].data.push(parseFloat(i_max_siang));
     aData[3].data.push(parseFloat(i_max_malam));

     vData[0].data.push(parseFloat(v_avg));
     vData[1].data.push(parseFloat(v_max));
     vData[2].data.push(parseFloat(v_min));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok up2b
      // if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      // }
    });

    // Tambahkan dataset up2b ini ke hasil
    res.mw.push(...mwData);
    res.a.push(...aData);
    res.v.push(...vData);
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerjamup2b(data: any, moment: any) {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan up2b
  data?.forEach((e: any) => {
    const { up2b } = e || {};
    if (!groupedData[up2b]) {
      groupedData[up2b] = [];
    }
    groupedData[up2b].push(e);
  });

  // Iterasi setiap kelompok up2b
  Object.keys(groupedData).forEach((up2b) => {
    const up2bData = groupedData[up2b];
    
    // Dataset untuk up2b ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    up2bData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        // cat.push(moment(datum).format(jamFormat));
        cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
      // }
    });

    // Tambahkan dataset baru untuk up2b ini
    res.mw.push({ name: `Beban (MW) - ${up2b}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${up2b}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${up2b}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerhariup2b(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan up2b
  data?.forEach((e: any) => {
    const { up2b } = e || {};
    if (!groupedData[up2b]) {
      groupedData[up2b] = [];
    }
    groupedData[up2b].push(e);
  });

  // Iterasi setiap kelompok up2b
  Object.keys(groupedData).forEach((up2b) => {
    const up2bData = groupedData[up2b];
    
    // Dataset untuk up2b ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    up2bData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        cat.push(moment(datum).format(jamFormat));
      // }
    });

    // Tambahkan dataset baru untuk up2b ini
    res.mw.push({ name: `Beban (MW) - ${up2b}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${up2b}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${up2b}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartLoadFactorup2b(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = [];
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan up2b
  data?.forEach((e: any) => {
    const { up2b } = e || {};
    if (!groupedData[up2b]) {
      groupedData[up2b] = [];
    }
    groupedData[up2b].push(e);
  });

  // Iterasi setiap kelompok up2b
  Object.keys(groupedData).forEach((up2b) => {
    const up2bData = groupedData[up2b];

    // Buat dataset untuk up2b ini
    const dataset = {
      name: `Load Factor - ${up2b}`,
      data: [] as number[],
    };

    // Tambahkan data ke dataset
    up2bData.forEach((e: any, index: number) => {
      const { load_faktor, datum } = e || {};
      dataset.data.push(parseFloat(load_faktor));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok up2b
      if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      }
    });

    // Tambahkan dataset ke hasil
    res.push(dataset);
  });

  return { res: res, cat: cat };
}
////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
//UNIT INDUK
export function mappingLineChartnama_uid(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [],
    a: [],
    v: []
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan trafo
  data.forEach((e: any) => {
    const { nama_uid } = e || {};
    if (!groupedData[nama_uid]) {
      groupedData[nama_uid] = [];
    }
    groupedData[nama_uid].push(e);
  });

  // Iterasi setiap kelompok nama_uid
  Object.keys(groupedData).forEach((nama_uid) => {
    const nama_uidData = groupedData[nama_uid];

    // Dataset untuk nama_uid ini
    const mwData = [
      { name: `Beban Max (MW) - ${nama_uid}`, data: [] as number[] },
      { name: `Beban AVG (MW) - ${nama_uid}`, data: [] as number[] },
      { name: `Beban Max Siang (MW) - ${nama_uid}`, data: [] as number[] },
      { name: `Beban Max Malam (MW) - ${nama_uid}`, data: [] as number[] },
    ];
    const aData = [
      { name: `Beban Max (A) - ${nama_uid}`, data: [] as number[] },
      { name: `Beban AVG (A) - ${nama_uid}`, data: [] as number[] },
      { name: `Beban Max Siang (A) - ${nama_uid}`, data: [] as number[] },
      { name: `Beban Max Malam (A) - ${nama_uid}`, data: [] as number[] },
    ];
    const vData = [
      { name: `Tegangan Average (kV) - ${nama_uid}`, data: [] as number[] },
      { name: `Tegangan Max (kV) - ${nama_uid}`, data: [] as number[] },
      { name: `Tegangan Min (kV) - ${nama_uid}`, data: [] as number[] },
    ];

    // Tambahkan data ke dataset berdasarkan nilai dari data nama_uid
    nama_uidData.forEach((e: any) => {
      const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum, v_avg, v_min, v_max } = e || {};
      
      mwData[0].data.push(parseFloat(p_max));
      mwData[3].data.push(parseFloat(p_max_malam));
      mwData[2].data.push(parseFloat(p_max_siang));
      mwData[1].data.push(parseFloat(p_avg));

     aData[0].data.push(parseFloat(i_max));
     aData[1].data.push(parseFloat(i_avg));
     aData[2].data.push(parseFloat(i_max_siang));
     aData[3].data.push(parseFloat(i_max_malam));

     vData[0].data.push(parseFloat(v_avg));
     vData[1].data.push(parseFloat(v_max));
     vData[2].data.push(parseFloat(v_min));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok nama_uid
      // if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      // }
    });

    // Tambahkan dataset nama_uid ini ke hasil
    res.mw.push(...mwData);
    res.a.push(...aData);
    res.v.push(...vData);
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerjamnama_uid(data: any, moment: any) {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan nama_uid
  data?.forEach((e: any) => {
    const { nama_uid } = e || {};
    if (!groupedData[nama_uid]) {
      groupedData[nama_uid] = [];
    }
    groupedData[nama_uid].push(e);
  });

  // Iterasi setiap kelompok nama_uid
  Object.keys(groupedData).forEach((nama_uid) => {
    const nama_uidData = groupedData[nama_uid];
    
    // Dataset untuk nama_uid ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    nama_uidData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        // cat.push(moment(datum).format(jamFormat));
        cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
      // }
    });

    // Tambahkan dataset baru untuk nama_uid ini
    res.mw.push({ name: `Beban (MW) - ${nama_uid}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${nama_uid}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${nama_uid}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartPerharinama_uid(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [],
    a: [],
    v: [],
  };
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan nama_uid
  data?.forEach((e: any) => {
    const { nama_uid } = e || {};
    if (!groupedData[nama_uid]) {
      groupedData[nama_uid] = [];
    }
    groupedData[nama_uid].push(e);
  });

  // Iterasi setiap kelompok nama_uid
  Object.keys(groupedData).forEach((nama_uid) => {
    const nama_uidData = groupedData[nama_uid];
    
    // Dataset untuk nama_uid ini
    const mwData: number[] = [];
    const aData: number[] = [];
    const vData: number[] = [];
    
    nama_uidData.forEach((e: any) => {
      const { p, i, v, datum } = e || {};
      mwData.push(parseFloat(p));
      aData.push(parseFloat(i));
      vData.push(parseFloat(v));
      
      // Tambahkan kategori waktu hanya sekali (menggunakan indeks pertama)
      // if (index === 0) {
        cat.push(moment(datum).format(jamFormat));
      // }
    });

    // Tambahkan dataset baru untuk nama_uid ini
    res.mw.push({ name: `Beban (MW) - ${nama_uid}`, data: mwData });
    res.a.push({ name: `Beban (A) - ${nama_uid}`, data: aData });
    res.v.push({ name: `Tegangan (kV) - ${nama_uid}`, data: vData });
    // cat.push(moment(datum).format(jamFormat));
  });

  return { res: res, cat: cat };
}

export function mappingLineChartLoadFactornama_uid(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = [];
  let cat: any = [];
  let groupedData: Record<string, any[]> = {};

  // Kelompokkan data berdasarkan nama_uid
  data?.forEach((e: any) => {
    const { nama_uid } = e || {};
    if (!groupedData[nama_uid]) {
      groupedData[nama_uid] = [];
    }
    groupedData[nama_uid].push(e);
  });

  // Iterasi setiap kelompok nama_uid
  Object.keys(groupedData).forEach((nama_uid) => {
    const nama_uidData = groupedData[nama_uid];

    // Buat dataset untuk nama_uid ini
    const dataset = {
      name: `Load Factor - ${nama_uid}`,
      data: [] as number[],
    };

    // Tambahkan data ke dataset
    nama_uidData.forEach((e: any, index: number) => {
      const { load_faktor, datum } = e || {};
      dataset.data.push(parseFloat(load_faktor));

      // Tambahkan kategori waktu hanya jika indeks pertama dari kelompok nama_uid
      if (index === 0) {
        cat.push(moment(datum).format(dateFormat));
      }
    });

    // Tambahkan dataset ke hasil
    res.push(dataset);
  });

  return { res: res, cat: cat };
}
////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////
//OLD
export function mappingLineChart(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = {
    mw: [
      { name: 'Beban Max (MW)', data: [] },
      { name: 'Beban AVG (MW)', data: [] },
      { name: 'Beban Max Siang (MW)', data: [] },
      { name: 'Beban Max Malam (MW) ', data: [] }
    ],
    a: [
      { name: 'Beban Max (A)', data: [] },
      { name: 'Beban AVG (A)', data: [] },
      { name: 'Beban Max Siang (A)', data: [] },
      { name: 'Beban Max Malam (A)', data: [] }
    ],
    v: [
      { name: 'Tegangan Average (kV)', data: [] },
      { name: 'Tegangan Max (kV)', data: [] },
      { name: 'Tegangan Min (kV)', data: [] },
    ]
  };
  let cat: any = [];
  data.forEach((e: any) => {
    const { p_max, p_avg, p_max_malam, p_max_siang, i_max, i_avg, i_max_malam, i_max_siang, datum,v_avg,v_min,v_max } = e || {};
    res.mw[0].data.push(parseFloat(p_max));
    res.mw[1].data.push(parseFloat(p_avg));
    res.mw[2].data.push(parseFloat(p_max_malam));
    res.mw[3].data.push(parseFloat(p_max_siang));
    res.a[0].data.push(parseFloat(i_max));
    res.a[1].data.push(parseFloat(i_avg));
    res.a[2].data.push(parseFloat(i_max_malam));
    res.a[3].data.push(parseFloat(i_max_siang));
    
    res.v[0].data.push(parseFloat(v_avg));
    res.v[1].data.push(parseFloat(v_max));
    res.v[2].data.push(parseFloat(v_min));
    cat.push(moment(datum).format(dateFormat))
  })
  return { res: res, cat: cat }
}

export function mappingLineChartPerjam(data: any, moment: any) {
  let res: any = {
    mw: [
      { name: 'Beban (MW)', data: [] },
    ],
    a: [
      { name: 'Beban (A)', data: [] },
    ],
    v: [
      { name: 'Tegangan (kV)', data: [] },
    ]
  };
  let cat: any = [];
  data?.forEach((e: any) => {
    const { p, i, v, datum } = e || {};
    res.mw[0].data.push(parseFloat(p));
    res.a[0].data.push(parseFloat(i));
    res.v[0].data.push(parseFloat(v));
    cat.push(moment(datum).format("DD/MM/YYYY HH:mm:ss"))
  })
  return { res: res, cat: cat }
}

export function mappingLineChartPerhari(data: any, moment: any, jamFormat: any = 'HH:mm') {
  let res: any = {
    mw: [
      { name: 'Beban (MW)', data: [] },
    ],
    a: [
      { name: 'Beban (A)', data: [] },
    ],
    v: [
      { name: 'Tegangan (kV)', data: [] },
    ]
  };
  let cat: any = [];
  data?.forEach((e: any) => {
    const { p, i, v, datum } = e || {};
    res.mw[0].data.push(parseFloat(p));
    res.a[0].data.push(parseFloat(i));
    res.v[0].data.push(parseFloat(v));
    cat.push(moment(datum).format(jamFormat))
  })
  return { res: res, cat: cat }
}

export function mappingLineChartLoadFactor(data: any, moment: any, dateFormat: any = 'DD/MM/YYYY') {
  let res: any = { name: 'Load Factor', data: [] };
  let cat: any = [];
  data?.forEach((e: any) => {

    const { load_faktor, datum } = e || {};

    res.data.push(parseFloat(load_faktor));
    cat.push(moment(datum).format(dateFormat))
  })
  return { res: res, cat: cat }
}
////////////////////////////////////////////
