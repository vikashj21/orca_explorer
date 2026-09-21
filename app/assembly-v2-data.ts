import type { AssemblyStep } from './assembly-data';
import type { AssemblyPanel } from './assembly-panels';

export const V2_VIDEO_URL = 'https://www.youtube.com/watch?v=TgIz7HiyaoU';
export const v2VideoAt = (seconds: number) => `${V2_VIDEO_URL}&t=${Math.max(0, Math.floor(seconds))}s`;
export const V2_SOURCE_TITLE = 'orcahand v2 · 1000-DX-R full assembly video';
export const V2_STAGES = ['Build the fingers', 'Build the thumb', 'Assemble the palm', 'Housing & wrist', 'Motors & electronics', 'Spool the tendons', 'Finish & calibrate'];
export const timestamp = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
type Group = { frames: [number, string][]; items: string[] };
type Chapter = { title: string; stage: number; start: number; end: number; intro: string; groups: Group[]; check: string; note?: string };
// Authored from the supplied recording's visible demonstrations and captions.
// Times are positions in videoplayback.mp4, not estimated construction durations.
// Each group deliberately associates its own instructions with reviewed frames.
export const V2_CHAPTERS: Chapter[] = [
  {
    title: 'Prepare the finger tendons', stage: 0, start: 0, end: 150,
    intro: 'Start with the index finger. Prepare the long tendon and its two central stopper knots before threading the printed parts.',
    groups: [
      { frames: [[5, 'The recording demonstrates the right-hand orcahand v2, 1000-DX-R.'], [55, 'Lay out the finger parts; the index finger is the worked example.']], items: ['Sort the printed finger segments, matching skins, bearings, and pins. Keep the thumb parts separate.'] },
      { frames: [[65, 'Measure a 1.5 m length of tendon.'], [85, 'Two Ashley Stopper knots sit near the middle, 10 mm apart (±5 mm in the video).'], [135, 'Form the second stopper knot.'], [145, 'Pull the tendon to tighten the knots.']], items: ['Measure and cut a 1.5 m tendon.', 'Tie two Ashley Stopper knots near its midpoint, approximately 10 mm apart (the video allows ±5 mm). Tighten both knots.'] },
    ], check: 'The tendon has two secure central knots, with a long working end on either side.',
  },
  {
    title: 'Thread the fingertip & fit its bearings', stage: 0, start: 150, end: 240,
    intro: 'The distal phalange (DP) is the fingertip segment. Seat the tendon knots inside it and add its bearings.',
    groups: [
      { frames: [[155, 'Thread from the middle of the index DP toward the outside.'], [185, 'Work the tendon through the printed passage.'], [215, 'Seat the routed tendon in the fingertip.']], items: ['Feed one tendon end from the middle of the DP outward through its passage. Route the other end through the opposite passage.', 'Pull the ends until the knots seat inside the part. Keep the tendon in the illustrated channels.'] },
      { frames: [[235, 'Press the bearings onto the DP bearing shafts.']], items: ['Press the bearings fully onto the fingertip bearing shafts.'] },
    ], check: 'Both tendon ends exit the fingertip correctly and the bearings are fully seated.',
  },
  {
    title: 'Prepare the proximal segment & skin', stage: 0, start: 240, end: 350,
    intro: 'Prepare the proximal phalange (PP), then fit the pins and matching finger skins.',
    groups: [
      { frames: [[245, 'The PP uses another 1.5 m tendon with two central stopper knots.'], [265, 'Thread the tendon through the PP.']], items: ['Prepare another 1.5 m tendon with two Ashley Stopper knots 10 mm apart. Thread it into the PP as demonstrated for the DP and seat the knots.'] },
      { frames: [[291, 'The PP receives TWO 2×6 mm pins.'], [315, 'Press in the 2×8 mm pin.'], [335, 'Choose the matching skins for the finger segments.']], items: ['Press the two 2×6 mm pins and the 2×8 mm pin into their illustrated positions.', 'Identify the matching skins—the video shows three finger skin types—and fit the skins to the prepared segments.'] },
    ], check: 'The PP tendon is seated, the pins are fitted, and the skins match the segments.',
  },
  {
    title: 'Join the fingertip to the PP', stage: 0, start: 350, end: 460,
    intro: 'Route by the motion each tendon produces, then click the fingertip bearings into the proximal hinge.',
    groups: [
      { frames: [[355, 'The tendon lifting the DP goes through the upper hole.'], [375, 'The tendon pulling the DP down goes through the lower hole.'], [385, 'Turning the tendon can help find the exit.']], items: ['Identify the DP extensor by pulling it; thread this tendon through the upper PP hole.', 'Thread the DP flexor through the lower hole. If access is difficult, fit the second 2×6 mm pin after threading, as suggested in the video.'] },
      { frames: [[405, 'Press the bearings into the hinge until the joint clicks.'], [455, 'At this exit, the inner tendon bends the DP down and the outer tendon lifts it.']], items: ['Draw the tendons through and press the fingertip bearings into the PP hinge.', 'Pull each tendon to check smooth bending and extension. Confirm the inner/outer tendon functions against the reference view.'] },
    ], check: 'The fingertip pivots smoothly and each tendon produces the expected direction of motion.',
  },
  {
    title: 'Add the finger’s abduction tendons', stage: 0, start: 640, end: 760,
    intro: 'Two shorter tendons operate the sideways joint at the base of the finger.',
    groups: [
      { frames: [[645, 'Cut two 75 cm tendons for the AP.'], [665, 'Feed a tendon into the side of the AP and pull 20 cm through before tying its knot.']], items: ['Cut two 75 cm tendons. Feed one into the side passage of the AP, pull 20 cm through, and tie an Ashley Stopper knot.', 'Repeat for the opposing side and draw both knots back into their seats.'] },
    ], check: 'Both abduction tendons are routed through the opposing side passages, with their stopper knots seated securely.',
  },
  {
    title: 'Route the finger through its base', stage: 0, start: 460, end: 640,
    intro: 'The abduction phalange (AP) is the finger base. Its wide hole pair carries the PP tendons; the remaining passages carry the fingertip tendons.',
    groups: [
      { frames: [[475, 'PP extension enters the upper hole of the wide pair in the AP.'], [495, 'PP flexion enters the lower hole of the wide pair.']], items: ['Route the tendon that lifts the PP into the upper hole of the wide AP hole pair. Route the tendon that bends it down into the lower hole.'] },
      { frames: [[525, 'Use the centre-line overlay to match the inner tendon to the inner AP passage.'], [545, 'Inspect the routed base before seating the joint.']], items: ['Keep the fingertip tendon closer to the PP centre line in the AP passage closer to its centre line. Route the farther tendon through the farther passage.'] },
      { frames: [[595, 'Click the PP joint into the AP.'], [615, 'Fit the base pins in the illustrated positions.']], items: ['Pull the tendons through and click the PP into the AP without trapping a tendon.', 'Fit the 2×8 mm base pins and bearings as shown.'] },
      { frames: [[760, 'The index finger is complete; repeat the same assembly for the middle fingers and pinky.']], items: ['Repeat the finger assembly for both middle fingers and the pinky, using the matching parts for each finger.'] },
    ], check: 'The joint is seated and the inner/outer routes match the centre-line diagram. All six tendon ends are identifiable and the finger joints move as intended.',
  },
  {
    title: 'Assemble the thumb tip & PP', stage: 1, start: 760, end: 1000,
    intro: 'The thumb has four segments and four degrees of freedom. Start with its dedicated distal and proximal pieces.',
    groups: [
      { frames: [[765, 'Lay out the four dedicated thumb parts.'], [768, 'Assemble the thumb’s first three parts (DP, PP and AP) analogously to the index finger.'], [795, 'Thread the thumb fingertip tendon. This step is similar to step 2.'], [825, 'Prepare the thumb proximal segment. This step is similar to step 3.']], items: ['Use the thumb-specific DP and PP. Prepare their 1.5 m tendons with two central Ashley Stopper knots, following the finger method.', 'Thread the tendons, seat the bearings, and fit the corresponding thumb skins.'] },
      { frames: [[845, 'Fit the pins shown for the thumb PP.'], [885, 'Join the thumb DP and PP. This step is similar to step 4.'], [985, 'The video reminds you to add the thumb PP skin before routing into the AP.']], items: ['Fit the illustrated 2×6 mm and 2×8 mm pins, route the DP tendons through the PP, and seat the joint.', 'Fit the thumb PP skin before the next connection. Check smooth DP and PP movement.'] },
    ], check: 'The thumb tip and PP are joined and skinned, with four working tendon ends.',
  },
  {
    title: 'Route & assemble the thumb AP', stage: 1, start: 1000, end: 1200,
    intro: 'Use the thumb-specific centre-line views to route the four existing tendons before adding the AP tendon pair.',
    groups: [
      { frames: [[1005, 'The violet reference tendon lifts the thumb DP.'], [1015, 'PP extension enters the upper AP hole.'], [1025, 'PP flexion enters the lower AP hole.'], [1045, 'The inner, orange reference tendon uses the inner passage.']], items: ['Identify the thumb tendons by their joint motion. Pass PP extension through the upper AP hole and PP flexion through the lower hole.', 'Route the inner DP tendon through the inner passage and the outer DP tendon through the outer passage, following the thumb diagram.'] },
      { frames: [[1065, 'Inspect the four routed tendons before seating the joint.'], [1095, 'Fit the illustrated 2×10 mm pins.'], [1135, 'Measure 20 cm from the exit before tying the stopper knot.']], items: ['Seat the thumb AP joint and fit the illustrated 2×10 mm pins and bearings.', 'Prepare two 75 cm AP tendons. Feed each through its side passage, measure 20 cm from the exit, tie an Ashley Stopper knot, and seat it.'] },
    ], check: 'The thumb AP is assembled, with six tendons ready to pass into the final thumb base.',
  },
  {
    title: 'Prepare the final thumb base', stage: 1, start: 1200, end: 1310,
    intro: 'The video calls the final thumb base the TP. Add its own tendon pair and open the six through-passages.',
    groups: [
      { frames: [[1215, 'Insert two 75 cm tendons into the opposing TP holes, pulling 20 cm through for each knot.'], [1235, 'Tie the base tendon stopper knot.']], items: ['Feed two 75 cm tendons into the opposing TP holes. Pull 20 cm through each, tie an Ashley Stopper knot, and draw the knot back into its seat.'] },
      { frames: [[1265, 'The six through-holes need to be opened before routing.'], [1285, 'The demonstrator uses a small screw to widen each passage.'], [1305, 'Inspect all six prepared passages.']], items: ['Use a small screw as demonstrated to open the six TP tendon passages. Remove the screw and check that each passage is clear.'] },
    ], check: 'The two TP knots are seated and all six through-passages are open.',
  },
  {
    title: 'Join the thumb base & finish the fingers', stage: 1, start: 1310, end: 1480,
    intro: 'Route the six thumb tendons into the TP without crossing them. Then repeat the index-finger method for the other three fingers.',
    groups: [
      { frames: [[1315, 'The two outer AP abduction tendons pass through the outer TP holes.'], [1335, 'The four tendons between the AP pins pass through the four centre holes.'], [1425, 'The six paths stay parallel between the AP and TP.'], [1445, 'Seat the final thumb joint.']], items: ['Pass the outer AP tendon pair through the outer TP holes. Pass the four remaining tendons through the four centre holes in the illustrated order.', 'Keep the six paths uncrossed, pull them through, and seat the thumb base joint.'] },
      { frames: [[1465, 'Repeat the index method for the pinky, ring, and middle fingers.'], [1475, 'The completed fingers are ready for the palm.']], items: ['Repeat steps 01–06 for the pinky, ring, and middle fingers, using their matching parts and skins. Verify each tendon’s action before moving on.'] },
    ], check: 'Four fingers and the four-segment thumb are ready to attach to the palm.',
  },
  {
    title: 'Open the palm passages & route the index', stage: 2, start: 1480, end: 1650,
    intro: 'Prepare the carpal (palm body), then use the numbered overlay to thread the index finger’s six tendons.',
    groups: [
      { frames: [[1495, 'Open the tendon exits in the carpal with a small screw.'], [1515, 'The numbered routing overlay distinguishes the dorsum and palm sides.']], items: ['Open the carpal tendon exits with a small screw, as shown. Check that the passages are clear.', 'Orient the palm and index finger to match the numbered reference: dorsum above, palm below.'] },
      { frames: [[1525, 'Start the index routing with the first tendon.'], [1555, 'Feed the second tendon through its corresponding passage.'], [1575, 'Continue with numbered passage 3.'], [1605, 'Continue with numbered passage 4.'], [1635, 'Finish the routing through passages 5 and 6.']], items: ['Route the six index tendons one at a time through the corresponding numbered holes, 1 through 6. Use the overlay to identify each tendon and retrieve its free end from the palm.', 'Keep the six strands separated and in the illustrated order before seating the finger.'] },
    ], check: 'All six index tendons follow the numbered palm routes.',
  },
  {
    title: 'Seat all four fingers in the palm', stage: 2, start: 1650, end: 1760,
    intro: 'Check the base orientation before snapping each finger into place.',
    groups: [
      { frames: [[1655, 'The inset compares correct and incorrect base alignment.'], [1685, 'Pull the tendons through while seating the finger base.']], items: ['Match the finger base orientation to the correct view in the inset. Draw the tendons through the palm and seat the joint.'] },
      { frames: [[1715, 'Repeat the routing and seating for all four fingers.'], [1745, 'Inspect the four attached fingers.']], items: ['Repeat the numbered routing and seating process for the middle, ring, and pinky fingers.', 'Pull each tendon separately to check that the intended finger and joint move.'] },
    ], check: 'All four finger bases are seated and the tendon bundles remain identifiable.',
  },
  {
    title: 'Attach the thumb & palm skin', stage: 2, start: 1760, end: 1920,
    intro: 'Route the thumb bundle through its own palm connection, then fit the central palm skin.',
    groups: [
      { frames: [[1765, 'Use the thumb-specific carpal route shown in the inset.'], [1785, 'Thread the thumb tendons before seating its base.'], [1825, 'Check the seated thumb and retrieve the tendon ends.']], items: ['Feed the thumb tendons through the dedicated carpal passages in the illustrated orientation.', 'Draw the tendons through and seat the thumb base. Check the thumb joints by pulling their tendon pairs.'] },
      { frames: [[1885, 'Inspect the completed upper-hand assembly.'], [1905, 'Press the carpal skin into the palm body.']], items: ['Arrange the tendon bundle below the palm, then press the carpal skin fully into place.'] },
    ], check: 'All five digits are attached, their joints move, and the palm skin is seated.',
  },
  {
    title: 'Fit the housing magnets', stage: 3, start: 1920, end: 2230,
    intro: 'Prepare the magnetic housing connections before assembling the wrist and motor tower.',
    groups: [
      { frames: [[1925, 'Source correction: first attach four magnets to the bottom tower, keeping the same orientation.'], [1935, 'Mark the magnet orientation before fitting the mating parts.'], [1965, 'The video permits glue inside the magnet holes before insertion.']], items: ['First fit four magnets to the bottom tower. This is explicitly called out as a missed step in the video.', 'Mark and preserve the magnet orientation. Check that mating magnets attract before securing them in their recesses.'] },
      { frames: [[1995, 'Apply adhesive at the illustrated magnet seats.'], [2035, 'Position the mating housing pieces.'], [2095, 'Fit the magnets for the curved cover.'], [2155, 'Continue around the remaining housing sections.'], [2205, 'Finish the lower housing magnet positions.']], items: ['Fit and secure the magnets in the upper housing and removable covers using the shown positions.', 'When transferring magnet positions with the pieces together, keep adhesive from bonding the mating PLA surfaces. Let the adhesive set and check that the covers detach and refit.'] },
    ], check: 'The housing pieces locate correctly, their magnets attract, and the covers remain removable.',
    note: 'The four bottom-tower magnets are a written correction at 32:05. Include them even though their installation is not demonstrated there.',
  },
  {
    title: 'Prepare the wrist housing', stage: 3, start: 2230, end: 2460,
    intro: 'Fit the wrist’s internal adjustment hardware and the tubing over its cross-pieces in the demonstrated orientation.',
    groups: [
      { frames: [[2235, 'Gather the upper housing, wrist motor, belt, bearings, and fasteners.'], [2295, 'Prepare the screw and nut hardware.'], [2325, 'Place the internal hardware in the housing.'], [2355, 'Secure it from the outside.']], items: ['Lay out the wrist parts and use the matching v2 fasteners shown with this assembly.', 'Fit the screw, washer, nut, and internal guide arrangement shown on each side of the wrist housing.'] },
      { frames: [[2415, 'Trim the tubing fitted over the internal cross-piece.'], [2445, 'Finish the second tube and check the internal spacing.'], [2455, 'The prepared wrist housing is ready for the tendon bundle.']], items: ['Fit and trim the tubing on the internal cross-pieces as shown. Keep the tendon passage between them clear.'] },
    ], check: 'Both sides of the wrist hardware are fitted and the central tendon passage is open.',
  },
  {
    title: 'Route the tendons through the wrist', stage: 3, start: 2460, end: 2640,
    intro: 'Work through the palm tendon bundle in order, alternating directions exactly as demonstrated.',
    groups: [
      { frames: [[2485, 'Check the relative orientation of the palm and wrist housing.'], [2515, 'Begin passing the tendons through the wrist.'], [2535, 'Select the next tendon in line; untangle the bundle first.']], items: ['Orient the palm and wrist housing as shown, leaving room to see the individual strands.', 'Select the next tendon in order at the palm exit. Untangle it before passing it through the corresponding wrist route.'] },
      { frames: [[2565, 'Continue through the sequence, switching directions each time.'], [2595, 'Keep the housing apart while completing the routing.'], [2625, 'Inspect the completed row of tendon exits.']], items: ['Continue through the tendon sequence, alternating directions as shown. Preserve the deliberate routing pattern and avoid additional crossings.', 'Inspect the full row of exits before bringing the palm and housing together.'] },
    ], check: 'The tendon sequence is preserved through the wrist and no strand is trapped or out of order.',
  },
  {
    title: 'Join the hand & install the wrist motor', stage: 3, start: 2640, end: 2920,
    intro: 'Join the palm and housing, fit the wrist belt and servo, then secure both adjusters.',
    groups: [
      { frames: [[2655, 'Fit the wrist joint hardware.'], [2695, 'Bring the palm into its seated position.'], [2745, 'Check the belt and palm connection.']], items: ['Fit the wrist joint hardware in the illustrated positions and seat the palm on the housing.', 'Fit the wrist belt along the demonstrated path while keeping the tendon bundle clear.'] },
      { frames: [[2785, 'Prepare the wrist motor’s output assembly.'], [2815, 'Fit the output pulley.'], [2855, 'Place the prepared motor into the housing and engage the belt.'], [2895, 'Secure the wrist motor and adjustment hardware.']], items: ['Prepare the wrist motor and fit its output pulley with the supplied matching hardware.', 'Place the motor into the housing, engage the belt, and secure the motor as shown.'] },
      { frames: [[2905, 'Source correction: move BOTH screws inward and secure them tightly.']], items: ['Move both adjustment screws inward and tighten them securely. The video demonstrates one but explicitly requires both.'] },
    ], check: 'The wrist motor is seated, the belt is engaged, and both adjustment screws are secure.',
  },
  {
    title: 'Prepare the motor tower & fans', stage: 4, start: 2920, end: 3200,
    intro: 'Fit the cooling fans and retaining hardware before filling the tower with finger motors.',
    groups: [
      { frames: [[2925, 'Gather the lower tower, two fans, grille, and fasteners.'], [2985, 'Locate the fan in the tower.'], [3015, 'Fasten the fan while retaining access to its cable.'], [3055, 'Check the cable path inside the tower.']], items: ['Position both fans in their tower locations with the orientation shown. Keep the fan leads accessible.', 'Fit the corresponding fan fasteners and route the leads clear of the motor bays.'] },
      { frames: [[3095, 'Secure the tower hardware from the side.'], [3155, 'Inspect the fitted fans and open motor bays.'], [3185, 'Fit the remaining nuts into their tower positions.']], items: ['Fit the remaining tower screws and captive nuts as shown. Keep the grille aside for the final housing stage.'] },
    ], check: 'Both fans are fitted, their leads are clear, and the motor bays are ready.',
  },
  {
    title: 'Prepare the sixteen motor spools', stage: 4, start: 3200, end: 3390,
    intro: 'Sort the spool components, fit their small hardware, and prepare each finger motor in the same way.',
    groups: [
      { frames: [[3235, 'Sort the spool components into matching sets.'], [3255, 'Close-up of the spool insert orientation.'], [3285, 'Prepare the small fasteners.']], items: ['Sort the spool parts into matching sets. Fit the small inserts and M2 hardware in the illustrated orientation.'] },
      { frames: [[3315, 'Attach the prepared component to a motor.'], [3355, 'Secure the spool hardware.'], [3375, 'Inspect the completed motor assembly.']], items: ['Fit and secure the prepared spool components to the motor as shown.', 'Repeat the preparation for all sixteen finger motors. Keep the winding components organised for the tendon stage.'] },
    ], check: 'All sixteen finger motors have the matching spool hardware prepared.',
  },
  {
    title: 'Connect & configure the motor chain', stage: 4, start: 3390, end: 3610,
    intro: 'Connect the U2D2 and DYNAMIXEL power board, then add motors in the sequence requested by the configuration program.',
    groups: [
      { frames: [[3395, 'Connect the U2D2 and DYNAMIXEL power board as shown.'], [3435, 'Prepare the tower connections.'], [3485, 'The recording starts the motor-chain configuration program.']], items: ['Connect the U2D2, power board, and motor cable chain in the illustrated arrangement.', 'Start the v2 motor-chain configuration procedure from the matching ORCA software setup.'] },
      { frames: [[3515, 'Only continue when the program reports that the motor was found.'], [3535, 'Seat each motor fully until it clicks.'], [3585, 'Continue connecting and seating the next motors.']], items: ['Connect the requested motor and wait for the program to confirm it was found before continuing.', 'Insert each configured motor fully into its intended bay. Follow the program’s sequence while extending the cable chain.'] },
    ], check: 'The first motor bank is fully seated and every added motor has been detected.',
    note: 'The screen at 58:05 shows scripts/configure_motor_chain.py with --motor-type dynamixel. Use the software and hand configuration matching your kit; this checklist does not supply a software installation or a motor-ID map.',
  },
  {
    title: 'Fill the remaining motor bays', stage: 4, start: 3610, end: 3940,
    intro: 'Continue the motor configuration sequence around the tower, keeping all connecting cables out of the clips.',
    groups: [
      { frames: [[3625, 'Turn the tower to reach the next motor bank.'], [3675, 'Connect and seat the next motor.'], [3695, 'Do not clamp the cable under a motor.'], [3715, 'Push the cable through the small opening before fitting the next part.']], items: ['Continue adding motors in the configuration program’s order, rotating the tower for access.', 'Pass the connecting cables through the indicated openings before seating each motor. Check that no cable is pinched under a clip or motor body.'] },
      { frames: [[3765, 'Continue filling the opposite bank.'], [3855, 'Fit the remaining motors.'], [3915, 'Inspect the fully populated tower and cable exits.']], items: ['Finish the remaining banks and confirm every motor is seated fully.', 'Check the chain connections and leave the wrist connection accessible for joining the upper hand.'] },
    ], check: 'All sixteen finger motors are seated and the connecting cables remain free of the clips.',
  },
  {
    title: 'Join the motor tower to the hand', stage: 4, start: 3940, end: 4080,
    intro: 'Bring the two assemblies together while preserving the tendon bundle and wrist cable path.',
    groups: [
      { frames: [[3965, 'Prepare the tower connection.'], [3985, 'Bring the upper hand onto the motor tower.'], [4015, 'Keep the wrist cable free and align the housing edges.']], items: ['Connect the wrist cable and bring the upper hand and motor tower together.', 'Check that the wrist cable is not clamped and that the mating edges align completely. Keep the tendons outside the joint.'] },
      { frames: [[4025, 'The configuration program finishes once all motors have been configured.'], [4065, 'Secure the joined tower sections.']], items: ['Confirm the configuration program reports completion for all motors.', 'Fit and tighten the tower joining hardware in the illustrated positions.'] },
    ], check: 'The tower is secure, the wrist cable is clear, and motor configuration has completed.',
  },
  {
    title: 'Identify & check the tendon pairs', stage: 5, start: 4080, end: 4170,
    intro: 'Use the spool-routing overlay to verify the tendon pairs before tying them to the motors.',
    groups: [
      { frames: [[4085, 'The blue/orange overlay shows the tendon pairing and spool arrangement.'], [4125, 'Trace the individual tendon exits at the wrist.'], [4155, 'Pull pairs to check the joint action before winding.']], items: ['Compare the tendon pairs with the blue/orange reference overlay and identify their intended motor positions.', 'Trace each strand from its wrist exit and pull the pair to check the associated joint. Correct any wrist-routing mistakes before winding.'] },
    ], check: 'Each motor position has an identified tendon pair with the expected joint action.',
  },
  {
    title: 'Anchor & wind the first tendon spools', stage: 5, start: 4170, end: 4440,
    intro: 'Work on one identified tendon pair at a time, using the first spool assembly as the template.',
    groups: [
      { frames: [[4185, 'Separate the first tendon pair.'], [4205, 'Draw the pair toward its assigned motor.'], [4245, 'Prepare the tendon ends at the spool.']], items: ['Separate the selected pair from the loose bundle and lead it to its assigned motor.', 'Prepare and anchor the tendon ends in the spool features as demonstrated, keeping the pair in its intended winding paths.'] },
      { frames: [[4325, 'Prepare the removable spool piece.'], [4345, 'Close-up of the tendon and spool before seating.'], [4365, 'Wind the tendon into the spool groove.'], [4385, 'Seat the wound spool on its motor.'], [4425, 'Secure the spool after checking the tendon path.']], items: ['Wind the tendon onto the corresponding spool groove in the direction shown. Keep it seated in the groove as you bring the spool onto the motor.', 'Seat and secure the spool hardware. Check that the paired tendons run cleanly from the wrist to the spool.'] },
    ], check: 'The first spools are secured and their tendons stay in the intended grooves.',
    note: 'The recording uses several close-up views rather than a written turn count. Follow the illustrated winding direction and groove path; no universal number of turns is specified here.',
  },
  {
    title: 'Finish winding & check the motion', stage: 5, start: 4440, end: 4610,
    intro: 'Repeat the demonstrated spooling sequence across the remaining motor positions, checking the finger action as you go.',
    groups: [
      { frames: [[4465, 'Repeat the winding process at the next motor.'], [4485, 'Check the completed spool arrangement.'], [4505, 'Perform the video’s quick motion check.']], items: ['Repeat the anchoring, winding, seating, and fastening sequence for the remaining tendon pairs and motor positions.', 'Check the associated finger movement after each pair. Keep the loose bundle separate from already wound tendons.'] },
      { frames: [[4545, 'Finish the remaining tendon ends.'], [4585, 'Inspect the routing with the hand turned to the side.'], [4605, 'The wound tendon assembly before the retaining rails are fitted.']], items: ['Inspect the spool grooves and tendon paths from both sides. Finish the free ends as demonstrated after confirming the routing.', 'Check that the tendons remain seated when the fingers move.'] },
    ], check: 'All tendon pairs are wound and retained, with the expected finger motion.',
  },
  {
    title: 'Fit the tendon retaining rails', stage: 5, start: 4610, end: 4830,
    intro: 'Install the long retaining pieces around the completed motor and tendon assembly.',
    groups: [
      { frames: [[4615, 'Lay out the long retaining rails and fasteners.'], [4645, 'Position the first rail beside the tendon runs.'], [4695, 'Secure the rail while keeping the tendons clear.']], items: ['Position the long retaining rails in their matching locations on the tower.', 'Fit the screws and check that no tendon or cable lies under a rail or fastener.'] },
      { frames: [[4735, 'Fasten the remaining retaining pieces.'], [4785, 'Secure the lower end of the assembly.'], [4815, 'Inspect the completed rails and tendon paths.']], items: ['Finish securing the rails on both sides. Inspect the full length of each tendon path and the cable exits.'] },
    ], check: 'The retaining rails are secure and the tendon runs remain unobstructed.',
  },
  {
    title: 'Mount the interface & power board', stage: 6, start: 4830, end: 5040,
    intro: 'Fit the communication interface in its holder and mount the electronics in the lower housing.',
    groups: [
      { frames: [[4855, 'Prepare the communication interface and its holder.'], [4875, 'Fit the interface into the holder.'], [4915, 'Connect the interface and power-board cable.']], items: ['Fit the U2D2 interface into its printed holder in the illustrated orientation.', 'Connect the interface, motor cable, and power-board wiring as shown, leaving the external connectors accessible.'] },
      { frames: [[4945, 'Prepare the housing attachment.'], [4955, 'Position the board in the lower housing.'], [4995, 'Connect the electronics to the hand.'], [5025, 'Fit and secure the power-board housing.']], items: ['Secure the electronics mounting pieces in the housing. The video allows about five minutes for the adhesive to dry before continuing.', 'Place the board and holder in the lower housing and secure them with the shown hardware. Keep wires clear of the tendons.'] },
    ], check: 'The electronics are mounted and the external connectors and tendon paths stay accessible.',
  },
  {
    title: 'Fit the covers & fan grille', stage: 6, start: 5040, end: 5130,
    intro: 'Close the magnetic housing and fit the fan grille, checking the cable exits before commissioning.',
    groups: [
      { frames: [[5055, 'Fit the main housing cover.'], [5085, 'Place the grille over the two fans.'], [5115, 'Inspect the covered hand from the side.']], items: ['Fit the magnetic covers, checking that no tendon or wire is trapped along their edges.', 'Fit the fan grille and check that both fans have a clear opening.', 'Inspect the completed housing and the accessible power and data connectors.'] },
    ], check: 'The covers locate correctly, the grille is fitted, and the connectors remain accessible.',
  },
  {
    title: 'Tension the hand', stage: 6, start: 5130, end: 5300,
    intro: 'Remove the service cover and follow the v2 software’s tensioning procedure while observing the tendons.',
    groups: [
      { frames: [[5145, 'Remove the cover to access the tendon spools.'], [5155, 'The recording starts scripts/tension.py.'], [5205, 'Observe and adjust the tendon assembly during tensioning.'], [5285, 'Check the fingers as the procedure progresses.']], items: ['Open the service cover and connect the hand to the matching v2 control setup.', 'Run the tensioning procedure and follow its prompts. Observe the tendon seating and joint response, correcting routing or spool seating if needed.', 'Check that each finger responds as expected before continuing to calibration.'] },
    ], check: 'The tensioning procedure has completed and the tendons remain seated in their grooves.',
    note: 'The recording shows scripts/tension.py. It does not provide a readable standalone specification for tension limits; use the matching hand configuration and software procedure.',
  },
  {
    title: 'Calibrate, test & close the hand', stage: 6, start: 5300, end: 5526,
    intro: 'Complete calibration, run the motion test, and check the tendon seating before replacing the service cover.',
    groups: [
      { frames: [[5305, 'Start the calibration procedure with the matching hand configuration.'], [5355, 'Observe finger motion during calibration.'], [5385, 'Move on to the test procedure.']], items: ['Run the v2 calibration procedure with the configuration for your hand and follow its prompts.', 'Run the demonstrated motion test. Check bending, extension, thumb movement, and wrist movement.'] },
      { frames: [[5445, 'The demonstrator applies load to help the tendons settle into their grooves.'], [5475, 'Inspect the tendon paths after the motion sequence.'], [5505, 'Replace the service cover after checking the assembly.']], items: ['Check for tendons leaving their grooves or routes shifting during motion. The recording demonstrates loading the hand to settle the tendon paths; it does not specify a load value.', 'Once the software procedures and motion checks are complete, replace the service cover.'] },
    ], check: 'Calibration and motion testing are complete, the tendon paths stay seated, and the cover is refitted.',
    note: 'The screen shows scripts/calibrate.py. Use the v2 configuration matching your hand; the guide’s checkboxes record your progress and do not measure calibration results.',
  },
];

export const V2_STEPS: AssemblyStep[] = V2_CHAPTERS.map((chapter, i) => ({
  number: i + 1, title: chapter.title, stage: chapter.stage, intro: chapter.intro,
  items: chapter.groups.flatMap(group => group.items), check: chapter.check, note: chapter.note,
}));
export const V2_PANELS: Record<number, AssemblyPanel[]> = {};
export const V2_DIAGRAMS: Record<string, { src: string; source: string; caption: string; seconds: number }[]> = {};
V2_CHAPTERS.forEach((chapter, i) => {
  const number = String(i + 1).padStart(2, '0');
  let imageIndex = 0, itemIndex = 0;
  V2_PANELS[i + 1] = chapter.groups.map(group => ({ images: group.frames.map(() => ++imageIndex), items: group.items.map(() => itemIndex++) }));
  V2_DIAGRAMS[number] = chapter.groups.flatMap(group => group.frames.map(([seconds, caption]) => ({
    src: `/assembly/v2/frames/${String(seconds).padStart(4, '0')}.jpg`,
    source: v2VideoAt(seconds), caption, seconds,
  })));
});
