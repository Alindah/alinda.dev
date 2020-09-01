var activePage;
var activePageId;
var pages = [];
var lastScrollPos = 0;

function initialize() {
	populatePages();
	setActivePage();
}

function populatePages() {
	var pageElements = document.getElementsByClassName("page");

	// Populate pages array with ids of each page.
	for (var i = 0; i < pageElements.length; i++)
		pages[i] = pageElements[i].id;
}

/*============*\
|| NAVIGATION ||
\*============*/
function setActivePage() {
	// Get new variables.
	activePage = document.getElementsByClassName("active-tab")[0];
	activePageId = activePage.id.replace("nav-", "");
}

function scrollToPage(element) {
	document.getElementById(element.id.replace("nav-", "")).scrollIntoView();
}

function updateActivePage(element) {
	// How many pixels away from element top before we trigger the tab switch.
	var tolerance = window.screen.height * 0.15;

	// Positions of top of each page.
	var homePosition = document.getElementById("home");
	var aboutPosition = document.getElementById("about");
	var expPosition = document.getElementById("experience");
	var conPosition = document.getElementById("contact");

	// How close you need to scroll before it registers as a new page.
	if (Math.abs(element.scrollTop - homePosition.offsetTop) < tolerance)
		switchPage(document.getElementById("nav-home"));
	else if (Math.abs(element.scrollTop - aboutPosition.offsetTop) < tolerance)
		switchPage(document.getElementById("nav-about"));
	else if (Math.abs(element.scrollTop - expPosition.offsetTop) < tolerance)
		switchPage(document.getElementById("nav-experience"));
	else if (Math.abs(element.scrollTop - conPosition.offsetTop) < tolerance)
		switchPage(document.getElementById("nav-contact"));
}

function switchPage(element) {
	// Remove active tag from previous active page and set to current page.
	activePage.classList.remove("active-tab");
	element.classList.add("active-tab");
	setActivePage();
}