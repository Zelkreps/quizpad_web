function showInputType() {
  var selectBox = document.getElementById("answerType");
  var inputContainer = document.getElementById("inputContainer");
  var tableContainer = document.getElementById("tableContainer");

  inputContainer.innerHTML = "";
  tableContainer.innerHTML = "";

  if (selectBox.value === "open") {
    var openInput = document.createElement("input");
    openInput.type = "text";
    openInput.className = "form-control";
    openInput.placeholder = "Odpověď";

    var row = document.createElement("div");
    row.className = "row";
    var col = document.createElement("div");
    col.className = "col";
    col.appendChild(openInput);
    row.appendChild(col);

    inputContainer.appendChild(row);
  } else if (selectBox.value === "multi") {
    var answerImage = document.createElement("input");
    answerImage.type = "url";
    answerImage.className = "form-control mx-3 mt-3";
    answerImage.placeholder = "URL obrázku";

    var toggleButton = document.createElement("button");
    toggleButton.className = "btn btn-outline-dark";
    toggleButton.innerHTML = "❌";
    var isChecked = false;

    toggleButton.onclick = function () {
      if (isChecked) {
        toggleButton.innerHTML = "❌";
      } else {
        toggleButton.innerHTML = "✔";
      }
      isChecked = !isChecked;
    };

    var answerInput = document.createElement("input");
    answerInput.type = "text";
    answerInput.className = "form-control mr-2";
    answerInput.placeholder = "Odpověď";

    var addButton = document.createElement("button");
    addButton.innerHTML = "Přidat";
    addButton.className = "btn btn-primary";
    addButton.onclick = function () {
      var image = answerImage.value;
      var answer = answerInput.value;
      var isTrue = isChecked;

      if (answer !== "") {
        var table = document.createElement("table");
        table.className = "table";

        var tbody = document.createElement("tbody");

        var row = document.createElement("tr");

        var icon = document.createElement("td");
        icon.style.width = "78px";
        icon.textContent = isTrue ? "✔" : "❌";

        var answerCell = document.createElement("td");
        answerCell.textContent = answer;

        var imageCell = document.createElement("td");
        imageCell.style.textAlign = "right";
        imageCell.textContent = image;

        row.appendChild(icon);
        row.appendChild(answerCell);
        row.appendChild(imageCell);

        tbody.appendChild(row);
        table.appendChild(tbody);

        tableContainer.appendChild(table);

        answerInput.value = "";
        answerImage.value = "";
      }
    };

    var row = document.createElement("div");
    row.className = "row align-items-center";
    var col1 = document.createElement("div");
    col1.className = "col-auto";
    col1.appendChild(toggleButton);
    var col2 = document.createElement("div");
    col2.className = "col";
    col2.appendChild(answerInput);
    var col3 = document.createElement("div");
    col3.className = "col-auto";
    col3.appendChild(addButton);
    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);

    row.appendChild(answerImage);

    inputContainer.appendChild(row);
  }
}

// Nastavení výchozí hodnoty na "Multi-choice"
document.addEventListener("DOMContentLoaded", function () {
  var selectBox = document.getElementById("answerType");
  selectBox.value = "multi";
  showInputType(); // Zavoláme funkci showInputType() pro zobrazení odpovídajícího vstupu
});

function resetForm() {
  var questionInput = document.getElementById("question");
  var questionImage = document.getElementById("questionImage");
  var inputContainer = document.getElementById("inputContainer");
  var tableContainer = document.getElementById("tableContainer");

  questionInput.value = "";
  questionImage.value = "";
  inputContainer.innerHTML = "";
  tableContainer.innerHTML = "";

  showInputType();
}

function submitForm() {
  var question = document.getElementById("question").value;
  var answerType = document.getElementById("answerType").value;
  var questionImage = document.getElementById("questionImage").value;
  var answers = [];
  var formData = [];

  if (question == "") {
    // Check if question input is empty
    alert("Vyplňte prosím otázku.");
    return;
  }

  if (answerType === "open") {
    // Check if answer input is empty
    if (
      document
        .getElementById("inputContainer")
        .querySelector("input[type='text']") === ""
    ) {
      alert("Vyplňte prosím odpověď.");
      return;
    }
  } else if (answerType === "multi") {
    // Check if at least one question is added
    var questionList = document
      .getElementById("tableContainer")
      .querySelectorAll("tr");
    if (questionList.length === 0) {
      alert("Přidejte prosím alespoň jednu odpověď.");
      return;
    }
  }

  if (document.getElementById("jsonOutput").innerText.length != 0) {
    formData = JSON.parse(document.getElementById("jsonOutput").innerText);
  }

  if (answerType === "open") {
    var openAnswerInput = document
      .getElementById("inputContainer")
      .querySelector("input[type='text']");

    var answerObject = {
      answer: openAnswerInput.value,
    };

    answers.push(answerObject);
  } else if (answerType === "multi") {
    var answerImageInput = document
      .getElementById("inputContainer")
      .querySelector("input[type='url']");

    var tableRows = document
      .getElementById("tableContainer")
      .querySelectorAll("tr");

    for (var i = 0; i < tableRows.length; i++) {
      var tableRow = tableRows[i];
      var cells = tableRow.getElementsByTagName("td");

      // Check if the table row contains the expected number of cells
      if (cells.length !== 3) {
        console.error(
          "Invalid table structure. Each row should have two cells."
        );
        continue;
      }

      var iconCell = cells[0];
      var answerCell = cells[1];
      var imageCell = cells[2];

      var answerText = answerCell.textContent.trim();
      var imageUrl = imageCell.textContent.trim();
      var isTrue = iconCell.textContent === "✔";

      var answerObject = {
        answer: answerText,
        isRight: isTrue,
      };

      if (imageUrl != "") {
        answerObject.image = {
          imageType: "url",
          path: imageUrl,
        };
      }

      answers.push(answerObject);
    }
  }

  // Vytvoření objektu question
  let questionObj = {
    question: question,
    type: answerType === "open" ? "open" : "multiple",
  };

  // Přidání odpovědi podle typu otázky
  questionObj.answers = answers;

  // Přidání objektu image, pokud questionImage není prázdný
  if (questionImage !== "") {
    questionObj.image = {
      imageType: "url",
      path: questionImage,
    };
  }

  // Přidání questionObj do formData
  formData.push(questionObj);

  var jsonString = JSON.stringify(formData, null, 2);
  document.getElementById("jsonOutput").innerText = jsonString;
  resetForm();
}

function exportJson() {
  var jsonContent = JSON.parse(document.getElementById("jsonOutput").innerText);
  var filename = "test.json";

  var blob = new Blob([JSON.stringify(jsonContent)], { type: "application/json" });
  var url = URL.createObjectURL(blob);

  var link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}