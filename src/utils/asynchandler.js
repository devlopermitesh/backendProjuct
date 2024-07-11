const asynchandler = (higherfunc) => {
  return (req, res, next) => {
    Promise.resolve(higherfunc(req, res, next)).catch((error) => next(error));
  };
};

export { asynchandler };
