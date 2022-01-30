// Small Screen Variables
const compactSize = 960;

// Page Variables
var activePage;
var activePageId;
var numOfPages = 0;
var pages = {};
var pageByIndex = [];
var pageByPosition = {};
var pageContainerEl;

// Scrolling Variables
var lastScrollPos = 0;
var pageDelayMS = 750;
var mouseWheelListener;
var usingDefaultWheelBehavior = false;
var isDoneScrolling = true;

// Collections Variables
var collapsibleObj = {};

// Misc Variables
var clickedOnHeaderObj = false;

// Custom Events
let pageChangeEvent = new CustomEvent("changedPage", {detail: {}});

function initialize() {
	pageContainerEl = document.getElementById("page-container");

	populatePages();
	setActivePage();
	initializeEventListeners();
	getProjectTabs();

	// Some browsers stay in last position when refreshing the site. Scroll to Home if so.
	//if (navigator.userAgent.search("Firefox") > 0 && pageContainerEl.scrollTop != 0)
	//	scrollToPage("home");
}

// Returns true if visitor is using a device that is not compatible with site.
// Ex. If using Mac, user is more likely to use Safari or is using a laptop.
// https://www.learningjquery.com/2017/05/how-to-use-javascript-to-detect-browser
function isJankyDevice() {
	return navigator.platform == "MacIntel" || navigator.userAgent.search("Firefox") > 0;
}

function isCompact() {
	return window.innerWidth <= compactSize;
}

function makeDeviceFriendly() {
	disableDefaultWheel();
	/* Removing jump and using "boring" scroll because it seems most people prefer it. To change back, uncomment this and comment out above
	if (isCompact() || isJankyDevice())
		enableDefaultWheel();
	else
		disableDefaultWheel();
	*/
}

function populatePages() {
	var pageElements = document.getElementsByClassName("page");
	numOfPages = pageElements.length;
	pageByPosition = {};		// Clear every time we resize to save space.

	for (var i = 0; i < numOfPages; i++) {
		// Populate pages array with data.
		pages[pageElements[i].id] = {
			id: pageElements[i].id,
			index: i,
			position: pageElements[i].offsetTop
		};

		// Array so we can look up a page id by referring to its index.
		pageByIndex[i] = pageElements[i].id;

		// Look up pages by its position.
		pageByPosition[pageElements[i].offsetTop] = pageElements[i].id;
	}
}

function initializeEventListeners() {
	mouseWheelListener = function(e){mouseWheelToNextPage(e);};

	// Prevent scrolling from mouse wheel. Replace with "wheel to next page" behavior.
	disableDefaultWheel();
	
	// Navigate through pages using keyboard.
	window.addEventListener("keydown", function(e){onKeyboardNav(e)});
	
	// User should be allowed to scroll as normal while mousing over content container.
	setScrollableElements("scrolling-content-container");
	setScrollableElements("collapsible-body");

	// Recalculate page positions after resizing window.
	window.addEventListener("resize", function(e){makeDeviceFriendly(); populatePages();});

	// Listen for whenever the active page changes.
	window.addEventListener("changedPage", function(e){updateActivePage(pageContainerEl);});
}

function setScrollableElements(className) {
	scrollableDiv = document.getElementsByClassName(className);
	
	for (var i = 0; i < scrollableDiv.length; i++) {
		scrollableDiv[i].addEventListener("mouseenter", function(e){enableDefaultWheel(this);});
		scrollableDiv[i].addEventListener("mouseleave", function(e){disableDefaultWheel()});
	}
}

function getProjectTabs() {
	var tabObj = document.getElementsByClassName("collapsible-tab");
	var bodyObj = document.getElementsByClassName("collapsible-body");

	// Associate each tab with its body by the tab element as the key and its body as its value.
	for (var i = 0; i < tabObj.length; i++)
		collapsibleObj[tabObj[i].id] = bodyObj[i];
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
	/* Removed this feature due to glitchiness.
	// If this div is small enough to fit on the screen without scrolling,
	// then keep snapping to next page as normal when scrolling.
	if (el && el.scrollHeight == el.offsetHeight)
		return;
	*/

	// Otherwise, allow user to scroll through content without snapping to next page.
	window.removeEventListener("wheel", mouseWheelListener);
	usingDefaultWheelBehavior = true;
}

function disableDefaultWheel() {
	if (isCompact() || isJankyDevice())
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
	setTimeout(function(){isDoneScrolling = true; window.dispatchEvent(pageChangeEvent);}, pageDelayMS);
}

function setActivePage() {
	// Get new variables.
	activePage = document.getElementsByClassName("active-tab")[0];
	activePageId = activePage.id.replace("nav-", "");
}

function updateActivePage(el) {
	// How many pixels away from element top before we trigger the tab switch.
	var tolerance = window.screen.height * 0.3;

	// If scrolling by mouse wheel is stalled and active page tab is set without scrolling,
	// go ahead and scroll to appropriate page.
	if (Math.abs(el.scrollTop - pages[activePageId].position) >= tolerance)
		scrollToPage(activePageId);
}

