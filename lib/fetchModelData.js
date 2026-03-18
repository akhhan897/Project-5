function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve({ data: JSON.parse(xhr.responseText) });
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
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}

export default fetchModel;
