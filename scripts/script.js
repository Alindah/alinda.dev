var activePage;
var activePageId;
var numOfPages = 0;
var pages = {};
var pageByIndex = [];
var currentPageIndex = 0;
var lastScrollPos = 0;

function initialize() {
	populatePages();
	setActivePage();
}

function populatePages() {
	var pageElements = document.getElementsByClassName("page");
	numOfPages = pageElements.length;

	for (var i = 0; i < numOfPages; i++) {
		// Populate pages array with data.		
		pages[pageElements[i].id] = {
			id: pageElements[i].id,
			index: i,
			position: pageElements[i].offsetTop
		};

		// Array so we can look up a page id by referring to its index.
		pageByIndex[i] = pageElements[i].id;
	}
}

/*============*\
|| NAVIGATION ||
\*============*/
function setActivePage() {
	// Get new variables.
	activePage = document.getElementsByClassName("active-tab")[0];
	activePageId = activePage.id.replace("nav-", "");
	currentPageIndex = pages[activePageId].index;
}

function scrollToPage(element) {
	document.getElementById(element.id.replace("nav-", "")).scrollIntoView();
}

function updateActivePage(element) {
	// How many pixels away from element top before we trigger the tab switch.
	var tolerance = window.screen.height * 0.15;

	// How close you need to scroll before it registers as a new page.
	// (Note: There's probably a more efficient way to do this, but we only have 4 pages so no big deal.)
	for (var i = 0; i < numOfPages; i++) {
		currentPage = pageByIndex[i];

		if (Math.abs(element.scrollTop - pages[currentPage].position) < tolerance) {
			switchPage(document.getElementById("nav-" + pages[currentPage].id));
			break;
		}
	}
}

function switchPage(element) {
	// Remove active tag from previous active page and set to current page.
	activePage.classList.remove("active-tab");
	element.classList.add("active-tab");
	setActivePage();
}