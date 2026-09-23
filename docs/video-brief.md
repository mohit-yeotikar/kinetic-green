# Kinetic Green homepage — video and motion-asset brief

This is the shot list, the prompts and the delivery spec for the video and image
sequences the homepage is built to take. Generate with any current model
(Google Veo 3, Runway Gen-4, Kling 2.x, Luma Ray 2, Pika 2). The prompts below
are written for text-to-video; where a **reference image** is listed, use the
model's image-to-video mode with that file so the vehicle stays on-model.

Drop finished files into `public/media/video/` with the exact names in the
table at the end. Nothing else has to change for the page to pick them up;
the integration notes say what each file drives.

---

## Ground rules for every clip

- **Vehicle is sacred.** The E-Luna must look like the E-Luna: black body,
  bright green steel frame loop, square headlamp, round mirrors, step-through,
  spoked wheels. Always attach `public/media/eluna-hero.webp` as the reference
  image. Reject any output where the frame shape, headlamp or wheels drift.
- **No generated logos, no generated text, no generated number plates.**
  Wordmarks and badges are added by us in the build. Ask the model for
  "no text, no logos, no watermarks".
- **Light, bright, clean.** Daylight or studio white. No dark grade, no teal-and-
  orange, no lens flare. The page is white; the clips must not fight it.
- **Slow camera.** One move per clip, slow, and it must loop or at least end
  calmly. Nothing hand-held or shaky.
- **People.** Indian riders, realistic wardrobe, helmets on. No stereotypes,
  no exaggerated poses, no models "presenting" the product.
- **Duration and loop.** 6 to 10 seconds. For loops, prompt "seamless loop"
  and trim on a matching frame in post.
- **Negative prompt (paste on every generation):**
  `text, logo, watermark, extra wheels, deformed frame, warped spokes,
  petrol tank, exhaust pipe, chain, kickstart, dark moody grade, lens flare,
  motion blur streaks, fisheye, low resolution, cartoon`

---

## 1. Hero stage loop (behind the pinned bike)

**Where it plays:** behind the product on the hero stage, muted, looping,
under the colour wash. It must read as light and air, not as a scene.

**Prompt:**
"Slow, soft, bright white studio environment, gentle drifting light and
subtle shadow movement across a seamless white cyclorama, a faint pale green
glow breathing slowly on the right third of frame, no objects, no people,
no text, 8 seconds, seamless loop, 16:9, minimal, calm."

**Deliver:** `hero-stage.mp4` 1920×1080, and `hero-stage-portrait.mp4`
1080×1920 (same prompt, 9:16).

## 2. Product turntable (replaces the hue-shift colour preview)

The colour picker currently hue-shifts one photo. Real per-colour renders or
photography make it honest. Two routes; do at least A.

**A. Still renders, one per colour.** Same angle as `eluna-hero.webp`
(front three-quarter, camera slightly above axle height, 50 mm equivalent),
white or transparent background, 2000×2300 px PNG with alpha. Colours:
Night Star Black, Sparkling Green, Pearl Yellow, Ocean Blue, Mulberry Red.
Files: `eluna-black.png` … `eluna-red.png`.

**B. 360° turntable sequence.** 36 frames at 10° steps, same camera height,
transparent PNG, 1600 px wide, named `eluna-green-000.png` …
`eluna-green-350.png`. With this the pinned story becomes a scroll-driven
spin. Repeat per colour only if budget allows; green first.

**If generating the turntable with video AI:** image-to-video from
`eluna-hero.webp`:
"The exact same electric moped from the reference image on a pure white
seamless background, camera orbits slowly 360 degrees around it at constant
height, product photography lighting, no people, no text, 10 seconds."
Then extract 36 evenly spaced frames. Expect to reject several takes; the
frame loop is the thing models most often break.

## 3. Battery chapter macro

**Where it plays:** chapter 01 on the pinned story, in a small inset.

**Prompt (image-to-video, reference `eluna-hero.webp`):**
"Close-up on the under-seat battery compartment of the electric moped from
the reference image, a woman's hands unlatch and lift out a compact black
lithium battery pack with a carry handle, bright studio light, white
background, slow and deliberate, no text, 6 seconds."

**Deliver:** `chapter-battery.mp4` 1280×720.

## 4. Charging at home

**Prompt:**
"An Indian apartment balcony in morning light, a compact black battery pack
with a carry handle resting on a shelf, plugged into an ordinary white
10-amp wall socket with a small charger, a green LED glowing, potted tulsi
plant nearby, warm sunlight, no people in frame, no text, 6 seconds, static
camera."

**Deliver:** `chapter-charge.mp4` 1280×720. Used in the Ownership section.

