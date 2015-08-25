var notes = 0;
var labs = 0;
var meds = 0;
function loadData() {
  id = window.location.hash.substring(1);
  loadPatient(id);
  for (i = 0; i < 4; i++) {
     patientsNavbar(i);
  }
}

function loadPatientPanels(id_string) {
  for (i = 0; i < 4; i++) {
     loadPatientPanel(i);
     patientsNavbar(i);
  }
}

function loadPatientPanel(id) {
  $.getJSON(API_HOST + 'patients', function(data) {
    var patient_data = data[id+1];
    var patient_obj = $("#patient-" + id);
    patient_obj.find(".patient-name-text").html(patient_data["name"]);
    patient_obj.find(".patient-bed-number").html(patient_data["bed"]);
    patient_obj.find(".patient-temperature").html(patient_data["temperature"].toFixed(1));
    patient_obj.find(".patient-blood-pressure").html(patient_data["blood_pressure"]);
    patient_obj.find(".patient-heart-rate").html(patient_data["heart-rate"]);
  });
}

function loadPatient(id) {
  patient_id = parseInt(id) + 1
  if (patient_id == 1) {
     img_source = "./images/Ann_Droid.jpg"
  } else if (patient_id == 2) {
     img_source = "./images/Mac_Intosh.jpg"
  } else if (patient_id == 3) {
     img_source = "./images/Mike_Rosoft.jpg"
  } else if (patient_id == 4) {
     img_source = "./images/Java_Script.jpg"
  }

  $.getJSON(API_HOST + 'patients/'+patient_id, function(data) {
    $(document).prop('title', 'S-Pi Patient Information: ' + data["name"]);
    $( "#patient-image").html("<img src='" + img_source + "' alt='Patient Image' width='100px'>");
    $( ".name-text").html(data["name"]);
    $( "#age").html(data["age"]);
    $( "#bed").html(data["bed"]);
    $( "#status").html(data["status"]);
    $( ".patient-id").html(data["patient_id"]);
    $( ".hospital-id").html(data["hospital_admission_id"]);
    $( ".case-id").html(data["case_id"]);
    $( ".weight-text").html(data["weight"]);
    $( ".height-text").html(data["height"]);
    $( ".allergies-text").html(data["allergies"]);   
    $( ".bp-text").html(data["blood_pressure"]); 
    $( ".temp").html(data["temperature"].toFixed(1)); 
    $( ".heart-rate-text").html(data["heart-rate"]); 
    if (data["cardiac"] == true) {
      $( ".cardiac-text").html("True");
    } else {
      $( ".cardiac-text").html("False");
    }
    for (i = 0; i < data["clinical_notes"].length; i++) {
       $( ".clinical_note" + i).html(data["clinical_notes"][i]["note"]); 
       $( ".clinical_date" + i).html(data["clinical_notes"][i]["date"]); 
       if (notes < data["clinical_notes"].length) {
          $( "div#progressModal .modal-body" ).append("<table class=\"table table-condensed\"> <tr> <th scope='row'>Date</th><td class='clinical_date" + i +"'></td></tr><tr> <th scope=\"row\">Notes</th><td class='clinical_note" + i + "'></td></tr></table>");
       }
       notes = notes + 1;
    }
    for (i = 0; i < data["labs"].length; i++) {
       $( ".lab_date" + i).html(data["labs"][i]["date"]); 
       $( ".lab_name" + i).html(data["labs"][i]["testName"]); 
       $( ".lab_description" + i).html(data["labs"][i]["description"]); 
       $( ".lab_value" + i).html(data["labs"][i]["value"]); 
       $( ".lab_units" + i).html(data["labs"][i]["valueUnits"]); 
       if ( labs < data["labs"].length) {
          $( "div#labsModal .modal-body" ).append("<table class=\"table table-condensed\"> <tr> <th scope='row'>Date</th><td class='lab_date" + i + "'></td></tr><tr> <th scope='row'>Name</th><td class='lab_name" + i + "'></td></tr><tr> <th scope='row'>Description</th><td class='lab_description" + i + "'></td></tr><tr> <th scope='row'>Value</th><td class='lab_value" + i + "'></td></tr><tr> <th scope='row'>Units</th><td class='lab_units" + i + "'></td></tr></table>");
       }
       labs = labs + 1;
    }

    for (i = 0; i < data["meds"].length; i++) {
       $( ".meds_date" + i).html(data["meds"][i]["date"]); 
       $( ".meds_label" + i).html(data["meds"][i]["label"]); 
       $( ".meds_dose" + i).html(data["meds"][i]["dose"]); 
       $( ".meds_unit" + i).html(data["meds"][i]["doseUnits"]);   
       $( ".meds_route" + i).html(data["meds"][i]["route"]);    
       if ( meds < data["meds"].length) {
          $( "div#medsModal .modal-body" ).append("<table class=\"table table-condensed\"> <tr> <th scope='row'>Date</th><td class='meds_date" + i + "'></td></tr><tr> <th scope='row'>Label</th><td class='meds_label" + i + "'></td></tr><tr> <th scope='row'>Dose</th><td class='meds_dose" + i + "'></td></tr><tr> <th scope='row'>Units</th><td class='meds_unit" + i + "'></td></tr><tr> <th scope='row'>Route</th><td class='meds_route" + i + "'></td></tr></table>");
       }
       meds = meds + 1;  
    }
  });
  setTimeout("loadData()",1000);
}

function patientsNavbar(id) {
  $.getJSON(API_HOST + 'patients', function(data) {
    var patient_data = data[id+1];
    var navbar_obj = $("#navbar-" + id);
    navbar_obj.find(".patient-name-navbar").html(patient_data["name"]);
  });
}

