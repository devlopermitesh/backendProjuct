const asynchandler = (higherfunc) => (req, res, next) => {
  Promise.resolve(higherfunc(req, res, next)).catch((error) => next(error));
};

// const asynchandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (error) {
//     console.log("error::" + error);
//     res.status(error.code || 500).json({
//       success: true,
//       message: error.message,
//     });
//   }
// };
export { asynchandler };
