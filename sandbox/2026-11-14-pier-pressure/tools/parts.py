# The poses that are cut into pieces, and how (read by tools/green.py). Polygons are in the pose's
# own pixels, tried in order: a shape belongs to the first one that holds its centre, else to `rest`.
BODY = ['legs', 'shorts', 'arm', 'torso', 'head', 'cow']
PARTS.update({
    # the gull is cut from the bollard his sheet stands him on (his feet, and all above them)
    ('captain', 'perch'): {'rest': 'post', 'order': ['post', 'bird'], 'at': [228, 536], 'parts': [
        ('bird', [(112, 500), (232, 500), (236, 522), (226, 538), (180, 540), (122, 538), (110, 524)]),
        ('bird', [(232, 496), (338, 496), (342, 520), (330, 534), (290, 536), (240, 534), (232, 520)]),
        ('bird', [(0, 0), (500, 0), (500, 500), (0, 500)])]},
    # what he carries (the cone, its chips, the claws that hold it) is a piece of its own
    ('captain', 'fly'): {'rest': 'body', 'order': ['body', 'cone'], 'parts': [
        ('cone', [(0, 400), (130, 400), (160, 440), (215, 470), (235, 520), (225, 600), (190, 680), (0, 680)])]},
    # Hoagie's thumbs-up drawings, each cut into the pieces its frames are edited from
    ('hoagie', 'a1'): {'rest': 'legs', 'order': BODY, 'parts': [
        ('cow', [(138, 0), (180, 0), (180, 40), (140, 42)]),
        ('head', [(0, 30), (300, 30), (300, 125), (285, 145), (235, 160), (180, 170), (130, 166), (75, 152), (0, 140)]),
        ('torso', [(0, 130), (330, 130), (330, 285), (215, 278), (130, 290), (60, 275), (0, 275)]),
        ('shorts', [(35, 270), (290, 270), (290, 348), (35, 348)])]},
    ('hoagie', 'a2'): {'rest': 'legs', 'order': BODY, 'parts': [
        ('cow', [(70, 0), (120, 0), (120, 48), (72, 50)]),
        ('arm', [(232, 40), (340, 40), (340, 180), (262, 196), (240, 212), (222, 196), (236, 160)]),
        ('head', [(0, 35), (222, 35), (232, 80), (236, 130), (226, 170), (208, 200), (160, 222), (95, 218), (40, 185), (0, 165)]),
        ('torso', [(15, 170), (340, 170), (340, 338), (225, 330), (130, 340), (45, 325), (15, 325)]),
        ('shorts', [(60, 322), (250, 322), (250, 415), (60, 415)])]},
    ('hoagie', 'a3'): {'rest': 'legs', 'order': BODY, 'parts': [
        ('cow', [(150, 0), (200, 0), (200, 42), (152, 44)]),
        ('head', [(0, 30), (282, 30), (282, 140), (270, 165), (230, 180), (190, 190), (130, 192), (80, 178), (0, 165)]),
        ('arm', [(252, 165), (282, 150), (288, 110), (340, 110), (340, 225), (268, 228), (258, 212), (246, 192)]),
        ('torso', [(0, 160), (340, 160), (340, 315), (225, 308), (150, 322), (75, 310), (0, 310)]),
        ('shorts', [(50, 300), (275, 300), (275, 388), (50, 388)])]},
})
