<<<<<<< HEAD
function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
<<<<<<< HEAD
=======
    xhr.open("GET", url);
    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve({ data: JSON.parse(xhr.responseText) });
=======
=======
function FetchModel(url) {
>>>>>>> 5d74786 (cleanup)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
>>>>>>> 75e0fd3 (cleanup)

    xhr.open("GET", url);
    xhr.responseType = "json";

    xhr.onload = function () {
<<<<<<< HEAD
      if (xhr.status === 200) {
        resolve({ data: JSON.parse(xhr.responseText) });
=======
      if (xhr.status >= 200 && xhr.status < 300) {
<<<<<<< HEAD
        resolve({ data: xhr.response });
<<<<<<< HEAD
>>>>>>> d96180e (worked on component files)
=======
>>>>>>> 8f8d071 (fixed a bug)
<<<<<<< HEAD
>>>>>>> 85bc8d6 (fixed a bug)
=======
=======
        resolve(xhr.response);
>>>>>>> 5d74786 (cleanup)
>>>>>>> 75e0fd3 (cleanup)
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
        });
      }
    };
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 75e0fd3 (cleanup)
    xhr.onerror = function () {
      reject({
        
        status: xhr.status,
<<<<<<< HEAD
=======
        statusText: xhr.statusText,
      });
    };
=======
=======
>>>>>>> 5d74786 (cleanup)

    xhr.onerror = function () {
      reject({
        status: xhr.status,
>>>>>>> 75e0fd3 (cleanup)
        statusText: xhr.statusText || "Network Error",
      });
    };
<<<<<<< HEAD
=======

<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> d96180e (worked on component files)
=======
>>>>>>> 8f8d071 (fixed a bug)
<<<<<<< HEAD
>>>>>>> 85bc8d6 (fixed a bug)
=======
=======
>>>>>>> 5d74786 (cleanup)
>>>>>>> 75e0fd3 (cleanup)
    xhr.send();
  });

}

<<<<<<< HEAD
export default fetchModel;
=======
export default FetchModel;
>>>>>>> 5d74786 (cleanup)
