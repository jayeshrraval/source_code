import { gitaData } from '../data/gitaData';

// ============================================================================
// 🌟 THE ULTIMATE GITA DICTIONARY (1000+ SCENARIOS)
// ============================================================================

const topicMappings: Record<string, string[]> = {
  
  // ------------------------------------------------------------------
  // 😡 ૧. ગુસ્સો, દુશ્મનાવટ અને ઝઘડા
  // ------------------------------------------------------------------
  "gusso": ["anger", "krodh", "hell", "destruction"],
  "gussa": ["anger", "krodh"],
  "khij": ["anger", "irritation", "mind"],
  "magaj": ["anger", "mind", "control"],
  "lohi ukale": ["anger", "passion"],
  "badlo": ["revenge", "anger", "enemy"],
  "dushman": ["enemy", "hate", "samabhav", "equality"],
  "virodhi": ["enemy", "hate"],
  "ladai": ["fight", "conflict", "arjuna", "war"],
  "jhagdo": ["conflict", "peace"],
  "maramari": ["violence", "anger"],
  "apman": ["insult", "honor", "equanimity"],
  "insult": ["honor", "equanimity", "pride"],
  "ninda": ["criticism", "equanimity"],
  "hate": ["hatred", "love", "unity"],
  "nafrat": ["hatred", "enemy"],
  "irritate": ["anger", "tolerance"],
  "sahanshakti": ["tolerance", "patience"],
  "sahan": ["tolerance", "endurance"],

  // ------------------------------------------------------------------
  // 😰 ૨. ડર, ચિંતા અને ભવિષ્ય
  // ------------------------------------------------------------------
  "dar": ["fear", "death", "protection", "abhayam"],
  "bik": ["fear", "protection"],
  "bhay": ["fear", "courage"],
  "chinta": ["worry", "anxiety", "surrender", "grief"],
  "tension": ["anxiety", "stress", "peace"],
  "stress": ["anxiety", "meditation", "peace"],
  "gabhrat": ["panic", "fear", "weakness"],
  "fafdhat": ["fear", "trembling"],
  "future": ["future", "present", "result"],
  "bhavishya": ["future", "destiny"],
  "su thase": ["worry", "future", "surrender"],
  "risk": ["fear", "action"],
  "insecure": ["protection", "faith"],
  "asuraksha": ["protection", "god"],
  "overthinking": ["mind", "control", "meditation"],
  "vicharo": ["thoughts", "mind"],

  // ------------------------------------------------------------------
  // 😔 ૩. દુઃખ, હતાશા અને ડિપ્રેશન
  // ------------------------------------------------------------------
  "dukh": ["sorrow", "grief", "suffering", "misery"],
  "pida": ["pain", "suffering"],
  "dard": ["pain", "body", "soul"],
  "radvu": ["cry", "grief", "weakness"],
  "rovu": ["cry", "grief"],
  "ansoo": ["grief", "emotion"],
  "udas": ["sadness", "depression", "despondency"],
  "nirasha": ["despair", "hope"],
  "hatasha": ["despair", "depression"],
  "mood": ["mind", "happiness", "grief"],
  "lonely": ["solitude", "yoga", "friend"],
  "eklu": ["solitude", "god", "companion"],
  "eklata": ["solitude", "devotion"],
  "suicide": ["soul", "death", "eternal", "body"],
  "marvu": ["death", "soul", "kill"],
  "jindgi": ["life", "duty", "purpose"],
  "kantalo": ["boredom", "duty", "tamasic"],

  // ------------------------------------------------------------------
  // ❤️ ૪. પ્રેમ, બ્રેકઅપ અને સંબંધો
  // ------------------------------------------------------------------
  "dil tuti": ["endurance", "winter", "summer", "temporary"],
  "dil": ["heart", "emotion"],
  "breakup": ["grief", "endurance", "attachment"],
  "dhokho": ["betrayal", "trust", "karma"],
  "viswasghat": ["betrayal", "trust"],
  "prem": ["love", "devotion", "lust", "affection"],
  "love": ["devotion", "lust", "love"],
  "pyar": ["love", "devotion"],
  "lagna": ["marriage", "lust", "duty"],
  "marriage": ["duty", "family"],
  "partner": ["friend", "relationship"],
  "pati": ["duty", "husband"],
  "patni": ["duty", "wife"],
  "sex": ["lust", "desire", "hell"],
  "vasana": ["lust", "desire", "enemy"],
  "kaam": ["lust", "desire"],
  "attraction": ["lust", "delusion"],
  "akarshan": ["lust", "maya"],
  "moh": ["delusion", "attachment", "illusion"],
  "asakti": ["attachment", "bondage"],
  "sambandh": ["relationship", "detached"],

  // ------------------------------------------------------------------
  // 💰 ૫. પૈસા, કરિયર અને લોભ
  // ------------------------------------------------------------------
  "paisa": ["money", "greed", "wealth", "arth"],
  "money": ["wealth", "greed"],
  "rupiya": ["money", "wealth"],
  "dhan": ["wealth", "charity"],
  "sampatti": ["wealth", "possession"],
  "lalach": ["greed", "hell", "desire"],
  "lobh": ["greed", "enemy"],
  "garib": ["poverty", "contentment"],
  "amir": ["rich", "pride", "charity"],
  "loan": ["debt", "worry"],
  "karaj": ["debt", "worry"],
  "dhandho": ["business", "work", "profit"],
  "business": ["work", "trade"],
  "job": ["job", "work", "duty", "service"],
  "naukri": ["service", "duty"],
  "interview": ["fear", "action", "result"],
  "office": ["work", "environment"],
  "boss": ["leader", "respect"],
  "target": ["goal", "action"],
  "success": ["success", "failure", "equanimity"],
  "safalta": ["success", "karma"],

  // ------------------------------------------------------------------
  // 📉 ૬. નિષ્ફળતા અને હાર
  // ------------------------------------------------------------------
  "fail": ["failure", "success", "equanimity"],
  "napas": ["failure", "learning"],
  "nishfal": ["failure", "effort"],
  "haar": ["defeat", "victory", "equanimity"],
  "parajay": ["defeat", "victory"],
  "loser": ["weakness", "strength"],
  "nuksan": ["loss", "gain"],
  "khot": ["loss", "business"],
  "barbad": ["ruin", "hope"],
  "payaamal": ["destruction", "rise"],
  "bhul": ["mistake", "forgiveness"],
  "galti": ["sin", "correction"],

  // ------------------------------------------------------------------
  // 🤔 ૭. મૂંઝવણ અને નિર્ણય
  // ------------------------------------------------------------------
  "confuse": ["confusion", "doubt", "delusion"],
  "munjvan": ["dilemma", "guidance"],
  "su karu": ["decision", "action", "duty", "surrender"],
  "shu karu": ["decision", "guidance"],
  "rasto": ["path", "guidance", "guru"],
  "marg": ["path", "knowledge"],
  "decision": ["intellect", "buddhi"],
  "nirnay": ["intellect", "resolve"],
  "doubt": ["doubt", "faith", "knowledge"],
  "shanka": ["doubt", "trust"],
  "result": ["fruit", "karma", "action"],
  "fal": ["fruit", "expectation"],
  "naseeb": ["destiny", "karma"],
  "kismat": ["destiny", "effort"],
  "luck": ["destiny", "effort"],

  // ------------------------------------------------------------------
  // 🧘 ૮. આધ્યાત્મિક અને ધર્મ
  // ------------------------------------------------------------------
  "bhagwan": ["god", "krishna", "supreme"],
  "god": ["ishwar", "paramatma"],
  "krishna": ["krishna", "friend", "guide"],
  "atma": ["soul", "eternal", "body"],
  "soul": ["self", "imperishable"],
  "mrutyu": ["death", "rebirth", "truth"],
  "death": ["end", "change"],
  "swarg": ["heaven", "temporary"],
  "narak": ["hell", "sin"],
  "pap": ["sin", "ignorance"],
  "punya": ["merit", "virtue"],
  "dharma": ["duty", "righteousness"],
  "adharm": ["unrighteousness", "evil"],
  "bhakti": ["devotion", "love", "surrender"],
  "puja": ["worship", "offering"],
  "dhyan": ["meditation", "focus"],
  "meditation": ["peace", "mind"],
  "yoga": ["union", "discipline"],
  "shanti": ["peace", "satisfaction"],
  "moksh": ["liberation", "freedom"],
  "guru": ["teacher", "knowledge"],
  "gyan": ["knowledge", "wisdom"],

  // ------------------------------------------------------------------
  // 🛌 ૯. આળસ, ઊંઘ અને ખોરાક
  // ------------------------------------------------------------------
  "alas": ["laziness", "tamasic", "action"],
  "lazy": ["laziness", "procrastination"],
  "ungh": ["sleep", "tamasic"],
  "sleep": ["rest", "tamasic"],
  "thak": ["tiredness", "body"],
  "bored": ["boredom", "interest"],
  "khavanu": ["food", "diet", "sattvic"],
  "food": ["food", "body"],
  "bukh": ["hunger", "control"],
  "diet": ["moderation", "yukta"],
  "health": ["body", "temple"],
  "sharir": ["body", "field"],
  "bimari": ["disease", "suffering", "body"],
  "rog": ["disease", "pain"],
  "daru": ["alcohol", "tamasic", "sin"],
  "vyasan": ["addiction", "control"],
  "mobile": ["distraction", "mind"],
  "addiction": ["attachment", "senses"],

  // ------------------------------------------------------------------
  // 🧠 ૧૦. મન, અહંકાર અને ગુણો
  // ------------------------------------------------------------------
  "man": ["mind", "friend", "enemy"],
  "mind": ["restless", "control"],
  "bhatke": ["wandering", "focus"],
  "focus": ["concentration", "practice"],
  "ahankar": ["ego", "pride", "doer"],
  "ego": ["identity", "ignorance"],
  "abhiman": ["pride", "fall"],
  "ghamand": ["arrogance", "demonic"],
  "irsha": ["jealousy", "envy"],
  "adekhai": ["envy", "contentment"],
  "saty": ["truth", "speech"],
  "juth": ["lie", "sin"],
  "daya": ["compassion", "virtue"],
  "daan": ["charity", "gift"],
  "tapasya": ["austerity", "discipline"],
  "pavitra": ["purity", "cleanliness"]
};

