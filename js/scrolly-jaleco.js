/**
 * UFF Medicina 2027 - Hero Parallax Exit & Scrollytelling do Jaleco
 * Saída natural do Hero com paralaxe multi-plano + pinagem dedicada aos 48 keyframes do médico
 * Sorteio aleatório feminino/masculino + 4 pilares informativos
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    const hero = document.getElementById('hero');
    const bgLayer = document.getElementById('hero-bg-layer');
    const textLayer = document.getElementById('hero-text-layer');
    const doctorsLayer = document.getElementById('hero-doctors-layer');

                ScrollTrigger.config({ ignoreMobileResize: true });

                const scrollyStage = document.getElementById('scrolly-stage');
                const isMobileScroll = window.innerWidth < 768;

                if (scrollyStage) {
                    const TOTAL_FRAMES = 48;
                    const FRAMES = new Array(TOTAL_FRAMES).fill(null);

                    // 4 Sprite Sheets intercalados (3x4 = 12 frames por arquivo, 4 requests totais)
                    // O Sheet 0 já cobre do frame 0 ao 47 (100% da animação disponível logo no 1º request!)
                    const SHEET_SLOTS = [
                        [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 47],
                        [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 45],
                        [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 44],
                        [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 46]
                    ];

                    // Sorteio aleatório a cada recarregamento (50% mulher / 50% homem)
                    const currentGender = Math.random() < 0.5 ? 'female' : 'male';
                    const canvas = document.getElementById('scrolly-canvas');
                    const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                    }
                    // Cache de geometria do canvas para zero cálculos matemáticos por frame de scroll
                    let cachedW = 0;
                    let cachedH = 0;
                    let cachedDrawW = 0;
                    let cachedDrawH = 0;
                    let cachedOffsetX = 0;
                    let cachedOffsetY = 0;

                    // Elementos do HUD de Progresso e Navegação Rápida
                    const scrollyHud = document.getElementById('scrolly-hud');
                    const scrollyProgressBar = document.getElementById('scrolly-progress-bar');
                    const scrollyScrollCue = document.getElementById('scrolly-scroll-cue');

                    if (scrollyScrollCue) {
                        scrollyScrollCue.addEventListener('click', (e) => {
                            e.preventDefault();
                            const vagas = document.getElementById('vagas');
                            if (!vagas) return;
                            if (window.__lenis) {
                                window.__lenis.scrollTo(vagas, { duration: 1.1 });
                            } else {
                                vagas.scrollIntoView({ behavior: 'smooth' });
                            }
                        });
                    }

                    // ==========================================================
                    // MOTOR DE INTERPOLAÇÃO SUAVE DESACOPLADA (LERP ASSISTIDO EM rAF)
                    // Sincronizado ao Lenis Smooth Scroll para resposta imediata e 60/120 FPS.
                    // ==========================================================
                    let targetFrame = 0;
                    let smoothFrame = 0;
                    let displayedIndex = -1;
                    let displayedSourceIndex = -1;
                    let isLoopRunning = false;

                    function isFrameReady(item) {
                        if (!item) return false;
                        if (item.sheet) {
                            return Boolean(item.sheet.complete && item.sheet.naturalWidth > 0);
                        }
                        if (typeof ImageBitmap !== 'undefined' && item instanceof ImageBitmap) {
                            return item.width > 0;
                        }
                        return Boolean(item.complete && item.naturalWidth > 0);
                    }

                    function getReadyFrameEntry(index) {
                        const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));

                        if (isFrameReady(FRAMES[clamped])) {
                            return { item: FRAMES[clamped], index: clamped };
                        }
                        for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
                            const prev = clamped - offset;
                            if (prev >= 0 && isFrameReady(FRAMES[prev])) {
                                return { item: FRAMES[prev], index: prev };
                            }
                            const next = clamped + offset;
                            if (next < TOTAL_FRAMES && isFrameReady(FRAMES[next])) {
                                return { item: FRAMES[next], index: next };
                            }
                        }
                        return null;
                    }

                    function drawFrame(item, sourceIdx) {
                        if (!canvas || !ctx || !item) return;
                        ctx.clearRect(0, 0, cachedW, cachedH);
                        if (item.sheet) {
                            ctx.drawImage(
                                item.sheet,
                                item.sx, item.sy, item.sw, item.sh,
                                cachedOffsetX, cachedOffsetY, cachedDrawW, cachedDrawH
                            );
                        } else {
                            ctx.drawImage(item, cachedOffsetX, cachedOffsetY, cachedDrawW, cachedDrawH);
                        }
                        if (typeof sourceIdx === 'number') {
                            displayedSourceIndex = sourceIdx;
                        }
                    }

                    function tickSmoothFrames() {
                        const diff = targetFrame - smoothFrame;

                        if (Math.abs(diff) > 0.04) {
                            const speed = Math.abs(diff) > 6 ? 0.34 : 0.24;
                            smoothFrame += diff * speed;
                            const nextIdx = Math.round(smoothFrame);

                            if (nextIdx !== displayedIndex) {
                                displayedIndex = nextIdx;
                                const entry = getReadyFrameEntry(nextIdx);
                                if (entry) drawFrame(entry.item, entry.index);
                            }
                            requestAnimationFrame(tickSmoothFrames);
                        } else {
                            smoothFrame = targetFrame;
                            const finalIdx = Math.round(smoothFrame);
                            if (finalIdx !== displayedIndex) {
                                displayedIndex = finalIdx;
                                const entry = getReadyFrameEntry(finalIdx);
                                if (entry) drawFrame(entry.item, entry.index);
                            }
                            isLoopRunning = false;
                        }
                    }

                    function updateTargetFrame(val) {
                        targetFrame = Math.max(0, Math.min(TOTAL_FRAMES - 1, val));
                        if (!isLoopRunning) {
                            isLoopRunning = true;
                            requestAnimationFrame(tickSmoothFrames);
                        }
                    }

                    function resizeDoctorCanvas() {
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const dpr = Math.min(window.devicePixelRatio || 1, 2);
                        canvas.width = Math.round(rect.width * dpr);
                        canvas.height = Math.round(rect.height * dpr);

                        cachedW = canvas.width;
                        cachedH = canvas.height;

                        const isMobile = window.innerWidth < 768;
                        const targetHeightRatio = isMobile ? 0.80 : 0.86;
                        cachedDrawH = cachedH * targetHeightRatio;
                        // Proporção exata 16:9 dos frames
                        cachedDrawW = (1600 / 900) * cachedDrawH;
                        cachedOffsetX = (cachedW - cachedDrawW) / 2;
                        cachedOffsetY = cachedH - cachedDrawH;

                        // Sincroniza o wrapper da fita Canvas 2D com bleed superior para os glifos na coroa da cabeça
                        const contourWrap = document.getElementById('scrolly-contour-wrap');
                        if (contourWrap && rect.width > 0 && rect.height > 0) {
                            const cssDrawH = rect.height * targetHeightRatio;
                            const cssDrawW = (1600 / 900) * cssDrawH;
                            const cssOffsetX = (rect.width - cssDrawW) / 2;
                            const cssOffsetY = rect.height - cssDrawH;
                            const cssTopBleed = (cssDrawH / 900) * CONTOUR_TOP_BLEED;

                            contourWrap.style.left = `${cssOffsetX}px`;
                            contourWrap.style.top = `${cssOffsetY - cssTopBleed}px`;
                            contourWrap.style.width = `${cssDrawW}px`;
                            contourWrap.style.height = `${cssDrawH + cssTopBleed}px`;

                            if (contourCanvas) {
                                const cDpr = Math.min(window.devicePixelRatio || 1, 1.5);
                                contourCanvas.width = Math.max(1, Math.round(cssDrawW * cDpr));
                                contourCanvas.height = Math.max(1, Math.round((cssDrawH + cssTopBleed) * cDpr));
                                contourScale = contourCanvas.width / 1600;
                                drawContourRibbon();
                            }
                        }

                        const entry = getReadyFrameEntry(Math.round(smoothFrame));
                        if (entry) drawFrame(entry.item, entry.index);
                    }

                    // ==========================================================
                    // CARREGAMENTO VIA SPRITE SHEET ATLAS + RECORTE GPU (4 REQUESTS TOTAIS)
                    // Reduz 94 requisições para 4 arquivos pré-escalados (desktop 1280x720 / mobile 768x432)
                    // e libera o atlas da VRAM logo após fatiar os ImageBitmaps.
                    // ==========================================================
                    const deviceMemory = navigator.deviceMemory || 8;
                    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
                    const useMobileTier = isMobileScroll || deviceMemory <= 2 || saveData;
                    const sheetTier = useMobileTier ? 'mobile' : 'desktop';
                    const cellW = useMobileTier ? 768 : 1280;
                    const cellH = useMobileTier ? 432 : 720;

                    function loadSheetViaImage(url) {
                        return new Promise((resolve, reject) => {
                            const img = new Image();
                            img.decoding = 'async';
                            img.onload = async () => {
                                if (typeof img.decode === 'function') await img.decode().catch(() => {});
                                resolve(img);
                            };
                            img.onerror = reject;
                            img.src = url;
                        });
                    }

                    async function sliceSheetIntoFrames(source, sheetIndex) {
                        const slots = SHEET_SLOTS[sheetIndex];
                        if (typeof createImageBitmap === 'function') {
                            try {
                                const bitmaps = await Promise.all(
                                    slots.map((_, pos) => {
                                        const sx = (pos % 3) * cellW;
                                        const sy = Math.floor(pos / 3) * cellH;
                                        return createImageBitmap(source, sx, sy, cellW, cellH);
                                    })
                                );
                                if (typeof source.close === 'function') source.close();
                                slots.forEach((frameIdx, pos) => {
                                    FRAMES[frameIdx] = bitmaps[pos];
                                });
                                return;
                            } catch (_) {
                                // Fallback abaixo para recorte direto no drawImage
                            }
                        }

                        slots.forEach((frameIdx, pos) => {
                            FRAMES[frameIdx] = {
                                sheet: source,
                                sx: (pos % 3) * cellW,
                                sy: Math.floor(pos / 3) * cellH,
                                sw: cellW,
                                sh: cellH
                            };
                        });
                    }

                    function refreshCanvasAfterSheetLoad() {
                        if (isLoopRunning) return;
                        const currentTargetIdx = Math.round(smoothFrame);
                        const best = getReadyFrameEntry(currentTargetIdx);
                        if (!best) return;

                        if (displayedIndex === -1 || best.index !== displayedSourceIndex) {
                            const prevDist = displayedSourceIndex === -1
                                ? Infinity
                                : Math.abs(currentTargetIdx - displayedSourceIndex);
                            const newDist = Math.abs(currentTargetIdx - best.index);
                            if (displayedIndex === -1 || newDist < prevDist) {
                                displayedIndex = currentTargetIdx;
                                drawFrame(best.item, best.index);
                            }
                        }
                    }

                    async function loadSheet(sheetIndex) {
                        const url = `assets/transformation/sheets/${currentGender}/${sheetTier}_${sheetIndex}.webp`;
                        let source = null;

                        if (typeof createImageBitmap === 'function') {
                            try {
                                const res = await fetch(url, sheetIndex === 0 ? { priority: 'high' } : undefined);
                                if (!res.ok) throw new Error('HTTP ' + res.status);
                                const blob = await res.blob();
                                source = await createImageBitmap(blob);
                            } catch (_) {
                                source = await loadSheetViaImage(url);
                            }
                        } else {
                            source = await loadSheetViaImage(url);
                        }

                        await sliceSheetIntoFrames(source, sheetIndex);
                        refreshCanvasAfterSheetLoad();
                    }

                    // ==========================================================
                    // FITA TIPOGRÁFICA ANIMADA EM CONTORNO (CANVAS 2D + LUT + SPRITE ATLAS)
                    // Substitui textPath SVG + drop-shadow CSS por sprites 2x pré-renderizados,
                    // eliminando 100% do layout de texto SVG e blur shaders por frame.
                    // ==========================================================
                    const SILHOUETTE_PATHS = {
                        female: 'M 560.2 927.4 C 563.7 909.9, 582.7 852.2, 580.9 822.3 C 579.1 792.4, 565.4 770.1, 549.5 748.1 C 533.6 726.1, 496.5 713.7, 485.3 690.4 C 474.2 667.0, 479.5 634.0, 482.6 608.1 C 485.6 582.2, 495.2 560.4, 503.5 534.8 C 511.9 509.2, 521.4 480.7, 532.5 454.6 C 543.6 428.4, 552.9 399.8, 570.0 377.9 C 587.2 356.0, 620.2 343.9, 635.4 323.1 C 650.5 302.3, 654.2 279.0, 661.0 253.0 C 667.7 227.0, 669.1 194.9, 676.0 167.0 C 682.9 139.2, 690.1 111.1, 702.6 85.8 C 715.1 60.6, 732.7 28.5, 751.1 15.5 C 769.5 2.4, 793.7 -1.8, 813.1 7.5 C 832.5 16.8, 852.3 47.9, 867.4 71.4 C 882.6 94.9, 895.2 121.3, 904.2 148.4 C 913.2 175.4, 914.7 207.3, 921.3 233.5 C 927.9 259.7, 928.8 284.7, 943.6 305.6 C 958.4 326.5, 992.5 337.5, 1010.2 358.9 C 1027.9 380.2, 1038.7 407.8, 1050.0 433.8 C 1061.3 459.7, 1070.3 488.5, 1077.9 514.4 C 1085.5 540.3, 1091.4 562.8, 1095.5 589.1 C 1099.7 615.4, 1110.3 647.0, 1102.8 672.5 C 1095.3 697.9, 1067.2 718.6, 1050.3 741.7 C 1033.5 764.8, 1007.6 780.1, 1001.8 811.1 C 996.0 842.2, 1013.2 908.4, 1015.5 927.8',
                        male: 'M 563.3 923.8 C 553.9 907.9, 526.8 856.1, 506.6 828.3 C 486.5 800.6, 457.7 783.4, 442.4 757.3 C 427.2 731.1, 415.3 700.3, 414.9 671.5 C 414.5 642.7, 431.8 611.8, 440.3 584.6 C 448.9 557.5, 455.7 534.9, 466.1 508.5 C 476.5 482.1, 487.0 451.1, 502.9 426.1 C 518.8 401.1, 537.9 375.7, 561.5 358.6 C 585.1 341.4, 624.5 339.7, 644.4 323.2 C 664.2 306.8, 676.8 285.1, 680.7 259.8 C 684.7 234.4, 667.1 200.8, 668.2 171.1 C 669.2 141.4, 675.2 108.2, 686.9 81.3 C 698.6 54.5, 718.1 22.4, 738.5 10.2 C 758.9 -2.0, 788.4 -3.2, 809.2 8.2 C 830.0 19.6, 851.0 51.9, 863.4 78.5 C 875.9 105.0, 881.9 137.8, 883.9 167.6 C 885.8 197.4, 869.6 232.4, 875.1 257.3 C 880.5 282.3, 895.9 301.7, 916.8 317.4 C 937.7 333.1, 976.3 334.6, 1000.2 351.5 C 1024.1 368.5, 1043.9 394.0, 1060.2 419.0 C 1076.4 443.9, 1087.4 474.6, 1097.8 501.0 C 1108.2 527.5, 1113.9 550.5, 1122.5 577.6 C 1131.1 604.7, 1147.9 635.1, 1149.4 663.9 C 1150.8 692.7, 1144.1 723.8, 1131.0 750.3 C 1118.0 776.9, 1093.1 794.5, 1071.0 823.1 C 1048.9 851.8, 1010.4 905.7, 998.2 922.2'
                    };

                    const contourCanvas = document.getElementById('scrolly-contour-canvas');
                    const contourCtx = contourCanvas ? contourCanvas.getContext('2d', { alpha: true }) : null;
                    const CONTOUR_TOP_BLEED = 44;
                    const LUT_STEP = 2;
                    let lutX = null;
                    let lutY = null;
                    let lutA = null;
                    let lutLen = 0;
                    let lutTotalLen = 0;
                    let contourScale = 1;

                    function buildBezierLUT(dStr) {
                        const tokens = dStr.match(/[MC]|-?\d+(?:\.\d+)?/g);
                        if (!tokens || tokens.length < 3) return;
                        let i = 0;
                        let cx = 0;
                        let cy = 0;
                        const rawX = [];
                        const rawY = [];
                        const rawD = [0];
                        let total = 0;
                        const SAMPLES_PER_SEG = 24;

                        while (i < tokens.length) {
                            const tok = tokens[i++];
                            if (tok === 'M') {
                                cx = parseFloat(tokens[i++]);
                                cy = parseFloat(tokens[i++]);
                                rawX.push(cx);
                                rawY.push(cy);
                            } else if (tok === 'C') {
                                const x1 = parseFloat(tokens[i++]);
                                const y1 = parseFloat(tokens[i++]);
                                const x2 = parseFloat(tokens[i++]);
                                const y2 = parseFloat(tokens[i++]);
                                const x3 = parseFloat(tokens[i++]);
                                const y3 = parseFloat(tokens[i++]);
                                let prevX = cx;
                                let prevY = cy;
                                for (let s = 1; s <= SAMPLES_PER_SEG; s++) {
                                    const t = s / SAMPLES_PER_SEG;
                                    const mt = 1 - t;
                                    const mt2 = mt * mt;
                                    const t2 = t * t;
                                    const px = mt2 * mt * cx + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t2 * t * x3;
                                    const py = mt2 * mt * cy + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t2 * t * y3;
                                    total += Math.hypot(px - prevX, py - prevY);
                                    rawX.push(px);
                                    rawY.push(py);
                                    rawD.push(total);
                                    prevX = px;
                                    prevY = py;
                                }
                                cx = x3;
                                cy = y3;
                            }
                        }

                        lutTotalLen = total;
                        lutLen = Math.floor(total / LUT_STEP) + 1;
                        lutX = new Float32Array(lutLen);
                        lutY = new Float32Array(lutLen);
                        lutA = new Float32Array(lutLen);

                        let rIdx = 0;
                        for (let k = 0; k < lutLen; k++) {
                            const targetD = k * LUT_STEP;
                            while (rIdx < rawD.length - 2 && rawD[rIdx + 1] < targetD) {
                                rIdx++;
                            }
                            const segLen = rawD[rIdx + 1] - rawD[rIdx];
                            const ratio = segLen > 0 ? (targetD - rawD[rIdx]) / segLen : 0;
                            lutX[k] = rawX[rIdx] + (rawX[rIdx + 1] - rawX[rIdx]) * ratio;
                            lutY[k] = rawY[rIdx] + (rawY[rIdx + 1] - rawY[rIdx]) * ratio;
                        }

                        for (let k = 0; k < lutLen; k++) {
                            const k0 = Math.max(0, k - 2);
                            const k1 = Math.min(lutLen - 1, k + 2);
                            lutA[k] = Math.atan2(lutY[k1] - lutY[k0], lutX[k1] - lutX[k0]);
                        }
                    }

                    const contourUnit = '✦\u00A0TORNE-SE\u00A0ESPECIALISTA\u00A0✦\u00A0PÓS-GRADUAÇÃO\u00A0UFF\u00A0';
                    const ATLAS_SUPERSAMPLE = 2;
                    const ATLAS_FONT_SIZE = 21;
                    const ATLAS_LETTER_SPACING = ATLAS_FONT_SIZE * 0.18;
                    const ATLAS_FONT = `800 ${ATLAS_FONT_SIZE}px "Plus Jakarta Sans", system-ui, sans-serif`;
                    const ATLAS_PAD_X = 12;
                    const ATLAS_CELL_H = 64;
                    const ATLAS_BASELINE_Y = 38;

                    let atlasCanvas = null;
                    let glyphSeq = [];
                    let contourUnitLength = 671.8;
                    let contourOffset = 0;

                    function bakeGlyphAtlas() {
                        const probe = document.createElement('canvas');
                        const pCtx = probe.getContext('2d');
                        if (!pCtx) return;

                        pCtx.font = ATLAS_FONT;
                        const glyphMap = {};
                        const uniqueChars = Array.from(new Set(Array.from(contourUnit)));
                        let curX = 0;

                        for (let i = 0; i < uniqueChars.length; i++) {
                            const ch = uniqueChars[i];
                            const isSpace = ch === ' ' || ch === '\u00A0';
                            const rawW = Math.max(isSpace ? 5.5 : 4, pCtx.measureText(ch).width);
                            const adv = rawW + ATLAS_LETTER_SPACING;
                            if (isSpace) {
                                glyphMap[ch] = { ch, isSpace: true, rawW, halfW: rawW * 0.5, adv };
                            } else {
                                const boxW = Math.ceil(rawW) + ATLAS_PAD_X * 2;
                                glyphMap[ch] = {
                                    ch,
                                    isSpace: false,
                                    sx: curX,
                                    boxW,
                                    srcX: curX * ATLAS_SUPERSAMPLE,
                                    srcW: boxW * ATLAS_SUPERSAMPLE,
                                    srcH: ATLAS_CELL_H * ATLAS_SUPERSAMPLE,
                                    rawW,
                                    halfW: rawW * 0.5,
                                    adv
                                };
                                curX += boxW + 4;
                            }
                        }

                        const aCanvas = document.createElement('canvas');
                        aCanvas.width = Math.max(1, curX * ATLAS_SUPERSAMPLE);
                        aCanvas.height = ATLAS_CELL_H * ATLAS_SUPERSAMPLE;
                        const aCtx = aCanvas.getContext('2d');
                        if (!aCtx) return;

                        aCtx.scale(ATLAS_SUPERSAMPLE, ATLAS_SUPERSAMPLE);
                        aCtx.font = ATLAS_FONT;
                        aCtx.textBaseline = 'alphabetic';
                        aCtx.textAlign = 'left';
                        aCtx.fillStyle = '#FFFFFF';
                        aCtx.shadowColor = 'rgba(0, 0, 0, 0.72)';
                        aCtx.shadowBlur = 7;
                        aCtx.shadowOffsetX = 0;
                        aCtx.shadowOffsetY = 2;

                        for (let i = 0; i < uniqueChars.length; i++) {
                            const g = glyphMap[uniqueChars[i]];
                            if (!g.isSpace) {
                                aCtx.fillText(g.ch, g.sx + ATLAS_PAD_X, ATLAS_BASELINE_Y);
                            }
                        }

                        atlasCanvas = aCanvas;
                        glyphSeq = Array.from(contourUnit).map((ch) => glyphMap[ch]);
                        contourUnitLength = glyphSeq.reduce((sum, g) => sum + g.adv, 0) || 671.8;
                    }

                    function drawContourRibbon() {
                        if (!contourCtx || !contourCanvas || !atlasCanvas || !lutLen || contourCanvas.width === 0) return;

                        const scale = contourScale;
                        contourCtx.setTransform(1, 0, 0, 1, 0, 0);
                        contourCtx.clearRect(0, 0, contourCanvas.width, contourCanvas.height);

                        const TWO_PI = Math.PI * 2;
                        const seqLen = glyphSeq.length;
                        const maxIdx = lutLen - 1;
                        let s = contourOffset;
                        let guard = 0;

                        while (s < lutTotalLen && guard++ < 600) {
                            for (let j = 0; j < seqLen && s < lutTotalLen; j++) {
                                const g = glyphSeq[j];
                                if (!g.isSpace && s + g.rawW > 0) {
                                    const sMid = s + g.halfW;
                                    if (sMid >= 0 && sMid <= lutTotalLen) {
                                        const f = sMid / LUT_STEP;
                                        const i0 = Math.floor(f);
                                        const i1 = i0 < maxIdx ? i0 + 1 : maxIdx;
                                        const frac = f - i0;

                                        const px = lutX[i0] + (lutX[i1] - lutX[i0]) * frac;
                                        const py = lutY[i0] + (lutY[i1] - lutY[i0]) * frac;
                                        let da = lutA[i1] - lutA[i0];
                                        if (da > Math.PI) da -= TWO_PI;
                                        else if (da < -Math.PI) da += TWO_PI;
                                        const ang = lutA[i0] + da * frac;

                                        const cos = Math.cos(ang);
                                        const sin = Math.sin(ang);
                                        contourCtx.setTransform(
                                            cos * scale,
                                            sin * scale,
                                            -sin * scale,
                                            cos * scale,
                                            px * scale,
                                            (py + CONTOUR_TOP_BLEED) * scale
                                        );
                                        contourCtx.drawImage(
                                            atlasCanvas,
                                            g.srcX, 0, g.srcW, g.srcH,
                                            -(ATLAS_PAD_X + g.halfW), -ATLAS_BASELINE_Y, g.boxW, ATLAS_CELL_H
                                        );
                                    }
                                }
                                s += g.adv;
                            }
                        }

                        contourCtx.setTransform(1, 0, 0, 1, 0, 0);
                    }

                    if (contourCanvas && contourCtx && SILHOUETTE_PATHS[currentGender]) {
                        buildBezierLUT(SILHOUETTE_PATHS[currentGender]);
                        bakeGlyphAtlas();

                        if (document.fonts && document.fonts.ready) {
                            document.fonts.ready.then(() => {
                                bakeGlyphAtlas();
                                drawContourRibbon();
                            });
                        }

                        let lastScrollPos = window.scrollY || window.pageYOffset || 0;
                        let scrollSpeed = 0;

                        if (window.__lenis) {
                            window.__lenis.on('scroll', (e) => {
                                if (typeof e.velocity === 'number') {
                                    scrollSpeed = e.velocity * 0.4;
                                }
                            });
                        } else {
                            window.addEventListener('scroll', () => {
                                const currentY = window.scrollY || window.pageYOffset || 0;
                                scrollSpeed = (currentY - lastScrollPos) * 0.35;
                                lastScrollPos = currentY;
                            }, { passive: true });
                        }

                        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                        const baseSpeed = prefersReducedMotion ? 0 : 0.85;
                        let isContourVisible = true;
                        let contourRafId = null;

                        function tickContourRibbon() {
                            if (!isContourVisible || document.hidden || prefersReducedMotion) {
                                contourRafId = null;
                                return;
                            }

                            const step = baseSpeed + scrollSpeed;
                            scrollSpeed *= 0.88;
                            if (Math.abs(scrollSpeed) < 0.01) scrollSpeed = 0;

                            contourOffset -= step;

                            if (contourUnitLength > 0) {
                                while (contourOffset <= -contourUnitLength) {
                                    contourOffset += contourUnitLength;
                                }
                                while (contourOffset > 0) {
                                    contourOffset -= contourUnitLength;
                                }
                            }

                            drawContourRibbon();
                            contourRafId = requestAnimationFrame(tickContourRibbon);
                        }

                        function startContourLoop() {
                            if (prefersReducedMotion) {
                                drawContourRibbon();
                                return;
                            }
                            if (isContourVisible && !document.hidden && contourRafId === null) {
                                contourRafId = requestAnimationFrame(tickContourRibbon);
                            }
                        }

                        if ('IntersectionObserver' in window) {
                            const stageObserver = new IntersectionObserver((entries) => {
                                isContourVisible = Boolean(entries[0] && entries[0].isIntersecting);
                                if (isContourVisible) {
                                    drawContourRibbon();
                                    startContourLoop();
                                } else if (contourRafId !== null) {
                                    cancelAnimationFrame(contourRafId);
                                    contourRafId = null;
                                }
                            }, { threshold: 0.01 });
                            stageObserver.observe(scrollyStage);
                        }

                        document.addEventListener('visibilitychange', () => {
                            if (document.hidden && contourRafId !== null) {
                                cancelAnimationFrame(contourRafId);
                                contourRafId = null;
                            } else if (!document.hidden && isContourVisible) {
                                startContourLoop();
                            }
                        });

                        startContourLoop();
                    }

                    window.addEventListener('resize', resizeDoctorCanvas, { passive: true });
                    resizeDoctorCanvas();

                    // Sheet 0 exclusivo primeiro (0% -> 100% em 1 request), depois 1, depois 2 e 3 em paralelo
                    (async () => {
                        try {
                            await loadSheet(0);
                            await loadSheet(1);
                            await Promise.all([loadSheet(2), loadSheet(3)]);
                        } catch (_) {
                            // Silencioso caso algum request seja interrompido em navegação
                        }
                    })();

                    const frameProxy = { frame: 0 };

                    // ==========================================================
                    // 1. SAÍDA NATURAL DO HERO COM PARALAXE MULTI-PLANO AO ROLAR
                    // Usa yPercent/scale/opacity (não colide com x/y do mousemove em hero-parallax.js)
                    // ==========================================================
                    if (hero) {
                        const heroExitTl = gsap.timeline({
                            scrollTrigger: {
                                trigger: hero,
                                start: 'top top',
                                end: 'bottom top',
                                scrub: true,
                                invalidateOnRefresh: true
                            }
                        });

                        if (bgLayer) {
                            heroExitTl.to(bgLayer, {
                                yPercent: 22,
                                scale: 1.07,
                                opacity: 0.35,
                                ease: 'none',
                                duration: 1
                            }, 0);
                        }
                        if (textLayer) {
                            heroExitTl.to(textLayer, {
                                yPercent: 34,
                                scale: 0.92,
                                opacity: 0,
                                ease: 'power1.in',
                                duration: 0.85
                            }, 0);
                        }
                        if (doctorsLayer) {
                            heroExitTl.to(doctorsLayer, {
                                yPercent: 10,
                                scale: 1.04,
                                opacity: 0.15,
                                ease: 'none',
                                duration: 1
                            }, 0);
                        }
                        const bottomUI = hero.querySelector('.hero-bottom-ui');
                        if (bottomUI) {
                            heroExitTl.to(bottomUI, {
                                y: -44,
                                opacity: 0,
                                ease: 'power1.out',
                                duration: 0.55
                            }, 0);
                        }
                    }

                    // ==========================================================
                    // 2. ENTRADA PREPARATÓRIA DO PALCO ANTES DE TRAVAR A PINAGEM
                    // Enquanto #scrolly-stage sobe até o topo, título e contorno da silhueta
                    // já se alinham perfeitamente no centro antes do pin começar.
                    // ==========================================================
                    const sobreHeading = document.getElementById('sobre-heading');
                    if (sobreHeading && !sobreHeading.dataset.splitDone) {
                        sobreHeading.dataset.splitDone = 'true';
                        const rawWords = sobreHeading.innerText.trim().split(/\s+/);
                        sobreHeading.innerHTML = rawWords.map(w => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
                    }
                    const sobreWordInners = sobreHeading ? sobreHeading.querySelectorAll('.word-inner') : [];
                    const contourWrap = document.getElementById('scrolly-contour-wrap');

                    const entranceTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: scrollyStage,
                            start: 'top 85%',
                            end: 'top top',
                            scrub: true,
                            invalidateOnRefresh: true
                        }
                    });

                    if (sobreWordInners.length) {
                        entranceTl.fromTo(sobreWordInners,
                            { yPercent: 105, rotateZ: 3, opacity: 0 },
                            { yPercent: 0, rotateZ: 0, opacity: 1, stagger: 0.03, ease: 'power3.out', duration: 0.9 },
                            0
                        );
                    }
                    if (contourWrap) {
                        entranceTl.fromTo(contourWrap,
                            { scale: 0.94, opacity: 0.2 },
                            { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.9 },
                            0
                        );
                    }

                    // ==========================================================
                    // 3. PINAGEM DEDICADA EXCLUSIVAMENTE À ANIMAÇÃO DO MÉDICO + 4 PILARES
                    // 100% da distância pinada veste o jaleco e revela os 4 cards com precisão.
                    // ==========================================================
                    const coatTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: scrollyStage,
                            start: 'top top',
                            end: () => '+=' + (window.innerWidth < 768 ? 360 : 560),
                            pin: true,
                            pinSpacing: true,
                            anticipatePin: 1,
                            scrub: window.__lenis ? true : 0.2,
                            invalidateOnRefresh: true,
                            onUpdate: (self) => {
                                if (scrollyProgressBar) {
                                    scrollyProgressBar.style.transform = `scaleX(${self.progress})`;
                                }
                                if (scrollyHud) {
                                    if (self.progress <= 0.01) {
                                        scrollyHud.style.opacity = '0';
                                        scrollyHud.style.pointerEvents = 'none';
                                    } else if (self.progress > 0.88) {
                                        const fade = Math.max(0, (1 - self.progress) / 0.12);
                                        scrollyHud.style.opacity = String(fade);
                                        scrollyHud.style.pointerEvents = 'none';
                                    } else {
                                        scrollyHud.style.opacity = '1';
                                        scrollyHud.style.pointerEvents = 'auto';
                                    }
                                }
                            },
                            onLeave: () => {
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '0';
                                    scrollyHud.style.pointerEvents = 'none';
                                }
                            },
                            onLeaveBack: () => {
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '0';
                                    scrollyHud.style.pointerEvents = 'none';
                                }
                            },
                            onEnterBack: () => {
                                if (scrollyHud) {
                                    scrollyHud.style.opacity = '1';
                                    scrollyHud.style.pointerEvents = 'auto';
                                }
                            }
                        }
                    });

                    // Veste o jaleco ao longo de praticamente toda a pinagem (0.00 -> 0.92)
                    coatTl.to(frameProxy, {
                        frame: TOTAL_FRAMES - 1,
                        ease: 'none',
                        duration: 0.92,
                        onUpdate: () => {
                            updateTargetFrame(frameProxy.frame);
                        }
                    }, 0);

                    // Os 4 cards informativos surgem em sequência fluida durante a vestimenta do jaleco
                    const card1 = document.getElementById('scrolly-card-1');
                    const card2 = document.getElementById('scrolly-card-2');
                    const card3 = document.getElementById('scrolly-card-3');
                    const card4 = document.getElementById('scrolly-card-4');

                    if (card1) {
                        coatTl.fromTo(card1,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card1.classList.add('scrolly-pillar-active'), onReverseComplete: () => card1.classList.remove('scrolly-pillar-active') },
                            0.08
                        );
                    }
                    if (card2) {
                        coatTl.fromTo(card2,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card2.classList.add('scrolly-pillar-active'), onReverseComplete: () => card2.classList.remove('scrolly-pillar-active') },
                            0.28
                        );
                    }
                    if (card3) {
                        coatTl.fromTo(card3,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card3.classList.add('scrolly-pillar-active'), onReverseComplete: () => card3.classList.remove('scrolly-pillar-active') },
                            0.48
                        );
                    }
                    if (card4) {
                        coatTl.fromTo(card4,
                            { y: 24, scale: 0.94, opacity: 0 },
                            { y: 0, scale: 1, opacity: 1, ease: 'back.out(1.2)', duration: 0.18, onStart: () => card4.classList.add('scrolly-pillar-active'), onReverseComplete: () => card4.classList.remove('scrolly-pillar-active') },
                            0.68
                        );
                    }

                    // Respiro final (0.92 -> 1.00) exibindo o médico completo antes de despinar para #vagas
                    coatTl.to({}, { duration: 0.08 }, 0.92);

                    window.addEventListener('load', () => {
                        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
                    }, { once: true });
                }

});
