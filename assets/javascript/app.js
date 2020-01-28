// Global Variables
var trainName = "";
var trainDestination = "";
var trainTime = "";
var trainFrequency = "";
var nextArrival = "";
var minutesAway = "";

// jQuery global variables
var elTrain = $("#train-name");
var elTrainDestination = $("#train-destination");
var elTrainTime = $("#train-time").mask("00:00");
var elTimeFreq = $("#time-freq").mask("00");

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDRc8WHqEiPmt5eZgB_HxRygGA31dqHKPg",
  authDomain: "train-schedule-bd950.firebaseapp.com",
  databaseURL: "https://train-schedule-bd950.firebaseio.com",
  projectId: "train-schedule-bd950",
  storageBucket: "train-schedule-bd950.appspot.com",
  messagingSenderId: "236709814864"
};

firebase.initializeApp(config);

var database = firebase.database();

database.ref("/trains").on("child_added", function(snapshot) {
  //  create local variables to store the data from firebase
  var trainDiff = 0;
  var trainRemainder = 0;
  var minutesTillArrival = "";
  var nextTrainTime = "";
  var frequency = snapshot.val().frequency;

  // compute the difference in time from 'now' and the first train using UNIX timestamp, store in var and convert to minutes
  trainDiff = moment().diff(moment.unix(snapshot.val().time), "minutes");

  // get the remainder of time by using 'moderator' with the frequency & time difference, store in var
  trainRemainder = trainDiff % frequency;

  // subtract the remainder from the frequency, store in var
  minutesTillArrival = frequency - trainRemainder;

  // add minutesTillArrival to now, to find next train & convert to standard time format
  nextTrainTime = moment()
    .add(minutesTillArrival, "m")
    .format("hh:mm A");

  // append to our table of trains, inside tbody, with a new row of the train data
  $("#table-data").append(
    "<tr><td>" +
      snapshot.val().name +
      "</td>" +
      "<td>" +
      snapshot.val().destination +
      "</td>" +
      "<td>" +
      frequency +
      "</td>" +
      "<td>" +
      minutesTillArrival +
      "</td>" +
      "<td>" +
      nextTrainTime +
      "  " +
      "<a><span class='glyphicon glyphicon-remove icon-hidden' aria-hidden='true'></span></a>" +
      "</td></tr>"
  );

  $("span").hide();

  // Hover view of delete button
  $("tr").hover(
    function() {
      $(this)
        .find("span")
        .show();
    },
    function() {
      $(this)
        .find("span")
        .hide();
    }
  );

  $("#table-data").on("click", "tr span", function() {
    console.log(this);
    var trainRef = database.ref("/trains/");
    console.log(trainRef);
  });
});

var storeInputs = function(event) {
  // prevent from from reseting
  event.preventDefault();

  // get & store input values
  trainName = elTrain.val().trim();
  trainDestination = elTrainDestination.val().trim();
  trainTime = moment(elTrainTime.val().trim(), "HH:mm")
    .subtract(1, "years")
    .format("X");
  trainFrequency = elTimeFreq.val().trim();

  // add to firebase databse
  database.ref("/trains").push({
    name: trainName,
    destination: trainDestination,
    time: trainTime,
    frequency: trainFrequency,
    nextArrival: nextArrival,
    minutesAway: minutesAway,
    date_added: firebase.database.ServerValue.TIMESTAMP
  });

  //  alert that train was added
  alert("Train successuflly added!");

  //  empty form once submitted
  elTrain.val("");
  elTrainDestination.val("");
  elTrainTime.val("");
  elTimeFreq.val("");
};

$("#btn-add").on("click", function(event) {
  if (
    elTrain.val().length === 0 ||
    elTrainDestination.val().length === 0 ||
    elTrainTime.val().length === 0 ||
    elTimeFreq === 0
  ) {
    alert("Please Fill All Required Fields");
  } else {
    // if form is filled out, run function
    storeInputs(event);
  }
});

// Calls storeInputs function if enter key is clicked
$("form").on("keypress", function(event) {
  if (event.which === 13) {
    if (
      elTrain.val().length === 0 ||
      elTrainDestination.val().length === 0 ||
      elTrainTime.val().length === 0 ||
      elTimeFreq === 0
    ) {
      alert("Please Fill All Required Fields");
    } else {
      storeInputs(event);
    }
  }
});
