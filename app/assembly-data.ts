export type AssemblyStep = {
  number: number;
  title: string;
  stage: number;
  intro: string;
  items: string[];
  check: string;
  note?: string;
  part?: string;
};
export const ASSEMBLY_SOURCE = 'https://orca.ethz.ch/assembly/';
export const stepSource = (number: number) => `${ASSEMBLY_SOURCE}Orca%20Hand_step${String(number).padStart(2, '0')}.html`;
export const STAGES = ['Getting ready', 'Build the fingers', 'Assemble the palm', 'Build the wrist', 'Motors & tendons', 'Finish the housing'];
// Plain-language adaptations of the corresponding numbered official guide pages.
// Preserve source numbering: standalone pages 04, 27, and 28 are not published in the index.
export const ASSEMBLY_STEPS: AssemblyStep[] = [
  {
    number: 0, title: 'Prepare the tendons & knots', stage: 0,
    intro: 'Start with clean tendon ends and secure knots. These small details make the rest of the build much easier.',
    items: ['Practise an Ashley Stopper knot using the linked official guide before routing any tendons.', 'Pull each knot tight from both sides; use pliers to help seat it. Leave about 5 mm of tail beyond the knot.', 'Cut the tensioned tendon with a sharp blade in one clean cut. Scissors, dull blades, and sawing can fray the end.', 'Keep tweezers nearby for the small routing holes. Recut a frayed end if it will not pass through.'],
    check: 'Your knots are seated firmly and your tendon ends pass cleanly through a routing hole.',
    note: 'The assembly video shows an older revision. Follow the current written guide and its diagrams when they differ.',
  },
  {
    number: 1, title: 'Route the fingertip tendons', stage: 1, part: 'index_ip',
    intro: 'Prepare the outer finger segments first. The same routing procedure is used for all five digits.',
    items: ['Prepare a 0.5 m tendon with an Ashley Stopper knot.', 'Feed it through the side opening of the fingertip/IP assembly, then follow the complete diagram sequence for its internal path.', 'Repeat the routing for the other fingers and the thumb.'],
    check: 'Each fingertip has the routed tendon shown in its diagrams.',
    note: 'This step refers to Step 04 for skin casting. That standalone page is missing from the published index; obtain the skin-casting instructions from the ORCA project before making the skin.',
  },
  {
    number: 2, title: 'Prepare the proximal segments', stage: 1, part: 'index_pp',
    intro: 'PP means proximal phalanx: the finger segment closest to the palm after the base joint.',
    items: ['Insert the pins into each PP part, keeping them straight. Use the guide’s gentle tapping method if needed.', 'Pass the tendon through the side opening and follow the fingertip routing procedure from Step 01.', 'Repeat for every finger, including the thumb.'],
    check: 'The pins sit straight and the tendon path remains open.',
    note: 'A tilted pin can obstruct the tendon or damage the printed part. Correct its alignment before continuing.',
  },
  {
    number: 3, title: 'Route the finger base joints', stage: 1, part: 'index_mp',
    intro: 'The abduction joint lets a finger move sideways. Prepare these base pieces for the four non-thumb fingers.',
    items: ['Take two 50 cm tendons without knots and pass them through the side of an abduction piece.', 'Follow the diagrams through the routing holes, then tie an Ashley Stopper knot at each end.', 'Pull the tendons back until both knots seat in the piece. Repeat for the other three fingers.'],
    check: 'Both knots are seated in each of the four base pieces.',
    note: 'The thumb uses a different abduction piece and is handled in Step 06.',
  },
  {
    number: 5, title: 'Connect the finger segments', stage: 1, part: 'index_pp',
    intro: 'Join each fingertip to its proximal segment, then add the base joint to the four fingers.',
    items: ['Identify the diagram’s tendon pairs: PP extension is green and flexion is pink; fingertip extension is blue and flexion is orange.', 'Pass the fingertip flexor through the lower PP hole and its extensor through the upper hole. Starting with the flexor can be easier.', 'Pull the tendons through and snap the fingertip onto the PP. This portion also applies to the thumb.', 'Route the finger tendons through the abduction piece using the diagrams, then seat the base connection. Do this for the four fingers, not the thumb.', 'Pull each tendon individually and confirm that the intended joint moves in the intended direction.'],
    check: 'Each tendon produces the expected bend, extension, or sideways motion.',
    note: 'The guide notes that fingertip tendon positions may appear reversed in some views. Identify their function before routing them.',
  },
  {
    number: 6, title: 'Prepare the thumb base', stage: 1, part: 'thumb_mp',
    intro: 'The thumb has its own base geometry. Use its dedicated routing diagrams.',
    items: ['Thread two unknotted 50 cm tendons through the side of the thumb abduction part.', 'Tie an Ashley Stopper knot on each tendon after routing it.', 'Pull both tendons back to seat the knots. Keep track of the diagram’s tendon colours for the next step.'],
    check: 'The two knots are seated and the thumb’s tendon routes match the diagrams.',
  },
  {
    number: 7, title: 'Put the thumb together', stage: 1, part: 'thumb_pp',
    intro: 'Join the prepared thumb base to its proximal and fingertip assembly.',
    items: ['Pass two 50 cm tendons through the illustrated holes, knot them, and pull the knots into their seats.', 'Bring together the thumb abduction part from Step 06 and the PP/fingertip assembly.', 'Check each tendon’s effect on joint motion as you did for the fingers.', 'Route the tendons through the large opening and snap the remaining connection into place.'],
    check: 'The thumb is assembled and each tendon moves the intended joint.',
  },
  {
    number: 8, title: 'Fit the palm skin', stage: 2, part: 'palm_skin',
    intro: 'Carpal is the guide’s name for the central palm body.',
    items: ['Identify the prepared carpal and its matching skin using the two official images.', 'Fit the skin to the carpal in the illustrated orientation.'],
    check: 'Your palm and skin arrangement matches both reference views.',
    note: 'The source provides images only for this step. Use those views for fit and orientation; no adhesive or additional fastener is specified here.',
  },
  {
    number: 9, title: 'Line the palm’s routing holes', stage: 2, part: 'palm',
    intro: 'PTFE, also called Teflon, tubing lines the tendon passages through the palm.',
    items: ['Insert PTFE tubing into every carpal routing hole shown in the guide.', 'Trim the tubing as close to flush as possible on the upper surface, then trim the underside flush.', 'If a tube is squeezed shut during trimming, reopen it with a thin round tool.'],
    check: 'Every lined passage stays open for its tendon.',
  },
  {
    number: 10, title: 'Attach the four fingers', stage: 2, part: 'palm',
    intro: 'Use the index-finger example for each non-thumb finger.',
    items: ['Start with the skinned, tube-lined palm and a completed finger.', 'Follow the colour-coded diagrams to feed the finger’s tendons into the correct palm holes without crossing them.', 'Pull the tendons through the other side and snap the finger assembly onto the palm.', 'Repeat the illustrated method for the remaining three fingers.'],
    check: 'Four fingers are attached and their tendon routes follow the diagram.',
    note: 'Internal routing means the exit holes may not line up intuitively with the entry holes. Follow the diagram rather than guessing.',
  },
  {
    number: 11, title: 'Attach the thumb to the palm', stage: 2, part: 'thumb_mp',
    intro: 'The thumb connection is similar to the fingers, but its tendon route is different.',
    items: ['Position the thumb at its carpal connection using the dedicated reference views.', 'Follow the thumb-specific routing images before seating the connection.'],
    check: 'The assembled thumb and its tendon paths match the source views.',
    note: 'Take extra care with this routing; the four-finger route is not a substitute for the thumb diagrams.',
  },
  {
    number: 12, title: 'Add the wrist gear & rods', stage: 2, part: 'palm',
    intro: 'The two rods keep the tendon bundle in the intended passage below the palm.',
    items: ['Attach the wrist gear to the carpal as illustrated.', 'Move the tendons to one side and insert the first rod through its side opening.', 'Move the tendons to the opposite side and insert the second rod.', 'Arrange all tendons between the two rods.'],
    check: 'The complete tendon bundle runs between the rods, not outside them.',
  },
  {
    number: 13, title: 'Line the upper tower', stage: 3, part: 'tower_main',
    intro: 'Prepare the tendon passages that connect the wrist to the motor tower.',
    items: ['Insert PTFE tubing into the illustrated upper-tower holes.', 'Trim the tubing flush on the top surface, reopening any compressed tube ends.', 'Leave approximately 3 mm of tubing below the tower. The lower tower can be temporarily fitted as a trimming reference.'],
    check: 'The top is flush, the bottom retains about 3 mm, and every passage is open.',
  },
  {
    number: 14, title: 'Install the wrist belt adjusters', stage: 3, part: 'tower_main',
    intro: 'Prepare the screws and bearing that locate and tension the wrist belt.',
    items: ['Fit two M4×16 screws with washers on the tower side, using M4 square nuts and the matching printed inside parts.', 'Seat the square nuts in the tower groove so they cannot spin.', 'Fit the 4×8×3 bearing into the indicated opening.', 'Position the wrist belt between the two adjuster screws as shown.'],
    check: 'The nuts cannot rotate and the belt follows the illustrated path.',
    note: 'The guide also allows PTFE tube marked 3×3.76 mm instead of the printed cylinders around the internal screw threads.',
  },
  {
    number: 15, title: 'Prepare the wrist motor', stage: 3, part: 'tower_main',
    intro: 'Assemble the wrist servo before putting it into the tower.',
    items: ['Use the M2×6 screws supplied with the XC430 wrist servo to assemble it as shown.', 'Plug in its cables at this stage, while the connectors are accessible.'],
    check: 'The wrist servo matches the reference image and its cables are connected.',
  },
  {
    number: 16, title: 'Place the wrist motor', stage: 3, part: 'tower_main',
    intro: 'Locate the prepared servo in the upper tower.',
    items: ['Compare both official views to identify the servo orientation.', 'Place the wrist servo in the illustrated position.'],
    check: 'The motor’s position and orientation match both reference images.',
    note: 'This step is illustrated without written fastening details. Follow the original images; do not infer an extra screw specification.',
  },
  {
    number: 17, title: 'Join the palm & upper tower', stage: 3, part: 'palm',
    intro: 'Route the tendon bundle before lowering the palm onto the tower.',
    items: ['Sort the two rows of carpal tendons using the first diagram’s colours.', 'Cross the row groups exactly as shown in the second image, then route each tendon into its corresponding tower hole.', 'Keep the individual passages through the tower free of additional crossings.', 'Pull the tendons through, lower the carpal onto the tower, and wrap the wrist belt around the carpal gear.'],
    check: 'The intentional row crossing matches the guide and the belt is on the carpal gear.',
    note: 'It can be easier to lift the belt off the wrist servo, fit it around the carpal gear, and then refit it to the servo.',
  },
  {
    number: 18, title: 'Secure the wrist bearings', stage: 3, part: 'palm',
    intro: 'Secure the palm to the upper tower after fitting the belt.',
    items: ['Confirm that the belt is already around the carpal gear.', 'Install the wrist bearings to secure the carpal to the upper tower.', 'Attach the bearing covers with 1.7×8 mm screws.'],
    check: 'The belt is in place and both bearing covers are secured.',
    note: 'The source illustration omits tendons for clarity; they remain routed in your assembly.',
  },
  {
    number: 19, title: 'Tension the wrist belt', stage: 3, part: 'tower_main',
    intro: 'Set the wrist belt tension while the adjusters are still easy to reach.',
    items: ['Position the upper adjuster screw at the top of its groove.', 'Push the lower screw toward the upper screw to tension the belt; supporting it from inside can help.', 'Securely tighten the adjusters while holding the tension.'],
    check: 'The adjustment stays fixed after tightening.',
    note: 'The source calls for substantial tension but gives no numerical tension or torque. Follow its illustrated adjustment; access becomes harder later.',
  },
  {
    number: 20, title: 'Identify & configure the motors', stage: 4, part: 'tower_u2d2',
    intro: 'Give every motor a unique identity before connecting them as a group.',
    items: ['Follow the linked ROBOTIS quick-start instructions and install DYNAMIXEL Wizard 2.0.', 'Connect one servo at a time to the power hub and find it in the Wizard; adjust the search options if necessary.', 'Assign IDs 1–16 to the XC330-T288-T finger servos and ID 17 to the XC430-T240BB-T wrist servo, as recommended by the guide.', 'Set the communication rate to 3 Mbps and physically label each motor with its ID.'],
    check: 'Every motor has a unique, recorded ID and the same configured baud rate.',
    note: 'Do this before installing and daisy-chaining the servos. Use the linked ROBOTIS documentation for the power and connection procedure.',
  },
  {
    number: 21, title: 'Fit the lower spools', stage: 4, part: 'tower_main',
    intro: 'Attach the lower half of each spool to its servo.',
    items: ['Insert an M2 nut from the underside of the lower spool, following the diagram.', 'Check that the nut sits straight in its pocket.', 'Fasten the lower spool to its servo with an M2×4 screw. Repeat for the remaining spools.'],
    check: 'Each lower spool is fastened and its nut is seated without tilt.',
  },
  {
    number: 22, title: 'Mount the circuit boards', stage: 4, part: 'tower_u2d2',
    intro: 'Install the custom boards in the lower tower.',
    items: ['Identify the custom PCBs and the locations shown in the official diagram.', 'Attach the boards to the lower tower in those positions.'],
    check: 'The boards match the placement in the reference image.',
    note: 'This source step does not specify connector pinouts or fastening dimensions. Consult the original electronics resources for those details.',
  },
  {
    number: 23, title: 'Install & connect the servos', stage: 4, part: 'tower_main',
    intro: 'Motor placement matters: the published ID layout reduces later configuration changes.',
    items: ['Confirm that every servo has already been identified and labelled in Step 20.', 'Use the tower notches and the first two diagrams to match motor IDs to their positions. Install the middle servos first; keep only the lower spools attached.', 'Fit the remaining servos and tuck their supplied cables inside the tower.', 'Follow the guide’s connections: 12–5, 8–1, 4–13, and 16–wrist. Connect the lead from ID 9 to the U2D2.', 'Scan with DYNAMIXEL Wizard and confirm that all servos are detected.'],
    check: 'All motor IDs appear in the Wizard after the illustrated wiring is complete.',
    note: 'Some images show upper spools already fitted; the text says to leave them off here. The older video also differs in motor placement.',
  },
  {
    number: 24, title: 'Fit the rod stops', stage: 4, part: 'tower_main',
    intro: 'Add the rod-stopper hardware to the tower.',
    items: ['Identify the M6 hex nuts and their printed covers in the two diagrams.', 'Fit the nuts and covers to the illustrated tower locations.'],
    check: 'The rod stops match the source views.',
  },
  {
    number: 25, title: 'Join the two tower sections', stage: 4, part: 'tower_main',
    intro: 'Connect the wrist motor and route the tendons before bringing the tower halves together.',
    items: ['Connect the wrist servo to the prepared cable first.', 'Pass the tendons through their matching lower-tower openings on both sides.', 'Bring the tower sections together, guiding the extra PTFE tube ends from Step 13 into the lower-tower holes.', 'Secure the joint with four M4×14 screws, M4 hex nuts, and the washers shown in the diagram.'],
    check: 'The wrist cable is connected, tubing aligns with its holes, and the tower joint is fastened.',
    note: 'The guide’s images omit the servos to make routing easier to see.',
  },
  {
    number: 26, title: 'Wind & secure the tendons', stage: 4, part: 'tower_main',
    intro: 'Use the routing diagrams to pair each tendon with its spool. Work through one connection at a time.',
    items: ['Match the lower-row tendons to the lower spools using the arrows. Leave roughly 20 cm from spool to tendon end, tie an Ashley Stopper knot, and seat it in the cutout.', 'Slowly turn the servos counter-clockwise to wind the excess tendon.', 'Route the upper-row tendons into the still-unattached upper spools. Again leave roughly 20 cm to the knot and seat it.', 'Wind the upper spool clockwise, then attach it with an M2×10 screw and M2 washer, with the ratchet mechanism between the spool halves.', 'Check both sides against the last diagrams: no tendons should touch or rub against one another.'],
    check: 'The knots are seated, ratchets are in place, and adjacent tendon routes do not rub.',
    note: 'Rotate slowly to avoid damaging the servos. Do not attach the upper spools before routing them.',
  },
  {
    number: 29, title: 'Add the housing magnets', stage: 5, part: 'tower_hull',
    intro: 'The cover magnets must attract the corresponding magnets in the tower.',
    items: ['Fit the tower magnets in the illustrated recesses, using consistent polarity.', 'Fit the housing magnets with the opposite mating polarity.', 'Check that each matching pair attracts before completing placement.'],
    check: 'The housing is attracted to the tower at every magnet pair.',
    note: 'The published index jumps from Step 26 to Step 29. Standalone instructions for Steps 27 and 28 are not available there.',
  },
  {
    number: 30, title: 'Add the Orca lettering', stage: 5, part: 'tower_text',
    intro: 'Finish the outside of the housing.',
    items: ['Position the Orca lettering on the housing using the reference views.', 'Glue the lettering in the illustrated positions.'],
    check: 'The lettering matches the reference layout.',
  },
  {
    number: 31, title: 'Review the assembled hand', stage: 5, part: 'tower_hull',
    intro: 'The official guide ends with an image of the completed mechanical assembly.',
    items: ['Compare your assembled hand with the final official image.', 'Review this checklist for unfinished steps and resolve the missing source instructions before treating the build as ready for operation.'],
    check: 'The available mechanical assembly steps have been reviewed. Checklist completion is a record of your work, not a hardware test.',
    note: 'This final source page does not provide a commissioning or calibration procedure. Use the ORCA project’s control documentation for setup and operation.',
  },
];
