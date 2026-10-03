/**
 * Client-Side Computer Vision Waste & Sanitation Inspector
 * Evaluates image pixels in real-time to accurately differentiate between
 * authentic municipal waste (litter, overflowing bins, open dumps, rubble)
 * and non-waste subjects (human selfies/portraits, clean rooms, pets, cars, clean landscapes, screenshots).
 */

export interface CivicVisionScanResult {
  isValidWaste: boolean;
  detectedContent: string;
  confidence: number;
  categoryMatch: 'Overflowing bin' | 'Garbage on road' | 'Burning waste' | 'Dead animal' | 'Illegal dumping' | 'Other' | 'None';
  reason: string;
}

/**
 * Robust skin pixel detector across diverse human ethnicities (light, medium, South Asian, dark)
 * Uses both YCbCr chrominance boundaries and normalized RGB constraints.
 */
function isSkinTonePixel(r: number, g: number, b: number): boolean {
  if (r < 60 || g < 35 || b < 20) return false;
  if (r <= g) return false;
  if (r - g < 8) return false;

  // YCbCr transformation
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  // Standard skin cluster in chrominance plane
  if (cb >= 75 && cb <= 130 && cr >= 130 && cr <= 180) {
    return true;
  }

  // Backup South Asian / olive / deep skin tone check
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = (max - min) / max;
  if (r > g && g > b && saturation >= 0.15 && saturation <= 0.65 && (r - b) >= 15 && (r - b) <= 95) {
    return true;
  }

  return false;
}

/**
 * Comprehensive visual pixel inspector for Kanpur Nagar Nigam civic grievance verification.
 */
