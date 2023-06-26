// See https://github.com/koajs/bodyparser#options for reference

export default {
  enableTypes: ["json", "form", "raw"],
  formLimit: "50mb",
  jsonLimit: "10mb",
  textLimit: "10mb",
  strict: false,
  multipart: true,
  // formidable:true,
};
