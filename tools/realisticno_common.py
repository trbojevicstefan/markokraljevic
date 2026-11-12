"""Sizes and prompt builders shared by the biome definitions."""

LAYER = (2048, 688)   # generated size of far/mid/near (final 2172x724)
SKY = (1792, 896)     # generated size of the sky / interior back wall (final 1774x887)
TILE = (1024, 1024)   # generated size of a material (final 512x512)
FINAL_LAYER = (2172, 724)
FINAL_SKY = (1774, 887)
FINAL_TILE = (512, 512)
SPEED = {'sky': 0.04, 'far': 0.16, 'mid': 0.38, 'near': 0.72}

# Z-Image-Turbo runs without guidance, so it cannot negate: naming a thing ("no lamp posts, no cars") paints it.
# Only describe what should be there; keep the old generic "no perspective / no people" that proved harmless.
SIDE = ('Strict orthographic side view, a flat 2D side-scrolling game parallax layer like a theatre '
        'backdrop: perfectly level horizon, no perspective, no vanishing point, no people. A wild, timeless '
        '14th-century Balkan world of stone, timber, earth and plants.')
MAGENTA = ('Everything above and between the scenery is a flat, solid, pure magenta (#FF00FF) background with '
           'crisp clean edges, no sky, no gradient in the magenta.')
REAL = ('A real-world photograph with natural photographic colours, shot on a full-frame camera, ultra detailed real '
        'materials and textures.')


def layer_prompt(content, light):
    return f'{SIDE} The layer shows {content}. Lighting: {light}. {REAL} {MAGENTA}'


def interior_prompt(content, light):
    return (f'{SIDE} An interior layer that shows {content}. Lighting: {light}. {REAL} '
            f'Everything that is not part of these objects is a flat, solid, pure magenta (#FF00FF) background '
            f'with crisp clean edges, no gradient in the magenta.')


def sky_prompt(content, light):
    return (f'A wide seamless sky backdrop for a 2D side-scrolling game, seen straight from the side: {content}. '
            f'Lighting: {light}. Photorealistic sky photograph, ultra detailed clouds, no land, no mountains, '
            f'no buildings, no trees, no birds, no people, no text.')


def back_prompt(content, light):
    return (f'A flat back wall backdrop for an interior level of a 2D side-scrolling game, seen straight on '
            f'(orthographic front elevation, no perspective, no vanishing point, no corridor going into the '
            f'distance): {content}. Lighting: {light}. Photorealistic, ultra detailed real materials, no people, '
            f'no text.')


def tile_prompt(material):
    return (f'Seamless tileable texture of {material}. Flat orthographic top-down scan straight onto the surface, '
            f'evenly lit, no perspective, no vignette, no shadows from outside objects, the pattern fills the whole '
            f'square frame edge to edge. Photorealistic, ultra detailed, high resolution game texture.')


def prop_prompt(what):
    return (f'A single {what}, seen exactly from the side (orthographic side view, no perspective), whole object '
            f'visible and centered, standing upright. A realistic game prop, photorealistic, ultra detailed real '
            f'materials, soft even lighting. Isolated on a flat, solid, pure magenta (#FF00FF) background, no '
            f'ground, no cast shadow, no other objects, no people, no text.')
