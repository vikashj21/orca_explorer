# Orca Hand v2 assembly stills

Official video: https://www.youtube.com/watch?v=TgIz7HiyaoU

Source: the user-supplied `videoplayback.mp4`. The opening title identifies the
recording as “orcahand v2 1000-DX-R full assembly video”. Duration: 92:06.024;
video dimensions: 640×360. The recording demonstrates the right-hand assembly.

The 173 JPEG files in `frames/` are full-frame stills extracted at the timestamps
listed in `source.json`. Original colours and on-screen annotations are preserved.
No generated detail, cropping, or recolouring is applied. JPEG encoding uses
FFmpeg quality 2. Written captions and checklists are editorial adaptations of
the visible demonstration and on-screen instructions, not an audio transcript.

The original recording is not bundled. Its SHA-256 is recorded in `source.json`.
No separate license for the supplied video was provided; the v1 diagrams’ CC BY
attribution does not imply a license for these v2 frames.

Regenerate with `npm run extract:assembly:v2 -- /path/to/videoplayback.mp4`.
