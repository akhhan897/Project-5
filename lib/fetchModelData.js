function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve({ data: JSON.parse(xhr.responseText) });
        } else {
          reject(new Error(xhr.responseText));
        }
      }
    };
    xhr.send();
  });
}

export default fetchModel;
