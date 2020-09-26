var activePage;
var activePageId;
var numOfPages = 0;
var pages = {};
var pageByIndex = [];
var lastScrollPos = 0;

function initialize() {
	populatePages();
	setActivePage();
	initializeEventListeners();
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

function initializeEventListeners() {
	var mouseWheelListener = function(e){mouseWheelToNextPage(e);};

	// Prevent scrolling from mouse wheel. Replace with "wheel to next page" behavior.
	window.addEventListener("wheel", mouseWheelListener, {passive: false});
	
	// Navigate through pages using keyboard.
	window.addEventListener("keydown", function(e){onKeyboardNav(e)});
	
	// User should be allowed to scroll as normal while mousing over content container.
	scrollableDiv = document.getElementsByClassName("scrolling-content-container");

	for (var i = 0; i < scrollableDiv.length; i++) {
		scrollableDiv[i].addEventListener("mouseenter", function(e){onMouseEnterScrollableDiv(this, mouseWheelListener);});
		scrollableDiv[i].addEventListener("mouseleave", function(e){window.addEventListener("wheel", mouseWheelListener, {passive: false})});
	}
}

function onKeyboardNav(event) {
	nextPage = pages[activePageId].index;

	// Determine if user is pressing (Left/Up/Page Up) or (Right/Down/Page Down)
	if (event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 33)
		nextPage--;
	else if (event.keyCode === 39 || event.keyCode === 40 || event.keyCode === 34)
		nextPage++;

	// If user attempts to scroll past all accessible pages, do nothing.
	if (nextPage >= numOfPages || nextPage < 0)
		return;

	// Otherwise, scroll to next page.
	scrollToPage(pageByIndex[nextPage]);
}

function onMouseEnterScrollableDiv(el, listener) {
	// If this div is small enough to fit on the screen without scrolling,
	// then keep snapping to next page as normal when scrolling.
	if (el.scrollHeight == el.offsetHeight)
		return;

	// Otherwise, allow user to scroll through content without snapping to next page.
	window.removeEventListener("wheel", listener);
}

/*============*\
|| NAVIGATION ||
\*============*/
// What to do when user clicked on navigation.
function clickedNav(element) {
	scrollToPage(element.id.replace("nav-", ""));
}

// Scroll to indicated page id.
function scrollToPage(pageId) {
	page = document.getElementById(pageId);
	page.scrollIntoView();
	//switchPage(document.getElementById("nav-" + pageId));
}

function setActivePage() {
	// Get new variables.
	activePage = document.getElementsByClassName("active-tab")[0];
	activePageId = activePage.id.replace("nav-", "");
}

// Reimplemented. Page doesn't always update properly otherwise.
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

function mouseWheelToNextPage(e) {
	// Prevent scrolling from mouse wheel.
	e.preventDefault();

	// Determine if user is scrolling up or down.
	nextPage = e.deltaY > 0 ? pages[activePageId].index + 1 : pages[activePageId].index - 1;

	// If user attempts to scroll past all accessible pages, do nothing.
	if (nextPage >= numOfPages || nextPage < 0)
		return;

	// Otherwise, scroll to next page.
	scrollToPage(pageByIndex[nextPage]);
}