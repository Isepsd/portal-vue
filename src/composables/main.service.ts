import requestApi from "./api.service";

// Ambil base URL dari Vite environment
const API_MAIN_SERVICE = import.meta.env.VITE_API_MAIN_SERVICE;

// Download file (blob)
const getAllDownload = (path: any, params: any = {}, sourceToken: any) => {
  return requestApi(["headers", "data"]).request({
    url: `${API_MAIN_SERVICE}/${path}`,
    method: "GET",
    responseType: "blob",
    params,
    cancelToken: sourceToken,
  });
};

// Get by ID
const getByIdPath = (path: any, id: any, sourceToken: any) => {
  return requestApi().request({
    url: `${path}/${id}`,
    method: "GET",
    cancelToken: sourceToken,
  });
};

// Get all by path
const getAllByPath = (
  path = "",
  params: any = { page: 1, limit: 1000 },
  sourceToken: any,
  baseUrl: any = undefined
) => {
  return requestApi(null, baseUrl).request({
    url: path.includes("http") ? path : `/${path}`,
    method: "GET",
    params,
    cancelToken: sourceToken,
  });
};

// Post new data
const postByPath = (path = "", params: any, sourceToken: any) => {
  return requestApi().post(
    `/${path}`,
    params,
    { cancelToken: sourceToken }
  );
};

// Update by ID
const putByPath = (path = "", params: any, id: any, sourceToken: any) => {
  return requestApi().put(
    `/${path}${id ? "/" + id : ""}`,
    params,
    { cancelToken: sourceToken }
  );
};

// Delete by ID
const deleteByPath = (path = "", id: any, sourceToken: any) => {
  return requestApi().request({
    url: `/${path}${id ? "/" + id : ""}`,
    method: "DELETE",
    params: {},
    cancelToken: sourceToken,
  });
};

// Batch update for aset ext attributes
const putAsetExtAtrBatch = (path = "", params: any, sourceToken: any) => {
  return requestApi().put(
    `/${path}`,
    params,
    { cancelToken: sourceToken }
  );
};

// Batch update for aset mutasi
const putAsetMutasiBatch = (path = "", params: any, sourceToken: any) => {
  return requestApi().put(
    `/${path}`,
    params,
    { cancelToken: sourceToken }
  );
};

// Batch update for aset
const putAsetBatch = (path = "", params: any, sourceToken: any) => {
  return requestApi().put(
    `/${path}`,
    params,
    { cancelToken: sourceToken }
  );
};

export {
  deleteByPath, getAllByPath, getAllDownload, getByIdPath,
  postByPath, putAsetBatch, putAsetExtAtrBatch,
  putAsetMutasiBatch, putByPath
};

