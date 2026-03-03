// ════════════════════════════════════════════════════════════
//  📝  CROSSWORD — बूझो तो जानें ?
//  प्रश्न नं. 965 से 1008 तक
//
//  Structure:
//  CROSSWORD.clues.across  → दायें से बायें (Right to Left)
//  CROSSWORD.clues.down    → ऊपर से नीचे   (Top to Bottom)
//
//  Each clue: { sno, clue, answer }
//  CROSSWORD.grid          → 2D array of the crossword layout
//                            null  = black/blocked cell
//                            ""    = empty white cell (to be filled)
//                            "X"   = filled cell (with answer letter)
// ════════════════════════════════════════════════════════════

const CROSSWORD = {

  // ── Clues ──────────────────────────────────────────────────

  clues: {

    // दायें से बायें (Across)
    across: [
      { sno: 1,  clue: "आत्मा से भिन्न पदार्थ जो ज्ञान में जानने में आते हैं",            answer: "" },
      { sno: 5,  clue: "आत्मा के एक शक्ति",                                                answer: "" },
      { sno: 8,  clue: "जिसके शरीर में भूत का प्रवेश हो गया हो",                          answer: "" },
      { sno: 9,  clue: "वर्तमान में यदि कहीं अध्यात्म है तो यहीं है",                     answer: "" },
      { sno: 11, clue: "प्रवर्तमान पर्याय के भवन रूप शक्ति",                              answer: "" },
      { sno: 12, clue: "मिथ्यादर्शन-ज्ञान-चरित्ररूप परिणमता हुआ जीव",                    answer: "" },
      { sno: 14, clue: "जीव को कर्मबंध का एकमात्र कारण",                                  answer: "" },
      { sno: 15, clue: "स्वभाव से अभेद/आत्मा की शक्ति",                                   answer: "" },
      { sno: 16, clue: "इसके बिना नयज्ञान अप्रयोजनभूत है",                                answer: "" },
      { sno: 18, clue: "शुद्ध सुवर्ण के समान",                                             answer: "" },
      { sno: 20, clue: "आत्मा का एक भाव/स्वरूप",                                          answer: "" },
      { sno: 22, clue: "स्वभाव/लक्षण/शक्ति",                                              answer: "" },
      { sno: 23, clue: "आचार्य देव ने इसे दिखाने का व्यवसाय किया है",                     answer: "" },
      { sno: 25, clue: "समुद्र की एक अवस्था",                                              answer: "" },
      { sno: 26, clue: "निश्चय नय में स्थित साधु",                                        answer: "" },
      { sno: 27, clue: "जीव और अजीव का एक स्वांग",                                        answer: "" },
      { sno: 29, clue: "उस रूप हो जाना/एक हो जाना",                                       answer: "" },
      { sno: 31, clue: "निमित्त की अपेक्षा कहलाता है",                                    answer: "" },
      { sno: 32, clue: "जो आत्मा को कर्म का कर्ता मानते हैं उन्हें इसकी प्राप्ति नहीं होती", answer: "" },
      { sno: 33, clue: "आत्मा में ज्ञान-दर्शन-चरित्र को बताने वाला नय",                  answer: "" },
    ],

    // ऊपर से नीचे (Down)
    down: [
      { sno: 1,  clue: "ये क्रमवर्ती होती हैं",                                                        answer: "" },
      { sno: 2,  clue: "ज्ञान में प्रतिभासित होने वाले पदार्थों का आकार",                             answer: "" },
      { sno: 3,  clue: "विभूत शक्ति के कारण प्राप्त आत्मा का विशेषण",                                answer: "" },
      { sno: 4,  clue: "प्रकट होना",                                                                   answer: "" },
      { sno: 5,  clue: "झलकना/प्रतिबिंबित होना",                                                      answer: "" },
      { sno: 6,  clue: "ग्रंथ/शुद्धात्मा",                                                            answer: "" },
      { sno: 7,  clue: "गाथाओं का छंद",                                                               answer: "" },
      { sno: 10, clue: "सामान्य गुण/आत्मा की शक्ति",                                                  answer: "" },
      { sno: 11, clue: "सच्चा स्वरूप/वास्तिक लाभ",                                                    answer: "" },
      { sno: 12, clue: "47 शक्तियों में से एक",                                                        answer: "" },
      { sno: 13, clue: "द्रव्य/विशेषों से रहित",                                                      answer: "" },
      { sno: 17, clue: "आत्मा एवं कर्म का सम्बन्ध",                                                   answer: "" },
      { sno: 18, clue: "इस दशा रूप आत्मा नहीं है",                                                    answer: "" },
      { sno: 19, clue: "समस्त विश्व के विशेषों को जाननेवाली आत्मज्ञानमयी शक्ति",                     answer: "" },
      { sno: 20, clue: "समयसार ग्रंथ का प्रतिपाद्य",                                                  answer: "" },
      { sno: 21, clue: "ग्रंथ में वर्णित स्वांग कहाँ प्रवेश करते हैं",                               answer: "" },
      { sno: 22, clue: "शुद्धनय द्वारा प्रदर्शित 5 भावों में से 1 भाव",                              answer: "" },
      { sno: 23, clue: "कथन मात्र/सत्य से दूर",                                                       answer: "" },
      { sno: 25, clue: "मोह को जीतने वाले",                                                           answer: "" },
      { sno: 28, clue: "मुनियों में श्रेष्ठ",                                                         answer: "" },
      { sno: 30, clue: "सिद्ध भाव को प्राप्त करने रूप शक्ति",                                        answer: "" },
      { sno: 33, clue: "वस्तुव गुण के कारण आत्मा का एक नाम",                                         answer: "" },
    ]
  },

  // ── Grid ───────────────────────────────────────────────────
  // 13 rows (r0–r12) × 20 columns (c0–c19)
  //
  // CELL KEY:
  //   null        → ⬛ B = black/blocked cell
  //   ""          → ⬜ W = white fillable cell
  //   { num: N }  → 🔢 numbered white cell where clue N starts
  //
  // Source pattern (W=white, B=black, N=numbered white):
  //  r0:  1  W  2  W  B  B  B  B  3  B  4  B  B  B  B  B  5  W  W  B
  //  r1:  W  B  W  B  B  6  B  B  7  W  W  W  B  8  W  W  W  B  B  B
  //  r2:  W  B  W  B  B  W  B  B  B  B  W  B  B  W  B  B  9  W  W  10
  //  r3:  B  11 W  W  W  W  B  B  12 W  W  13 W  B  B  B  W  B  B  W
  //  r4:  B  W  B  B  B  W  B  B  W  B  B  W  B  B  B  B  B  14 W  W
  //  r5:  15 W  W  B  16 W  W  17 W  B  B  W  B  18 W  W  W  B  B  B
  //  r6:  B  W  B  B  B  B  B  W  B  B  B  B  B  W  B  B  B  B  B  19
  //  r7:  B  B  B  B  B  B  B  W  B  20 W  B  B  W  B  21 B  B  B  W
  //  r8:  B  B  B  22 W  W  W  W  B  W  B  B  W  W  W  W  B  24 W  W
  //  r9:  25 W  W  W  B  B  B  26 W  W  W  B  W  B  B  W  B  B  B  W
  //  r10: W  B  B  27 W  28 B  B  B  B  B  B  W  B  29 W  W  30 B  B
  //  r11: 31 W  B  B  B  W  B  B  B  32 33 W  W  B  B  B  B  W  B  B
  //  r12: W  B  B  B  B  W  B  B  B  B  W  B  B  B  B  B  B  B  B  B
  //
  //              c0        c1        c2        c3        c4        c5        c6    c7    c8    c9    c10   c11   c12   c13   c14   c15   c16   c17   c18   c19

  grid: [
  /* r0  */ [ {num:1},  "",       {num:2},  "",       null,     null,     null, null, {num:3},null, {num:4},null, null, null, null, null, {num:5},"",  "",   null ],
  /* r1  */ [ "",       null,     "",       null,     null,     {num:6},  null, null, {num:7},"",  "",   "",   null, {num:8},"",  "",   "",   null, null, null ],
  /* r2  */ [ "",       null,     "",       null,     null,     "",       null, null, null, null, "",   null, null, "",   null, null, {num:9},"",  "",   {num:10} ],
  /* r3  */ [ null,     {num:11}, "",       "",       "",       "",       null, null, {num:12},"",  "",   {num:13},"", null, null, null, "",   null, null, ""   ],
  /* r4  */ [ null,     "",       null,     null,     null,     "",       null, null, "",   null, null, "",   null, null, null, null, null, {num:14},"",  ""   ],
  /* r5  */ [ {num:15}, "",       "",       null,     {num:16}, "",       "",   {num:17},"", null, null, "",   null, {num:18},"",  "",   "",   null, null, null ],
  /* r6  */ [ null,     "",       null,     null,     null,     null,     null, "",   null, null, null, null, null, "",   null, null, null, null, null, {num:19} ],
  /* r7  */ [ null,     null,     null,     null,     null,     null,     null, "",   null, {num:20},"",  null, null, "",   null, {num:21},null,null, null, ""   ],
  /* r8  */ [ null,     null,     null,     {num:22}, "",       "",       "",   "",   null, "",   null, null, "",   "",   "",   "",   null, {num:24},"",  ""   ],
  /* r9  */ [ {num:25}, "",       "",       "",       null,     null,     null, {num:26},"",  "",   "",   null, "",   null, null, "",   null, null, null, ""   ],
  /* r10 */ [ "",       null,     null,     {num:27}, "",       {num:28}, null, null, null, null, null, null, "",   null, {num:29},"",  "",   {num:30},null, null ],
  /* r11 */ [ {num:31}, "",       null,     null,     null,     "",       null, null, null, {num:32},{num:33},"",  "",   null, null, null, null, "",   null, null ],
  /* r12 */ [ "",       null,     null,     null,     null,     "",       null, null, null, null, "",   null, null, null, null, null, null, null, null, null ],
  ],

};