## 5. Everyday ride, the "Roz ki sawaari" section

Three short clips so we can cut them as a sequence. Same rider, same bike.

**5a School run**
"A young Indian father in a helmet rides the electric moped from the
reference image on a tree-lined residential street in Pune at 7:30 am, a
child in school uniform and helmet sitting pillion, soft morning light,
tracking shot alongside at moped speed, no text, 8 seconds."

**5b Market**
"The same electric moped parked at a busy Indian vegetable market, a woman
in a helmet loads two cloth bags onto the rear seat hooks, bright midday
light, medium shot, gentle push-in, no text, 6 seconds."

**5c Evening return**
"The same electric moped riding home at golden hour along a quiet Indian
suburban road, city skyline soft in the distance, slow drone follow from
behind and slightly above, no text, 8 seconds."

**Deliver:** `life-01.mp4`, `life-02.mp4`, `life-03.mp4` at 1920×1080, plus
`life-01-portrait.mp4` for phones.

## 6. Pink E-Rickshaw, women drivers

This is the emotional centre of the page. Real footage beats generated
footage here; if you can film two real drivers from the Maharashtra
programme, do that. If generating:

**6a Portrait**
"A confident Indian woman in her thirties, in a simple sari and a hi-vis
pink sash, standing beside a pink electric three-wheeler rickshaw with a
white cab, on a Pune street in soft morning light, she looks at the camera
and smiles slightly, shallow depth of field, no text, 6 seconds."

**6b Driving**
"A pink electric rickshaw with a white cab driven by an Indian woman, two
passengers with shopping bags in the back, moving steadily through a
mid-morning Pune street, tracking shot from the side, bright daylight, no
text, 8 seconds."

**6c Detail**
"Close-up of an Indian woman's hands on the handlebar of a pink electric
rickshaw, a digital display glowing green, bangles on her wrist, morning
light, slow push-in, no text, 5 seconds."

Reference image for the vehicle: `public/media/safar.webp`, with the
instruction "canopy and trim in bright pink instead of blue".

**Deliver:** `pink-01.mp4`, `pink-02.mp4`, `pink-03.mp4`, 1920×1080.

## 7. India undertone

Not a flag. Colour and texture of the country, used as a quiet band.

**Prompt:**
"Slow macro montage of Indian everyday colour: marigold garlands swaying,
saffron and green fabric drying in sunlight, a white kite against blue sky,
green paddy moving in wind, morning light, no people, no text, no flags,
seamless loop, 10 seconds, 21:9 cinematic."

**Deliver:** `india-band.mp4` 2560×1080. Plays behind the proof numbers,
desaturated 30% in the build so the green band still leads.

## 8. Dealer and service

**Prompt:**
"Interior of a bright modern electric vehicle showroom in India, a row of
electric mopeds in five colours (black, green, yellow, blue, red), a
technician in a green polo shirt talking to a customer, wide shot with a
slow lateral dolly, daylight through large windows, no text, 8 seconds."

**Deliver:** `dealer.mp4` 1920×1080.

---

## Delivery spec

| File | Size | Format | Notes |
| --- | --- | --- | --- |
| Every `.mp4` | 1920×1080 unless noted | H.264 High, 24 or 30 fps, CRF 23, no audio | Under 4 MB for hero, under 3 MB for the rest |
| Every clip also as `.webm` | same frame size | VP9 or AV1, no audio | Smaller, used first where supported |
| Every clip also a poster | same frame size | `.jpg`, quality 80 | First frame; shown until the video loads and under reduced motion |
| Colour stills | 2000×2300 | PNG with alpha | See section 2 |
| Turntable | 1600 px wide, 36 frames | PNG with alpha | See section 2 |

Encode with ffmpeg if you have it:

```
ffmpeg -i in.mov -an -c:v libx264 -profile:v high -crf 23 -preset slow -movflags +faststart out.mp4
ffmpeg -i in.mov -an -c:v libvpx-vp9 -crf 34 -b:v 0 out.webm
ffmpeg -i in.mov -vframes 1 -q:v 3 out.jpg
```

## How the page uses them

- Videos are `<video autoplay muted loop playsinline>` with a poster, so they
  never block the first paint and never play sound. Under
  `prefers-reduced-motion` the poster shows and the video is not fetched.
- The hero stage video sits under the colour wash, so the tint still follows
  the picker.
- Colour stills replace the hue shift: picking a swatch swaps the image with a
  crossfade. The turntable, if supplied, turns the pinned story into a
  scroll-driven spin (the same controller, reading frame index from scroll
  progress).
- Lifestyle and pink clips play in place of the current photos and are cut
  between on scroll.

Send the files, or a link to them, and the wiring is a short change.