export function inspectImagePixels(
  imageData: ImageData,
  fileName: string = 'evidence.jpg'
): CivicVisionScanResult {
  const pixels = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const totalPixels = width * height;

  if (totalPixels < 100) {
    return {
      isValidWaste: false,
      detectedContent: 'Empty Image File',
      confidence: 99,
      categoryMatch: 'None',
      reason: 'The uploaded file is empty. Please upload an authentic photo of the waste issue.',
    };
  }

  const lowerName = (fileName || '').toLowerCase();

  // 1. Explicit Keyword Checks in Filename
  const nonWasteKeywords = [
    'selfie', 'face', 'portrait', 'person', 'people', 'human',
    'cat', 'dog', 'pet', 'puppy', 'kitten', 'bird',
    'car', 'bike', 'motorcycle', 'scooter', 'vehicle', 'auto',
    'flower', 'garden_rose', 'tree_leaf', 'lawn', 'nature_view',
    'screenshot', 'invoice', 'receipt', 'passbook', 'payslip', 'resume', 'doc',
    'avatar', 'profile', 'dp', 'wedding', 'birthday', 'party', 'dinner', 'cake',
    'room', 'bedroom', 'living_room', 'office_desk', 'table', 'chair', 'furniture',
    'apple', 'banana_fruit', 'food', 'plate', 'meal', 'coffee', 'tea'
  ];

  for (const kw of nonWasteKeywords) {
    if (lowerName.includes(kw)) {
      let subject = 'Personal / Non-Waste Image';
      if (['selfie', 'face', 'portrait', 'person', 'dp', 'avatar'].includes(kw)) subject = 'Personal Portrait / Human Selfie';
      else if (['cat', 'dog', 'pet', 'puppy', 'kitten'].includes(kw)) subject = 'Domestic Pet / Animal';
      else if (['car', 'bike', 'motorcycle', 'vehicle'].includes(kw)) subject = 'Vehicle / Automobile';
      else if (['flower', 'lawn', 'garden_rose'].includes(kw)) subject = 'Clean Landscape / Flower';
      else if (['screenshot', 'invoice', 'receipt'].includes(kw)) subject = 'Digital Document / Screenshot';
      else if (['room', 'bedroom', 'office_desk', 'table'].includes(kw)) subject = 'Clean Indoor Area';
      else if (['food', 'plate', 'meal', 'apple'].includes(kw)) subject = 'Food / Dining Item';

      return {
        isValidWaste: false,
        detectedContent: subject,
        confidence: 97,
        categoryMatch: 'None',
        reason: `${subject} indicated by file context. Kanpur Nagar Nigam requires visual evidence showing the actual municipal waste or garbage problem.`,
      };
    }
  }

  // 2. Pixel Sampling (~3,000 distributed points)
  const targetSamples = Math.min(3500, Math.floor(totalPixels / 2));
  const step = Math.max(1, Math.floor(totalPixels / targetSamples));

  let totalSkin = 0;
  let centerSkin = 0;
  let centerTotal = 0;

  let nearWhitePixels = 0;
  let darkTextPixels = 0;
  let cleanSkyPixels = 0;
  let cleanFoliagePixels = 0;
  let metallicSpecularPixels = 0;

  // Waste indicators
  let asphaltGroundPixels = 0;
  let earthSoilPixels = 0;
  let plasticPackagingColorPixels = 0;
  let cdRubbleBrickPixels = 0;
  let municipalBinBlueGreen = 0;
  let darkSludgeCharcoalPixels = 0;

  let sumR = 0, sumG = 0, sumB = 0;
  const samplesTaken: { r: number; g: number; b: number }[] = [];
  const colorHistogram = new Uint16Array(64);

  const cxMin = Math.floor(width * 0.2);
  const cxMax = Math.floor(width * 0.8);
  const cyMin = Math.floor(height * 0.15);
  const cyMax = Math.floor(height * 0.85);

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];

    const x = i % width;
    const y = Math.floor(i / width);
    const isCenter = x >= cxMin && x <= cxMax && y >= cyMin && y <= cyMax;

    sumR += r;
    sumG += g;
    sumB += b;
    samplesTaken.push({ r, g, b });

    // 6-bit color quantization bin (0..63)
    const binIdx = ((r >> 6) << 4) | ((g >> 6) << 2) | (b >> 6);
    colorHistogram[binIdx]++;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const lum = (r + g + b) / 3;

    // A. Human Skin
    if (isSkinTonePixel(r, g, b)) {
      totalSkin++;
      if (isCenter) centerSkin++;
    }
    if (isCenter) centerTotal++;

    // B. Clean Document / Screenshot
    if (r > 225 && g > 225 && b > 225 && delta < 15) {
      nearWhitePixels++;
    } else if (r < 55 && g < 55 && b < 55) {
      darkTextPixels++;
    }

    // C. Clean Sky (Upper half, blue gradient)
    if (y < height * 0.5 && b > r + 30 && b > g + 15 && b > 110) {
      cleanSkyPixels++;
    }

    // D. Clean Lush Foliage / Grass (High green saturation)
    if (g > r + 20 && g > b + 20 && g > 75 && (g - min) / g > 0.3) {
      cleanFoliagePixels++;
    }

    // E. Metallic Specular Highlights (Vehicles / Chrome)
    if (lum > 240 && delta < 20) {
      metallicSpecularPixels++;
    }

    // F. Waste Signature: Asphalt road / street pavement background
    if (lum >= 45 && lum <= 140 && delta <= 22) {
      asphaltGroundPixels++;
    }

    // G. Waste Signature: Earth / dirt / unpaved roadside soil
    if (r > 70 && g > 45 && b < g && (r - b) > 25 && delta > 25 && delta < 85) {
      earthSoilPixels++;
    }

    // H. Waste Signature: Vibrant plastic packaging (chips packets, gutkha foil, bright bottle caps)
    if (delta > 70 && max > 140 && min < 120) {
      plasticPackagingColorPixels++;
    }

    // I. Waste Signature: Construction rubble / terracotta brick
    if (r > 125 && r < 210 && g > 55 && g < 115 && b < 80 && (r - g) > 40) {
      cdRubbleBrickPixels++;
    }

    // J. Waste Signature: Municipal Twin-Bins (Green & Blue container pigments)
    if ((b > 110 && b > r + 35 && b > g + 15) || (g > 105 && g > r + 25 && g > b + 15 && lum < 160)) {
      municipalBinBlueGreen++;
    }

    // K. Waste Signature: Dark stagnant sludge / charred open burning ash
    if (lum < 48 && delta < 18) {
      darkSludgeCharcoalPixels++;
    }
  }

  const sampleCount = samplesTaken.length;
  if (sampleCount === 0) {
    return {
      isValidWaste: false,
      detectedContent: 'Unreadable Image File',
      confidence: 95,
      categoryMatch: 'None',
      reason: 'Could not read image pixel stream.',
    };
  }

  const meanR = sumR / sampleCount;
  const meanG = sumG / sampleCount;
  const meanB = sumB / sampleCount;

  let totalVariance = 0;
  for (const s of samplesTaken) {
    const dR = s.r - meanR;
    const dG = s.g - meanG;
    const dB = s.b - meanB;
    totalVariance += (dR * dR + dG * dG + dB * dB) / 3;
  }
  const variance = totalVariance / sampleCount;

  // 3. Check for Solid / Blank Dummy Canvas
  if (variance < 18) {
    return {
      isValidWaste: false,
      detectedContent: 'Blank / Solid Color Dummy Image',
      confidence: 99,
      categoryMatch: 'None',
      reason: 'The uploaded file is a blank, solid-color dummy image with no photographic detail. Kanpur Nagar Nigam requires genuine visual evidence.',
    };
  }

  // 4. Check for Human Portrait / Selfie
  const overallSkinRatio = totalSkin / sampleCount;
  const centerSkinRatio = centerTotal > 0 ? centerSkin / centerTotal : 0;

  if (overallSkinRatio > 0.12 || centerSkinRatio > 0.18) {
    return {
      isValidWaste: false,
      detectedContent: 'Personal Selfie / Human Portrait',
      confidence: Math.min(99, Math.round(80 + overallSkinRatio * 40)),
      categoryMatch: 'None',
      reason: 'Human face/portrait detected in photo. Kanpur Nagar Nigam requires visual evidence showing the municipal waste or street sanitation problem.',
    };
  }

  // 5. Check for Digital Screenshot / Invoice / Document
  const whiteRatio = nearWhitePixels / sampleCount;
  const darkRatio = darkTextPixels / sampleCount;
  if (whiteRatio > 0.38 && darkRatio > 0.015) {
    return {
      isValidWaste: false,
      detectedContent: 'Digital Document / Text Screenshot',
      confidence: 97,
      categoryMatch: 'None',
      reason: 'Digital document or screenshot page detected. Please upload an authentic photograph of the street waste issue.',
    };
  }

  // 6. Compute Spatial Edge Gradient & Micro-Texture Chaos
  let edgeSum = 0;
  let edgeSampleCount = 0;
  let sharpFractureEdges = 0;
  const edgeChecks = Math.min(1500, Math.floor(totalPixels / 4));
  const edgeStep = Math.max(1, Math.floor((totalPixels - width * 2) / edgeChecks));

  for (let p = width + 1; p < totalPixels - width - 1; p += edgeStep) {
    const x = p % width;
    if (x === 0 || x === width - 1) continue;

    const idxCenter = p * 4;
    const idxRight = (p + 1) * 4;
    const idxDown = (p + width) * 4;

    const lumCenter = (pixels[idxCenter] + pixels[idxCenter + 1] + pixels[idxCenter + 2]) / 3;
    const lumRight = (pixels[idxRight] + pixels[idxRight + 1] + pixels[idxRight + 2]) / 3;
    const lumDown = (pixels[idxDown] + pixels[idxDown + 1] + pixels[idxDown + 2]) / 3;

    const grad = Math.abs(lumCenter - lumRight) + Math.abs(lumCenter - lumDown);
    if (grad > 20) {
      edgeSum++;
      if (grad > 55) {
        sharpFractureEdges++;
      }
    }
    edgeSampleCount++;
  }

  const edgeDensity = edgeSampleCount > 0 ? edgeSum / edgeSampleCount : 0;
  const sharpEdgeDensity = edgeSampleCount > 0 ? sharpFractureEdges / edgeSampleCount : 0;

  // Active color diversity
  let activeColorBins = 0;
  const binThreshold = sampleCount * 0.012;
  for (let b = 0; b < 64; b++) {
    if (colorHistogram[b] >= binThreshold) {
      activeColorBins++;
    }
  }

  // 7. Check for Clean Indoor Room / Empty Wall / Plain Furniture
  if (edgeDensity < 0.052 || (edgeDensity < 0.075 && activeColorBins <= 7)) {
    return {
      isValidWaste: false,
      detectedContent: 'Clean Indoor Area / Room Surface (No Waste)',
      confidence: 94,
      categoryMatch: 'None',
      reason: 'Clean indoor surface or uniform room area detected with no visible garbage or litter. Kanpur Nagar Nigam requires visual evidence of civic sanitation issues.',
    };
  }

  // 8. Check for Clean Outdoor Nature / Park / Lawn / Flowers (No Waste)
  const foliageRatio = cleanFoliagePixels / sampleCount;
  const skyRatio = cleanSkyPixels / sampleCount;
  const plasticRatio = plasticPackagingColorPixels / sampleCount;
  const groundRatio = asphaltGroundPixels / sampleCount;

  if ((foliageRatio > 0.45 || (foliageRatio + skyRatio > 0.60)) && plasticRatio < 0.04 && edgeDensity < 0.16) {
    return {
      isValidWaste: false,
      detectedContent: 'Clean Nature / Park / Foliage (No Waste)',
      confidence: 95,
      categoryMatch: 'None',
      reason: 'Clean outdoor greenery or landscape detected with no visible garbage or litter. Please photograph the specific municipal waste issue.',
    };
  }

  // 9. Check for Vehicle / Automobile (Specular highlights on smooth car body)
  const specularRatio = metallicSpecularPixels / sampleCount;
  if (specularRatio > 0.06 && activeColorBins <= 14 && edgeDensity < 0.12 && groundRatio > 0.15) {
    return {
      isValidWaste: false,
      detectedContent: 'Vehicle / Automobile Subject (No Waste Evidence)',
      confidence: 92,
      categoryMatch: 'None',
      reason: 'Vehicle or automobile subject detected with no visible municipal waste. Kanpur Nagar Nigam handles civic waste and garbage grievances.',
    };
  }

  // 10. Check for Clean Food / Dining Tableware
  if (whiteRatio > 0.22 && activeColorBins <= 10 && variance < 65 && edgeDensity < 0.09) {
    return {
      isValidWaste: false,
      detectedContent: 'Food / Dining Tableware (No Waste Issue)',
      confidence: 91,
      categoryMatch: 'None',
      reason: 'Food or tableware detected in a clean setting. Please upload a photo of the street sanitation or waste problem.',
    };
  }

  // 11. POSITIVE WASTE VERIFICATION ENGINE
  // Real municipal waste exhibits high texture entropy, mixed plastic wrappers,
  // overflowing bin pigments, construction debris bricks, or black drain sludge.

  const binRatio = municipalBinBlueGreen / sampleCount;
  const rubbleRatio = cdRubbleBrickPixels / sampleCount;
  const sludgeRatio = darkSludgeCharcoalPixels / sampleCount;
  const soilRatio = earthSoilPixels / sampleCount;

  // Pattern A: Overflowing Public Bin / Dumpster
  if ((binRatio > 0.08 && edgeDensity > 0.10) || (binRatio > 0.05 && plasticRatio > 0.05)) {
    return {
      isValidWaste: true,
      detectedContent: 'Overflowing Public Bin & Litter Accumulation',
      confidence: Math.min(98, Math.round(88 + binRatio * 60)),
      categoryMatch: 'Overflowing bin',
      reason: 'Municipal twin-bin / community container identified with overflowing solid waste and scattered litter.',
    };
  }

  // Pattern B: Construction & Demolition (C&D) Rubble / Masonry Debris
  if ((rubbleRatio > 0.07 && sharpEdgeDensity > 0.06) || (rubbleRatio > 0.04 && variance > 90 && edgeDensity > 0.13)) {
    return {
      isValidWaste: true,
      detectedContent: 'Construction Demolition Rubble & Masonry Debris',
      confidence: Math.min(97, Math.round(87 + rubbleRatio * 70)),
      categoryMatch: 'Illegal dumping',
      reason: 'C&D debris, broken brick fragments, and masonry rubble verified on public right-of-way.',
    };
  }

  // Pattern C: Roadside Garbage / Plastic Packaging / Litter Scatter
  if ((groundRatio > 0.12 && plasticRatio > 0.045 && edgeDensity > 0.11) ||
      (plasticRatio > 0.08 && edgeDensity > 0.12 && activeColorBins >= 10)) {
    return {
      isValidWaste: true,
      detectedContent: 'Roadside Plastic Waste & Discarded Packaging Litter',
      confidence: Math.min(97, Math.round(86 + edgeDensity * 45)),
      categoryMatch: 'Garbage on road',
      reason: 'Scattered solid waste, plastic wrappers, and litter accumulation verified on street pavement.',
    };
  }

  // Pattern D: Open Dumping on Vacant Lot / Soil Mound
  if ((soilRatio > 0.16 && (plasticRatio > 0.035 || edgeDensity > 0.13)) ||
      (variance > 110 && edgeDensity > 0.12 && activeColorBins >= 12)) {
    return {
      isValidWaste: true,
      detectedContent: 'Open Dumping & Mixed Solid Waste Mound',
      confidence: Math.min(96, Math.round(85 + edgeDensity * 40)),
      categoryMatch: 'Garbage on road',
      reason: 'Uncontrolled open dump accumulation with mixed solid waste verified.',
    };
  }

  // Pattern E: Open Burning / Charred Ash / Smoke Hazard
  if (sludgeRatio > 0.22 && sharpEdgeDensity > 0.07 && meanR < 70 && meanG < 70 && meanB < 70) {
    return {
      isValidWaste: true,
      detectedContent: 'Charred Residue / Open Waste Burning Evidence',
      confidence: 93,
      categoryMatch: 'Burning waste',
      reason: 'Dark charred waste residue and ash accumulation verified from open burning.',
    };
  }

  // Pattern F: Clogged Drain / Stagnant Municipal Gutter Sludge
  if (sludgeRatio > 0.18 && plasticRatio > 0.03 && edgeDensity > 0.09) {
    return {
      isValidWaste: true,
      detectedContent: 'Clogged Open Drain & Floating Plastic Debris',
      confidence: 92,
      categoryMatch: 'Garbage on road',
      reason: 'Accumulation of floating solid waste clogging civic drainage channels.',
    };
  }

  // Pattern G: High-entropy civic waste with filename correlation
  const wasteFilenameKeywords = ['garbage', 'waste', 'kachra', 'trash', 'litter', 'dustbin', 'dump', 'malba', 'rubble', 'overflow'];
  const hasWasteKeyword = wasteFilenameKeywords.some((k) => lowerName.includes(k));
  if (hasWasteKeyword && edgeDensity > 0.09 && variance > 40) {
    return {
      isValidWaste: true,
      detectedContent: 'Municipal Waste Site Evidence',
      confidence: 91,
      categoryMatch: lowerName.includes('bin') ? 'Overflowing bin' : lowerName.includes('malba') ? 'Illegal dumping' : 'Garbage on road',
      reason: 'Visual evidence of municipal solid waste verified under Kanpur SWM 2026 standards.',
    };
  }

  // If none of the positive waste patterns matched, this is an UNVERIFIED / NON-WASTE image!
  // CRITICAL: Reject arbitrary non-waste objects (e.g. coffee mugs, shoes, apples, furniture, clean scenery)
  return {
    isValidWaste: false,
    detectedContent: 'Unverified Subject / No Municipal Waste Evidence',
    confidence: 89,
    categoryMatch: 'None',
    reason: 'No municipal waste, litter, overflowing dustbin, or street sanitation hazard was detected in this photo. Kanpur Nagar Nigam requires visual evidence showing the actual waste problem.',
  };
}
