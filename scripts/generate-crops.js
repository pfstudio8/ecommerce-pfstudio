const sharp = require('sharp');
const path = require('path');

async function run() {
  const src = path.join(__dirname, '..', 'public', 'images', 'lookbook-taller.jpg');
  const outDir = path.join(__dirname, '..', 'public', 'images');

  // Let's verify the dimensions of the source image
  const meta = await sharp(src).metadata();
  console.log('Source:', meta.width, 'x', meta.height);

  // In the image (1024 x 572):
  // 1. Vaso Chopp (top center on tall block):
  //    x: 420 to 565, y: 100 to 240
  await sharp(src)
    .extract({ left: 420, top: 100, width: 145, height: 145 })
    .toFile(path.join(outDir, 'crop-vaso-chopp.jpg'));
  console.log('1. Vaso Chopp cropped');

  // 2. Vaso Cristal (frosted glass with bamboo lid + straw on right block):
  //    x: 620 to 695, y: 320 to 455
  await sharp(src)
    .extract({ left: 620, top: 320, width: 80, height: 135 })
    .resize(120, 120, { fit: 'cover' })
    .toFile(path.join(outDir, 'crop-vaso-cristal.jpg'));
  console.log('2. Vaso Cristal cropped');

  // 3. Vaso de Trago (acrylic cup with lid and straw on left block):
  //    Wait! In the image:
  //    Look at the left pedestal:
  //    The acrylic cup has a straw, brown lid, and a circular green Argentinos Juniors logo!
  //    x: 310 to 395, y: 320 to 445!
  //    Wait! The straw goes up to y: 200.
  //    The cup itself is from y: 330 to y: 445!
  //    Let's extract x: 310, y: 220 to include the straw and cup, OR x: 310, y: 325, width: 85, height: 120!
  //    At y: 450 is the top edge of the puzzle!
  //    So by stopping at y: 445, it NEVER touches the puzzle of Jazmín!
  await sharp(src)
    .extract({ left: 310, top: 325, width: 85, height: 120 })
    .resize(120, 120, { fit: 'cover' })
    .toFile(path.join(outDir, 'crop-vaso-trago.jpg'));
  console.log('3. Vaso de Trago cropped');

  // 4. Rompecabezas (the 3 puzzle boards in front left):
  //    x: 105 to 430, y: 385 to 540
  //    Let's extract the puzzle boards:
  await sharp(src)
    .extract({ left: 105, top: 385, width: 220, height: 145 })
    .resize(145, 120, { fit: 'cover' })
    .toFile(path.join(outDir, 'crop-rompecabezas.jpg'));
  console.log('4. Rompecabezas cropped');

  // 5. Gorra Trucker (the red trucker caps in front right):
  //    x: 630 to 920, y: 400 to 550
  await sharp(src)
    .extract({ left: 630, top: 400, width: 280, height: 145 })
    .resize(180, 120, { fit: 'cover' })
    .toFile(path.join(outDir, 'crop-gorra-trucker.jpg'));
  console.log('5. Gorra Trucker cropped');
}

run().catch(console.error);

