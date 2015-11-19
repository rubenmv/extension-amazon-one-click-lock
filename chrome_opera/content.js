/*global DomReady*/
// Sometimes DomReady won't trigger (Amazon messes up with it)
// Keep track of the intervals and force stop after a while
var intervals = 0;
var productBox = null; // Product page buy box
var password = "";
var blocker = null;
var errorNode = null; // To display error messages

function isNull(item) {
  return (item === undefined || item === null);
}

/**
 * Show 1-click button
 */
function show1ClicButton() {
  blocker.style.display = "none";
  productBox.style.display = "block";
}

/**
 * Displays error on password incorrect
 */
function onPasswordIncorrect() {
  errorNode.textContent = "Password incorrect";
  window.setTimeout(function () {
    errorNode.textContent = "";
		}, 2000);
}

/**
 * Check password
 */
function onAccept() {
  var inputPass = document.getElementById("blocker-password");
  if (inputPass) {
    if (password === inputPass.value) {
      show1ClicButton();
    }
    else {
      onPasswordIncorrect();
    }
  }

  return false;
}

/**
 * Lock button is clicked
 */
function onBlockerClick(e) {
  e.preventDefault();
  blocker.removeEventListener("click", onBlockerClick);
  if (password.trim() !== "" && !document.getElementById("blocker-password")) {
    // Password input
    var input = document.createElement("input");
    input.setAttribute("id", "blocker-password");
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "16");
    input.addEventListener("keypress", function (evt) {
      var key = evt.which || evt.keyCode;
      if (key === 13) {
        onAccept();
      }
    });
    blocker.appendChild(input);
    // Get the focus
    input.focus();
    input.select();
    // Accept button
    var button = document.createElement("a");
    button.innerHTML = "Accept";
    button.setAttribute("id", "accept-button");
    button.setAttribute("class", "btn");
    button.addEventListener("click", onAccept);
    blocker.appendChild(button);
    // Error messages
    errorNode = document.createElement("span");
    errorNode.setAttribute("class", "error");
    errorNode.style.display = "block";
    blocker.insertBefore(errorNode, button);
    // Change blocker class to disable button behaviour
    blocker.setAttribute("class", "blocker-opened blocker-icon");
  }
  else {
    show1ClicButton();
  }

  return false;
}

/**
 * Hide 1 click buttons
 */
function seekAndHide() {
  var oneClickButtons = document.querySelectorAll(".a-button-oneclick, .a-button-preorder");
  for (var i = 0; i < oneClickButtons.length; i++) {
    oneClickButtons[i].style.display = "none";
  }
}

/**
 * Do a last pass and create the lock box in the product page
 */
function lastPass() {
  window.clearInterval(buttonChecker);
  seekAndHide();
  
  // Get one click button (only in products page)
  var ocb = document.getElementById("one-click-button"), // one-click-button
    ocp = document.getElementsByName("submit.preorder")[0], // No id for preorder, great...
    ocbo = document.getElementById("buyButton"); // one-click-button old style page
  
  if (ocb || ocp || ocbo) {
    // Is product page, create lock box
    blocker = document.createElement("div");
    blocker.setAttribute("id", "one-click-blocker");

    //var button = document.createElement("button");
    blocker.setAttribute("class", "blocker blocker-icon");
    blocker.innerHTML = "Unlock 1-Click";
    blocker.addEventListener("click", onBlockerClick);

    var form = null;
     
    // "Replace" the hidden 1-click button
    if (ocb) { // 1-click buy
      productBox = document.getElementsByClassName("a-button-oneclick")[0];
      form = document.getElementById("buyOneClick");
      if(!form) { // Really, Amazon? REALLY? one-click box inside #addToCart form????
        form = document.getElementById("addToCart");
      }
    }
    else if (ocp) { // 1-click peorder
      productBox = document.getElementsByClassName("a-button-preorder")[0];
      form = document.getElementById("buyOneClick");
    }
    else if (ocbo) { // 1-click buy old style (amazon.es, etc.)
      ocbo.style.display = "none";
      productBox = ocbo;
      form = document.getElementById("kicsBuyBoxForm");
    }
    // Place bloquer outside form to prevent accidental submit on enter key
    if (form) {
      form.parentNode.insertBefore(blocker, form);
    }
  }
  
  // Set block password
  var options = {};
  options.password = "";
  chrome.storage.local.get({ password: "" }, function (items) {
    // Check for error
    if (chrome.runtime.lastError !== undefined) {
      console.error("An error ocurred restoring options: " + chrome.runtime.lastError);
      return;
    }
    // Get password
    password = items.password;
  });
}

/**
 * Look for the button every x ms
 */
var buttonChecker = window.setInterval(function () {
  intervals++;
  // Check for one click buttons on page and hide them
  seekAndHide();
  // Force stop checker if DOMReady is not triggering
  if (intervals > 10) {
    lastPass();
  }
}, 500);

/**
 * After loading page check if button was found or try once more
 */
DomReady.ready(function () {
  lastPass();
});
