var trainName = "";
var destination = "";
var frequency = "";
var nextArrival = "";
var firstTrain = "";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyDV2R04iHKk7reBWt6j1Us51kr_mht6344",
  authDomain: "train-scheduler-1aeaa.firebaseapp.com",
  databaseURL: "https://train-scheduler-1aeaa.firebaseio.com",
  projectId: "train-scheduler-1aeaa",
  storageBucket: "",
  messagingSenderId: "239226890992"
};
firebase.initializeApp(config);

var database = firebase.database();

// function deals with submit card pushes to database
$(document).on("click", "#btnSubmit", function(event) {
  event.preventDefault();
  // values from boxes
  trainName = $("#nameInput")
    .val()
    .trim();
  destination = $("#destInput")
    .val()
    .trim();
  firstTrain = $("#firstTrainInput")
    .val()
    .trim();
  frequency = $("#frequencyInput")
    .val()
    .trim();

  var tableRow = $("<tr>");
  var tableData1 = $("<td>");
  tableData1.text(trainName);
  var tableData2 = $("<td>");
  tableData2.text(destination);
  var tableData3 = $("<td>");
  tableData3.text(firstTrain);
  var tableData4 = $("<td>");
  tableData4.text(frequency);

  database.ref().push({
    name: trainName,
    dest: destination,
    first: firstTrain,
    freq: frequency,
    // next: minAway,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  });
});

database.ref().on(
  "value",
  function(snapshot) {
    $("#trainRow").empty();

    var sv = snapshot.val();

    for (var id in sv) {
      populateUI(sv[id], id);
    }
  },
  function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  }
);

function populateUI(snapshot, id) {
  var firstTrainTime = moment(snapshot.first, "HH:mm");
  var maxTime = moment.max(moment(), firstTrainTime);

  if (maxTime === firstTrainTime) {
    nextArrival = firstTrainTime.format("hh:mm A");
    tMinutesTillTrain = firstTrainTime.diff(moment(), "minutes");
  } else {
    var firstTimeConverted = moment(snapshot.first, "HH:mm").subtract(
      1,
      "years"
    );
    console.log(firstTimeConverted);
    console.log(snapshot.first);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));

    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    var tRemainder = diffTime % snapshot.freq;
    console.log("remaining minutes: " + tRemainder);

    var tMinutesTillTrain = snapshot.freq - tRemainder;
    console.log("MINUTES TILL TRAIN: " + tMinutesTillTrain);

    nextArrival = moment().add(tMinutesTillTrain, "minutes");
    nextArrival = moment(nextArrival).format("h:mm A");
  }

  console.log(snapshot.name);
  console.log(snapshot.dest);
  console.log(snapshot.first);
  console.log(snapshot.freq);

  var tableRow = $("<tr>");
  tableRow.addClass(`${id}`);
  var tableData1 = $("<td>");
  tableData1.text(snapshot.name);
  var tableData2 = $("<td>");
  tableData2.text(snapshot.dest);
  var tableData3 = $("<td>");
  tableData3.text(snapshot.freq);
  var tableData4 = $("<td>");
  tableData4.text(nextArrival);
  var tableData5 = $("<td>");
  tableData5.text(tMinutesTillTrain);
  var tableData6 = $("<td>");
  tableData6.append("<button>");
  tableData6.addClass("remove");

  tableRow.append(
    tableData1,
    tableData2,
    tableData3,
    tableData4,
    tableData5,
    tableData6
  );
  $("#trainRow").append(tableRow);

  $(document).on("click", ".remove", function() {
    var path = this.parentElement.className;
    firebase
      .database()
      .ref(path)
      .remove();
  });
}