// ============================================================================
// 🔍 THE DEEP SEARCH ENGINE (WEIGHTED ALGORITHM)
// ============================================================================

// ટેક્સ્ટને સાફ કરવા માટેનું ફંક્શન
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[?,.!]/g, "") // ચિહ્નો કાઢો
    .split(" ")
    .filter(word => word.length > 1); // એક અક્ષરના શબ્દો કાઢો
};

export const findBestShlokas = (userInput: string) => {
  // ૧. યુઝરના વાક્યને તોડો
  const userWords = tokenize(userInput);
  const fullUserQuery = userInput.toLowerCase();
  
  // ૨. ડીપ સર્ચ: સમાનાર્થી શબ્દો શોધો (Synonym Expansion)
  let expandedQuery: string[] = [...userWords];
  
  userWords.forEach(word => {
    // A. જો યુઝરનો શબ્દ "કી" તરીકે હોય (દા.ત. "gusso")
    if (topicMappings[word]) {
      expandedQuery.push(...topicMappings[word]);
    }

    // B. જો યુઝરનો શબ્દ "વેલ્યુ" તરીકે હોય (દા.ત. "anger" લખે તો "gusso" પણ શોધવું જોઈએ)
    Object.keys(topicMappings).forEach(key => {
      if (topicMappings[key].includes(word)) {
        expandedQuery.push(key); // મેઈન કેટેગરી ઉમેરો
        expandedQuery.push(...topicMappings[key]); // તેના બીજા ભાઈ-ભાંડુ ઉમેરો
      }
    });
  });

  // ડુપ્લીકેટ શબ્દો કાઢી નાખો
  const uniqueSearchTerms = [...new Set(expandedQuery)];

  console.log("Deep Search Terms:", uniqueSearchTerms); 

  // ૩. સ્કોરિંગ સિસ્ટમ (Weighted Scoring)
  const scoredShlokas = gitaData.map((item) => {
    let score = 0;

    // A. કીવર્ડ મેચિંગ (સૌથી વધુ મહત્વ - 10 પોઈન્ટ્સ)
    // આ લૂપ ચેક કરશે કે શ્લોકના કીવર્ડ્સમાં આપણા સર્ચ ટર્મ્સ છે?
    item.keywords.forEach(keyword => {
      if (uniqueSearchTerms.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // B. અર્થમાં મેચિંગ (મધ્યમ મહત્વ - 5 પોઈન્ટ્સ)
    // શ્લોકના અર્થમાં કોઈ શબ્દ મેચ થાય છે?
    const meaningWords = tokenize(item.gujarati_meaning + " " + item.explanation);
    meaningWords.forEach(word => {
      if (uniqueSearchTerms.includes(word)) {
        score += 2; 
      }
    });

    // C. Exact Phrase Match (જેકપોટ - 20 પોઈન્ટ્સ)
    // જો યુઝરે લખેલું આખું વાક્ય ક્યાંક મેચ થાય
    if (item.explanation.toLowerCase().includes(fullUserQuery) || item.gujarati_meaning.toLowerCase().includes(fullUserQuery)) {
      score += 20;
    }

    return { ...item, score };
  });

  // ૪. સ્કોર પ્રમાણે સોર્ટ કરો (જેનો સ્કોર વધારે તે પહેલા)
  const results = scoredShlokas
    .filter(item => item.score > 0) // ઝીરો સ્કોર વાળા કાઢી નાખો
    .sort((a, b) => b.score - a.score); 

  // ટોપ ૩ રિઝલ્ટ આપો
  return results.slice(0, 3);
};