class BaseException extends Error {
  constructor(httpStatus, apiStatus, message) {
    super(message);
    this.httpStatus = httpStatus;
    this.apiStatus = apiStatus;
  }
}

export default BaseException;
