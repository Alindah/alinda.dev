// Small Screen Variables
const compactSize = 960;

// Page Variables
var activePage;
var activePageId;
var numOfPages = 0;
var pages = {};
var pageByIndex = [];

// Scrolling Variables
var lastScrollPos = 0;
var pageDelayMS = 500;
var mouseWheelListener;
var usingDefaultWheelBehavior = false;
var isDoneScrolling = true;

function initialize() {
	populatePages();
	setActivePage();
	scrollToPage("home");		// Some browsers stay in last position when refreshing the site.
	initializeEventListeners();
}

function isCompact() {
	return window.innerWidth <= compactSize;
}

function makeCompactFriendly() {
	if (isCompact())
		enableDefaultWheel();
	else
		disableDefaultWheel();
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
	mouseWheelListener = function(e){mouseWheelToNextPage(e);};

	// Prevent scrolling from mouse wheel. Replace with "wheel to next page" behavior.
	disableDefaultWheel();
	
	// Navigate through pages using keyboard.
	window.addEventListener("keydown", function(e){onKeyboardNav(e)});
	
	// User should be allowed to scroll as normal while mousing over content container.
	scrollableDiv = document.getElementsByClassName("scrolling-content-container");

	for (var i = 0; i < scrollableDiv.length; i++) {
		scrollableDiv[i].addEventListener("mouseenter", function(e){enableDefaultWheel(this);});
		scrollableDiv[i].addEventListener("mouseleave", function(e){disableDefaultWheel()});
	}

	// Recalculate page positions after resizing window.
	window.addEventListener("resize", function(e){makeCompactFriendly(); populatePages();});
}

function onKeyboardNav(event) {
	// Navigation keys that have an affect on the page when pressed.
	// PgUp, PgDown, Left, Up, Right, Down
	validKeys = [33, 34, 37, 38, 39, 40];

	// Prevents strange bug that jumps page to top when pressing some keys.
	if (!(validKeys.includes(event.keyCode)))
		return;

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

function enableDefaultWheel(el = null) {
	// If this div is small enough to fit on the screen without scrolling,
	// then keep snapping to next page as normal when scrolling.
	if (el && el.scrollHeight == el.offsetHeight)
		return;

	// Otherwise, allow user to scroll through content without snapping to next page.
	window.removeEventListener("wheel", mouseWheelListener);
	usingDefaultWheelBehavior = true;
}

function disableDefaultWheel() {
	if (isCompact())
		return;
	
	window.addEventListener("wheel", mouseWheelListener, {passive: false});
	usingDefaultWheelBehavior = false;
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
	
	if (!usingDefaultWheelBehavior)
		switchPage(document.getElementById("nav-" + pageId));

	// Reenable disabling of default wheel behavior after done scrolling.
	setTimeout(function(){isDoneScrolling = true;}, pageDelayMS);
}

function setActivePage() {
	// Get new variables.
	activePage = document.getElementsByClassName("active-tab")[0];
	activePageId = activePage.id.replace("nav-", "");
}

// Reimplemented. Page doesn't always update properly otherwise.
function updateActivePage(element) {
	if (!usingDefaultWheelBehavior)
		return;

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

	if (!isDoneScrolling)
		return;

	// Determine if user is scrolling up or down.
	nextPage = e.deltaY > 0 ? pages[activePageId].index + 1 : pages[activePageId].index - 1;

	// If user attempts to scroll past all accessible pages, do nothing.
	if (nextPage >= numOfPages || nextPage < 0)
		return;

	// Otherwise, scroll to next page.
	isDoneScrolling = false;
	scrollToPage(pageByIndex[nextPage]);
}