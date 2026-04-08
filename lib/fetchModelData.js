function fetchModel(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url);
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