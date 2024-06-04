export function pathLog(req, res, next) {
  console.log("path: ", req.path);
  next();
}
