function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
<<<<<<< HEAD
      if (xhr.status === 200) {
        resolve({ data: JSON.parse(xhr.responseText) });
=======
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ data: xhr.response });
<<<<<<< HEAD
>>>>>>> d96180e (worked on component files)
=======
>>>>>>> 8f8d071 (fixed a bug)
>>>>>>> 85bc8d6 (fixed a bug)
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
<<<<<<< HEAD
=======

<<<<<<< HEAD
>>>>>>> d96180e (worked on component files)
=======
>>>>>>> 8f8d071 (fixed a bug)
>>>>>>> 85bc8d6 (fixed a bug)
    xhr.send();
  });

}

export default fetchModel;