// Deal with some instances where active page tab doesn't update due to manual scrolling.
function updateActivePageEdgeCase() {
	// If current page does not match up with active tab, update the tab to match the page.
	if (isDoneScrolling && pages[activePageId].position != pageContainerEl.scrollTop) {
		if (!(pageContainerEl.scrollTop in pageByPosition))
			return;

		actualPageId = pageByPosition[pageContainerEl.scrollTop];
		switchPage(document.getElementById("nav-" + actualPageId));
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

/*==================*\
|| COLLAPSIBLE TABS ||
\*==================*/
// Collapse all tabs besides selected category.
// Scroll to container if not already in view.
function onClickProjShortcut(el) {
	var projId = el.id.replace("-shortcut", "");

	for (var key in collapsibleObj) {
		if (key == projId)
			expandTab(collapsibleObj[projId], projId);
		else
			collapseTab(collapsibleObj[key], key);
	}

	document.getElementById("content-proj").scrollIntoView();
}

// Expand or collapse a tab depending on its display status.
function expandOrCollapseTab(el) {
	if (collapsibleObj[el.id].classList.contains("collapsed"))
		expandTab(collapsibleObj[el.id], el.id);
	else
		collapseTab(collapsibleObj[el.id], el.id);
}

function collapseTab(el, id) {
	el.classList.remove("expanded");
	el.classList.add("collapsed");
	flipIndicator(id, true);
}

function expandTab(el, id) {
	el.classList.remove("collapsed");
	el.classList.add("expanded");
	flipIndicator(id, false);
}

function flipIndicator(id, isExpanded) {
	var ind = document.getElementById(id).getElementsByClassName("tab-indicator")[0];

	if (isExpanded) {
		ind.classList.remove("indicator-collapse");
		ind.classList.add("indicator-expand");
	}
	else {
		ind.classList.remove("indicator-expand");
		ind.classList.add("indicator-collapse");
	}
}

/*==================*\
|| PROJECT EXPLORER ||
\*==================*/
// Expand or collapse a project tab depending on its display status.
function expandOrCollapseProject(el) {
	// Expand tab but do not  collapse it if user pressed on header icon.
	if (clickedOnHeaderObj) {
		clickedOnHeaderObj = false;
		return;
	}

	el.parentElement.classList.toggle("gc-hidden");
}

function preventTabAction() {
	clickedOnHeaderObj = true;
}

/*===================*\
|| PROJECT SPOTLIGHT ||
\*===================*/
function onClickThumbnail(el) {
	var sector = el.parentElement.parentElement;
	var thumbnail = el.getElementsByClassName("thumbnail-img")[0];
	
	// If image is already focused, do nothing.
	if (thumbnail.classList.contains("img-focused"))
		return;

	// Otherwise, make it focused and make the currently focused image lose focus.
	thumbnailLoseFocus(sector.getElementsByClassName("img-focused")[0]);
	thumbnailGainFocus(thumbnail);

	// Change the spotlight image to match the thumbnail.
	var spotlight_active = sector.getElementsByClassName("spotlight-img-active")[0];
	var spotlight_hidden = sector.getElementsByClassName("spotlight-img-hidden")[0];
	var path = thumbnail.getAttribute("src");
	
	spotlight_hidden.setAttribute("src", path);

	flipSpotlightVisibility(spotlight_hidden);
	flipSpotlightVisibility(spotlight_active);
	
}

function thumbnailGainFocus(el) {
	el.classList.remove("img-unfocused")
	el.classList.add("img-focused")
}

function thumbnailLoseFocus(el) {
	el.classList.add("img-unfocused")
	el.classList.remove("img-focused")
}

function flipSpotlightVisibility(el) {
	el.classList.toggle("spotlight-img-hidden");
	el.classList.toggle("spotlight-img-active");
}

/*=======*\
|| AUDIO ||
\*=======*/
// Hide anything that is showing and display anything that was hidden.
function flipAudioStatus(el) {
	var hidden = el.getElementsByClassName("hidden")[0];
	var showing = el.getElementsByClassName("showing")[0];

	hidden.classList.remove("hidden");
	hidden.classList.add("showing");
	showing.classList.remove("showing");
	showing.classList.add("hidden");
}

// Play audio and display the pause button.
// Stop playing any audio that is currently playing.
function playAudio(id) {
	var allPlayers = document.getElementsByClassName("grid-audio-player");
	var proj = document.getElementById(id.replace("audio", "proj-music"));
	var audio = document.getElementById(id);

	// Stop playing other audio if any.
	for (var i = 0; i < allPlayers.length; i++) {
		if (allPlayers[i] == id)
			continue;

		if (!allPlayers[i].paused)
			stopAudio(allPlayers[i].id);
	}

	// Reload so it starts from beginning upon pressing on play again.	
	audio.load();
	audio.play();

	flipAudioStatus(proj);
}

// Stop audio and display the play button.
function stopAudio(id) {
	var proj = document.getElementById(id.replace("audio", "proj-music"));
	document.getElementById(id).pause();
	flipAudioStatus(proj);
}

// Displays and updates audio track time.
// https://stackoverflow.com/questions/4993097/html5-display-audio-currenttime
function updateAudioTimeTracker(audioEl, id) {
	var proj = document.getElementById(id);
	proj.getElementsByClassName('audio-time-tracker')[0].innerHTML = Math.floor(audioEl.currentTime) + ' / ' + Math.floor(audioEl.duration);
}
