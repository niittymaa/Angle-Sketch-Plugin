// ---------------------------------
// SORTED ARTBOARDS IN CONTEXT
// ---------------------------------

function getSortedArtboardsFor(context) {

  let artboards = context.document.artboards();

  // loop through a list of artboards of the page
  var artboardObjects = [];

  for (var i = 0; i < artboards.count(); i++) {
    artboardObjects.push({ name: artboards[i].name(), artboard: artboards[i] });
  }

  artboardObjects.sort((a, b) => a.name > b.name);

  return artboardObjects
}

// ---------------------------------
// DESCRIPTION FOR BEZIER PATH
// ---------------------------------

function descriptionForBezierPoint_(bezierPoint) {
  switch (bezierPoint.elementType) {
    case NSMoveToBezierPathElement: return "MOVE TO: x:" + bezierPoint.point.x + "\t\ty: " + bezierPoint.point.y
    case NSLineToBezierPathElement: return "LINE TO: x:" + bezierPoint.point.x + "\t\ty: " + bezierPoint.point.y
    case NSCurveToBezierPathElement: return "CURVE TO: x:" + bezierPoint.point.x + "\t\ty: " + bezierPoint.point.y
    case NSClosePathBezierPathElement: return "CLOSE PATH"
  }
}

// ---------------------------------
// CREATE LABEL ELEMENT
// ---------------------------------

function createLabel(text, size, frame) {
  var label = NSTextField.alloc().initWithFrame(frame);

  label.setStringValue(text);
  label.setFont(NSFont.boldSystemFontOfSize(size));
  label.setBezeled(false);
  label.setDrawsBackground(false);
  label.setEditable(false);
  label.setSelectable(false);

  return label;
}

// ---------------------------------
// CREATE NEW SELECTION BOX
// ---------------------------------

// Generate a Dropdown
function createSelect(options = {}) {

  if (options.items === null || options.items.count < 1) { return }

  if (options.selected === null || options.selected < 0) {
    options.selected = 0
  }

  var comboBox = NSComboBox.alloc().initWithFrame(options.frame);

  comboBox.addItemsWithObjectValues(options.items);
  comboBox.selectItemAtIndex(options.selected);

  return comboBox;
}

// ---------------------------------
// VALIDATE POINTS IN POLYGON
// ---------------------------------

function pointsAreValid(points) {
  
  let length = points.length

  if (length != 7) { // Not a quadrilater

    if (length > 7) {
      context.document.showMessage("Maybe your shape has too many sides.");
      return false
    }
  
    if (length < 7) {
      context.document.showMessage("Maybe your shape does not have enought sides.");
      return false
    }
  }

  // If the shape is an X crossing shape, fail
  // If two or more points coincide, fail

  // There seems to be something wrong with your shape 😕

  return true
}

// ---------------------------------
// GET RESPONSE FOR OPTIONS
// ---------------------------------

function getSelectionAlertResponseAndSelectionFor(options) {

  //show a native popup box
  var alert = NSAlert.alloc().init();
  var alertContent = NSView.alloc().init();
  var settingY = 0;
  var textOffset = 2;
  var leftColWidth = 120;
  var labelHeight = 16;
  var windowWidth = 310;
  var fieldWidth = 190;

  // Title
  alert.setMessageText("Design+Code Angle");

  // Description
  alert.setInformativeText("Choose an Artboard to mirror into the selected mockup:");

  // Icon

  // Buttons
  alert.addButtonWithTitle("Angle!");
  alert.addButtonWithTitle("Close");

  // First Left Column - Label
  var groupArtboardLabel = createLabel(
    "Artboard",
    12,
    NSMakeRect(0, settingY + textOffset * 2, leftColWidth, labelHeight)
  );

  alertContent.addSubview(groupArtboardLabel);

  // First Right Column - Dropdown
  let groupArtboardSelectRect = NSMakeRect(leftColWidth, settingY, fieldWidth, 28);

  var groupArtboardSelect = createSelect({
    items: options,
    selected: 0,
    frame: groupArtboardSelectRect
  });

  alertContent.addSubview(groupArtboardSelect);

  // Create some offset below the object, here is the dropdown, so that new element can show below it instead of overlapping
  settingY = CGRectGetMaxY(groupArtboardSelect.frame()) + textOffset;

  // Render those label, dropdown etc into the Alert view
  alertContent.frame = NSMakeRect(
    0, 0,
    windowWidth, CGRectGetMaxY(groupArtboardSelect.frame())
  );

  alert.accessoryView = alertContent;

  // Reverse order of the content elements
  alertContent.setFlipped(true);

  // With this will run the modal and return a reference to the selection element
  return { alertOption: alert.runModal(), selectionElement: groupArtboardSelect }
}

// ---------------------------------
// MAIN FUNCTION
// ---------------------------------

const Angle = require('./Angle');

export default function (context) {

  let selectedLayers = context.selection;

  if (selectedLayers == null) { return }

  if (selectedLayers.count() != 1) {

    context.document.showMessage("Please, select only 1️⃣ element at a time");
    return
  }

  let artboards = getSortedArtboardsFor(context);
  var names = artboards.map((a) => a.name);

  // In earlier versions of Sketch, the modal does not layout properly.
  let response = getSelectionAlertResponseAndSelectionFor(names);
  // let response = { alertOption: NSAlertFirstButtonReturn, selectionElement: { indexOfSelectedItem : () => 0 }}

  if (response.alertOption != NSAlertFirstButtonReturn) { print("Close"); return }

  // Get the index of the selected option in dropdown
  var selectionIndex = response.selectionElement.indexOfSelectedItem();

  let angleInstance = Angle.angleFor({
    selectedLayer: selectedLayers.firstObject(),
    artboard: artboards[selectionIndex].artboard,
    context: context,
  });

  if (angleInstance == null) { return }

  angleInstance.addImageFill();

  context.document.showMessage("You got angle! 📱");
}
