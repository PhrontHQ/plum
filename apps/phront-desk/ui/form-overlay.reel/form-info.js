const apptDataObj = new Object()

apptDataObj.user_agent = navigator.userAgent

window.addEventListener("message", (event) => {
  var data = event.data,
      dataKeys = Object.keys(data),
      i, countI,
      form = document.getElementsByTagName("form")[0];

  for(i=0, countI = dataKeys.length; (i<countI); i++) {
    apptDataObj[dataKeys[i]] = data[dataKeys[i]];
    // form[dataKeys[i]].value = data[dataKeys[i]];
  }

  //Now set all values
  Object.keys(apptDataObj).forEach((item) => {
    $(`input[name="${item}"]`).val(apptDataObj[item]);
    $(`input[name="${item}"]`).addClass('disabled');
  })


  //appointment_guid

  // console.log("message: ",event);
  // if (event.origin !== "http://example.org:8080")
  //   return;

  // // ...
}, false);

// location.search
//   .replace('?', '')
//   .split('&')
//   .forEach((item) => {
//     const rowData = item.split('=')
//     apptDataObj[rowData[0]] = rowData[1]
//   })

// const guid = apptDataObj.appointment_guid

// const patientInfo = async () => {
//   try {
//     const authToken =
//       'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcmlnaW4iOiJodHRwczovL3RvcHMtZm9ybXMuY29tIiwicHJhY3RpY2VfaWQiOiI0In0.Hxpx0drk_XagOxK0PvrE4rZx5_glEipPJRXe5Z6XmJw'
//     const updatedHeader = {
//       headers: {
//         Authorization: authToken,
//         origin: window.location.href,
//       },
//       method: 'GET',
//     }
//     const url = `https://api.threadcommunication.com/api/v1/patient_forms?appointment_guid=${guid}`
//     return fetch(url, updatedHeader)
//       .then((response) => {
//         if (response.ok) {
//           return response.json()
//         } else {
//           $('#error_modal').addClass('visible')
//         }
//       })
//       .catch((error) => {
//         console.error(error)
//         $('#error_modal').addClass('visible')
//       })
//   } catch (err) {
//     console.error(err)
//   }
// }

const patientData = {first_name: "Melinda", last_name: "Truhlar"};

const newDate = new Date()

const setDates = () => {
  const month = () => {
    if ((newDate.getMonth() + 1) / 10 < 1) return `0${newDate.getMonth() + 1}`
    else return newDate.getMonth() + 1
  }
  const today = `${month()}/${newDate.getDate()}/${newDate.getFullYear()}`
  apptDataObj.accept_date = today
  apptDataObj.resched_date = today
}

const getIP = async () => {
  const ipv4 = await $.get('https://api.ipify.org/?format=json')
  const ipv6 = await $.get('https://api64.ipify.org/?format=json')
  return {
    ipv4: ipv4.ip,
    ipv6: ipv6.ip,
  }
}

const fetchAll = async () => {
  try {
    setDates()
    //const patientData = await patientInfo()
    // const patientData = {first_name: "Melinda", last_name: "Truhlar"};
    const ipData = await getIP()
    // if (!!patientData) {
    //   apptDataObj.first_name = patientData.first_name
    //   apptDataObj.last_name = patientData.last_name
    // }
    apptDataObj.ipv4 = ipData.ipv4
    apptDataObj.ipv6 = ipData.ipv6
  } catch (err) {
    console.error(err)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {

    parent.postMessage("iFrameDOMContentLoaded","*");

    var form = document.getElementsByTagName("form")[0];
    form.onsubmit = function(event) {
      var formData = new FormData( event.target),
        formDataIteraror = formData.entries(),
        _postMessageFriendlyformData = {},
        iEntry;

      while(iEntry = formDataIteraror.next().value) {
        _postMessageFriendlyformData[iEntry[0]] = iEntry[1];
          // console.log(iEntry);
      }

      parent.postMessage(_postMessageFriendlyformData,"*");

      return false;
    }



    $('.datepicker').datepicker()
    // - initialize object to collect meta data and patient data
    return fetchAll().then(() => {
      $('.loader').css('display', 'none')
      Object.keys(apptDataObj).forEach((item) => {
        $(`input[name="${item}"]`).val(apptDataObj[item])
        $(`input[name="${item}"]`).addClass('disabled')
      })
    })
  } catch (err) {
    console.error(err)
  }
})
