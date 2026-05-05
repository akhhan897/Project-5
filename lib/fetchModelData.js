function fetchModel(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const method = options.method || "GET";

    xhr.open(method, url);
    xhr.responseType = "json";

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ data: xhr.response });
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      }
    };

    xhr.onerror = function () {
      reject({
        status: xhr.status,
        statusText: xhr.statusText || "Network Error",
      });
    };

    xhr.send();
  });
}

export default fetchModel;