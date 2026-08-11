import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import {
  getSessionId,
  createNewSession,
} from "../lib/session";
import {
  saveConversation,
  loadConversation,
  saveLanguage,
  loadLanguage,
} from "../lib/storage";
import ConsentModal from "../components/ConsentModal";
import ShareConversation from "../components/ShareConversation";
import ReactMarkdown from "react-markdown";

export const MENU_CARDS = [
  {
    id: "quiz",
    emoji: "🧠",
    en: "Start Fukushima Chat",
    ja: "チャットを始める",
    ar: "ابدأ الدردشة",
  },
  {
    id: "general",
    emoji: "📚",
    en: "Fukushima Information",
    ja: "福島について学ぶ",
    ar: "تعرف على فوكوشيما",
  },
  {
    id: "nuclear",
    emoji: "☢️",
    en: "Nuclear Accident",
    ja: "原発事故",
    ar: "الحادث النووي",
  },
  {
    id: "ocean",
    emoji: "🌊",
    en: "Ocean Situation",
    ja: "海洋の状況",
    ar: "وضع المحيط",
 
  },
];

const LANGUAGES = {
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  ar: { label: "العربية", flag: "🇦🇪", dir: "rtl" },
  ja: { label: "日本語", flag: "🇯🇵", dir: "ltr" },
};

export const UI_TEXT = {
  en: {
    title: "Daiichi",
    subtitle: "Fukushima Myth-Buster Chatbot",
    OpenChatMessage: "This is the main page of Daiichi Chatbot with four menu options to start learning. The upper left will open AI chatbot (with limited requests) and the other three menu options give you facts with sources about Fukushima Information, Nuclear Accident and Ocean Situation.",
    typeMessage: "Type your answer...",
    send: "Send",
    powered: "Built at IER, Fukushima University",
    by: "By Abdulrahman Alblooshi, Yuliia Bezhenar and Maksym Gusyev",
    back: "← Menu",
    learnTitle: "Learn about Fukushima",
    learnClose: "Close",
    welcomeTitle: "Welcome!",
    welcomeCaption: "Please take the survey first before start using the Daiichi Chatbot:",
    welcomeCheckbox: "I confirm that I finished a survey and want to continue.",
    welcomeSubtitle: "*Make sure to complete the survey. After pressing this button you will be switched to main chatbot screen and will not be able to take the survey anymore.",
    welcomeButton: "Proceed to Daiichi",
    urltex: "Or open the survey via this URL",
    surveyTitle: "Share your experience",
    surveyCaption: "We would be grateful if you could answer a few questions first and share your experience and impressions of using the chatbot.",
    surveyContinue: "Continue",
    surveySubmitting: "Submitting...",
  },
  ar: {
    title: "دايتشي",
    subtitle: "روبوت تصحيح خرافات فوكوشيما",
    OpenChatMessage: "افتح روبوت الدردشة لبدء التعلم:",
    typeMessage: "اكتب إجابتك...",
    send: "إرسال",
    powered: "تم بناؤه في IER، جامعة فوكوشيما",
    by: "بواسطة عبدالرحمن البلوشي، يوليا بيجينار وماكسيم غوسييف",
    back: "→ القائمة",
    learnTitle: "تعرّف على فوكوشيما",
    learnClose: "إغلاق",
    welcomeTitle: "مرحباً!",
    welcomeCaption: "يرجى تعبئة الاستبيان أولًا قبل بدء استخدام روبوت الدردشة Daiichi Fukushima Myth-Buster:",
    welcomeCheckbox: "أؤكد أنني أجريت استطلاعاً وأرغب في المتابعة.",
    welcomeSubtitle: "بعد الضغط على هذا الزر، سيتم نقلك إلى الشاشة الرئيسية لروبوت المحادثة ولن تتمكن من إجراء الاستبيان بعد الآن.",
    welcomeButton: "توجه إلى داييتشي",
    urltex: "أو افتح الاستبيان عبر هذا الرابط.",
    surveyTitle: "شارك تجربتك",
    surveyCaption: "سنكون ممتنين لو تكرمت بالإجابة عن بعض الأسئلة أولاً ومشاركة تجربتك وانطباعاتك حول استخدام روبوت الدردشة.",
    surveyContinue: "متابعة",
    surveySubmitting: "جارٍ الإرسال...",
  },
  ja: {
    title: "ダイイチ",
    subtitle: "福島の誤解を正すチャットボット",
    OpenChatMessage: "チャットボットを開いて学び始めよう：",
    typeMessage: "回答を入力...",
    send: "送信",
    powered: "福島大学IERで開発",
    by: "Abdulrahman Alblooshi、Yuliia Bezhenar と Maksym Gusyev 作成",
    back: "← メニュー",
    learnTitle: "福島について学ぶ",
    learnClose: "閉じる",
    welcomeTitle: "いらっしゃいませ！",
    welcomeCaption: "「ダイイチ」福島神話バスター・チャットボットを開始する前に、まずアンケートにご回答ください。",
    welcomeCheckbox: "アンケートに回答済みであり、継続を希望することを確認します。",
    welcomeSubtitle: "このボタンを押すと、メインのチャットボット画面に切り替わり、アンケートには回答できなくなります。",
    welcomeButton: "ダイイチへお進みください。",
    urltex: "または、こちらのURLからアンケートを開いてください。",
    surveyTitle: "ご感想をお聞かせください",
    surveyCaption: "まずいくつかの質問にお答えいただき、チャットボットのご利用に関するご感想やご意見をお聞かせいただけますと幸いです。",
    surveyContinue: "続ける",
    surveySubmitting: "送信中...",
  },
};

const FACT_SHEETS = {
  nuclear: {
    en: [
      {
        emoji: "☢️", title: "What Happened?",
        text: "On March 11 2011 the tsunami flooding destroyed all cooling equipment for the Unit 1-4 nuclear reactors of Fukushima Daiichi Nuclear Power Plant (FDNPP) leading to the major nuclear accident.",
        reference: "World Nuclear Association", refURL: "https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident#inside-the-fukushima-daiichi-reactors",
      },
      {
        emoji: "😵", title: "Nuclear Accident Impact",
        text: "The FDNPP-accident affected area was evacuated with radiation levels above 20 mSv per year (or above  2 μSv per hour) without any fatalities due to acute radiation compared with tsunami, earthquake and evacuation-related causes.",
        reference: "UNSCEAR", refURL: "https://www.unscear.org/unscear/en/areas-of-work/fukushima.html",
      },
      {
        emoji: "🍚", title: "Food Safety",
        text: "On April 1st 2011, Japan's food radiation limit was lowered to 100 Bq/kg, which 12 times lower than US and EU, and Fukushima food products has been strictly confirming radiation levels below the 100 Bq/kg limit by the Prefectural Government",
        reference: "Fukumegu", refURL: "https://fukumegu.org/ok/contentsV2/",
      },
      {
        emoji: "🏘️", title: "Decontamination Efforts",
        text: "Since the start of decontamination efforts in Fukushima Prefecture, the maximum emergency evacuation area of 1150 square km in August 2011 was reduced to 371 square km in April 2017.",
        reference: "Fukushima Prefecture Revitalization Portal", refURL: "https://www.pref.fukushima.lg.jp/site/portal-english/en03-08.html",
      },
      {
        emoji: "📉", title: "Current Radiation Levels",
        text: "Whole-area decontamination was completed by March 2018 except the Difficult-to-Return Zone, which has an area of 309 square km in 2026 and air radiation dose rate of 4.95 μSv/h in Okuma town on 28 Jul 2026, while other areas of Fukushima city and coastal towns have air radiation dose rate less than 0.1 Sv/h.",
        reference: "Japan Radiation Map", refURL: "https://jciv.iidj.net/map/",
      },
    ],
    ar: [
      {
        emoji: "☢️", title: "ماذا حدث؟",
        text: "في 11 مارس 2011، دمّر فيضان التسونامي جميع معدات التبريد الخاصة بالمفاعلات من الوحدة 1 إلى 4 في محطة فوكوشيما دايتشي النووية (FDNPP)، مما أدى إلى وقوع الحادث النووي الكبير.",
        reference: "World Nuclear Association", refURL: "https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident#inside-the-fukushima-daiichi-reactors",
      },
      {
        emoji: "😵", title: "تأثير الحادث النووي",
        text: "تم إخلاء المنطقة المتضررة من حادث FDNPP التي تجاوزت فيها مستويات الإشعاع 20 ميلي سيفرت سنوياً (أو أكثر من 2 ميكروسيفرت في الساعة)، دون أي وفيات ناجمة عن الإشعاع الحاد، مقارنة بالوفيات الناجمة عن التسونامي والزلزال وعملية الإخلاء.",
        reference: "UNSCEAR", refURL: "https://www.unscear.org/unscear/en/areas-of-work/fukushima.html",
      },
      {
        emoji: "🍚", title: "سلامة الغذاء",
        text: "في الأول من أبريل 2011، خفّضت اليابان الحد الأقصى المسموح به لمستويات الإشعاع في الأغذية إلى 100 بيكريل/كجم —وهو مستوى يقل بمقدار 12 ضعفاً عن المعايير المطبقة في الولايات المتحدة والاتحاد الأوروبي— حيث تضمن حكومة المحافظة التزام المنتجات الغذائية القادمة من فوكوشيما بصرامة بمستويات إشعاع تقل عن هذا الحد.",
        reference: "Fukumegu", refURL: "https://fukumegu.org/ok/contentsV2/",
      },
      {
        emoji: "🏘️", title: "جهود إزالة التلوث",
        text: "منذ بدء جهود إزالة التلوث في محافظة فوكوشيما، انخفضت أقصى مساحة لمنطقة الإخلاء الطارئ من 1150 كم² في أغسطس 2011 إلى 371 كم² في أبريل 2017.",
        reference: "Fukushima Prefecture Revitalization Portal", refURL: "https://www.pref.fukushima.lg.jp/site/portal-english/en03-08.html",
      },
      {
        emoji: "📉", title: "مستويات الإشعاع الحالية",
        text: "اكتملت إزالة التلوث في كامل المنطقة بحلول مارس 2018، باستثناء منطقة يصعب العودة إليها، والتي تبلغ مساحتها 309 كم² في عام 2026 ومعدل جرعة الإشعاع الجوي فيها 4.95 ميكروسيفرت/ساعة في بلدة أوكوما بتاريخ 28 يوليو 2026، بينما تقل معدلات جرعة الإشعاع الجوي في مناطق أخرى من مدينة فوكوشيما والبلدات الساحلية عن 0.1 سيفرت/ساعة.",
        reference: "Japan Radiation Map", refURL: "https://jciv.iidj.net/map/",
      },
    ],
    ja: [
      {
        emoji: "☢️", title: "何が起きた？",
        text: "2011年3月11日、津波の浸水により福島第一原子力発電所（FDNPP）の1〜4号機の冷却設備がすべて破壊され、大規模な原発事故につながりました。",
        reference: "World Nuclear Association", refURL: "https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident#inside-the-fukushima-daiichi-reactors",
      },
      {
        emoji: "😵", title: "原発事故の影響",
        text: "FDNPP事故の影響を受けた地域は、年間20mSv（時間あたり2μSv以上）を超える放射線量で避難対象となりましたが、急性放射線による死者はゼロで、津波・地震・避難に伴う死者とは対照的でした。",
        reference: "UNSCEAR", refURL: "https://www.unscear.org/unscear/en/areas-of-work/fukushima.html",
      },
      {
        emoji: "🍚", title: "食品の安全性",
        text: "2011年4月1日、日本の食品中の放射性物質の基準値は100Bq/kgに引き下げられました。これは米国やEUの基準値と比べて12倍も厳しい水準であり、福島県産の食品については、県によって放射性物質の濃度がこの100Bq/kgという基準値を下回っていることが厳格に確認されています。",
        reference: "Fukumegu", refURL: "https://fukumegu.org/ok/contentsV2/",
      },
      {
        emoji: "🏘️", title: "除染活動",
        text: "福島県での除染活動の開始以降、最大で1,150平方キロメートルあった緊急避難区域は、2017年4月には371平方キロメートルまで縮小しました。",
        reference: "Fukushima Prefecture Revitalization Portal", refURL: "https://www.pref.fukushima.lg.jp/site/portal-english/en03-08.html",
      },
      {
        emoji: "📉", title: "現在の放射線レベル",
        text: "2018年3月までに帰還困難区域を除く全域で除染が完了しました。帰還困難区域は2026年時点で309平方キロメートルあり、2026年7月28日の大熊町の空間放射線量率は4.95μSv/hですが、福島市や沿岸の他の地域では0.1Sv/h未満となっています。",
        reference: "Japan Radiation Map", refURL: "https://jciv.iidj.net/map/",
      },
    ],
  },
  ocean: {
    en: [
      {
        emoji: "⚠️", title: "Water Contamination",
        text: "The excessive amount of contaminated water was generated due to groundwater inflow into Fukushima Daiichi damaged reactor buildings, which required cooling of melted nuclear fuel, and it was stored in many surface tanks at the FDNPP site.",
        reference: "Agency for Natural Resources and Energy (METI)", refURL: "https://www.enecho.meti.go.jp/en/category/special/article/detail_143.html",
      },
      {
        emoji: "🧪", title: "Cleaning the Water",
        text: "The stored contaminated water was treated by the Advanced Liquid Processing System (ALPS) to remove 62 radionuclides below ocean discharge threshold except tritium, which remains because it's part of the water molecule.",
        reference: "Ministry of Environment", refURL: "https://www.env.go.jp/en/chemi/rhm/basic-info/1st/06-03-05.html",
      },
      {
        emoji: "💧", title: "What is tritium?",
        text: "Tritium (H-3 or T) radionuclide, which is a nuclide that is unstable with a half-life of 12.32 years, is </br>A) Naturally and artificially produced; B) Beta emitter; C) Forms tritiated water (HTO); D) Discharge from Nuclear Power Plants.",
        reference: "TEPCO", refURL: "https://www.tepco.co.jp/en/decommission/progress/watertreatment/faq/index-e.html",
      },
      {
        emoji: "🌍", title: "Water Monitoring",
        text: "The ALPS-treated water discharge is diluted by ocean water to have tritium concentrations below 1,500 Bq/L, which is 1/40 of the regulatory limit and 1/7 of WHO drinking water guideline (10,000 Bq/L), to be independently monitored by the IAEA.",
        reference: "IAEA", refURL: "https://www.iaea.org/topics/response/fukushima-daiichi-nuclear-accident/fukushima-daiichi-alps-treated-water-discharge",
      },
      {
        emoji: "🖥️", title: "Ocean tritium modeling",
        text: "Anthropogenic tritium releases from the FDNPP site to the Pacific ocean were modeled by the ocean general circulation model COCO4.9 demonstrating anthropogenic tritium levels below detection levels except the release point",
        reference: "Cauqouin et al., 2025", refURL: "10.1016/j.marpolbul.2025.118294",
      },
    ],
    ar: [
      {
        emoji: "⚠️", title: "تلوث المياه",
        text: "نتجت كمية كبيرة من المياه الملوثة عن تسرب المياه الجوفية إلى مباني المفاعلات المتضررة في فوكوشيما دايتشي، التي تطلبت تبريد الوقود النووي المنصهر، وتم تخزينها في العديد من الخزانات السطحية داخل موقع المحطة.",
        reference: "Agency for Natural Resources and Energy (METI)", refURL: "https://www.enecho.meti.go.jp/en/category/special/article/detail_143.html",
      },
      {
        emoji: "🧪", title: "تنقية المياه",
        text: "تمت معالجة المياه الملوثة المخزنة بواسطة نظام المعالجة السائلة المتقدم (ALPS) لإزالة 62 نوعاً من النويدات المشعة إلى ما دون حد التصريف في المحيط، باستثناء التريتيوم الذي يبقى لأنه جزء من جزيء الماء نفسه.",
        reference: "Ministry of Environment", refURL: "https://www.env.go.jp/en/chemi/rhm/basic-info/1st/06-03-05.html",
      },
      {
        emoji: "💧", title: "ما هو التريتيوم؟",
        text: "التريتيوم (H-3 أو T) هو نويدة مشعة غير مستقرة بعمر نصف يبلغ 12.32 سنة، وهو: </br>أ) ينتج طبيعياً واصطناعياً؛ ب) باعث لجسيمات بيتا؛ ج) يُكوّن ماءً مترتناً (HTO)؛ د) يُصرَّف من محطات الطاقة النووية.",
        reference: "TEPCO", refURL: "https://www.tepco.co.jp/en/decommission/progress/watertreatment/faq/index-e.html",
      },
      {
        emoji: "🌍", title: "مراقبة المياه",
        text: "يُخفَّف تصريف المياه المعالجة بنظام ALPS بمياه المحيط بحيث تصل تركيزات التريتيوم إلى أقل من 1,500 بيكريل/لتر، وهو ما يعادل 1/40 من الحد التنظيمي و1/7 من إرشادات منظمة الصحة العالمية لمياه الشرب (10,000 بيكريل/لتر)، وتخضع العملية لمراقبة مستقلة من الوكالة الدولية للطاقة الذرية.",
        reference: "IAEA", refURL: "https://www.iaea.org/topics/response/fukushima-daiichi-nuclear-accident/fukushima-daiichi-alps-treated-water-discharge",
      },
      {
        emoji: "🖥️", title: "نمذجة التريتيوم في المحيطات",
        text: "تمت محاكاة انبعاثات التريتيوم الناتجة عن الأنشطة البشرية من موقع محطة فوكوشيما دايتشي للطاقة النووية إلى المحيط الهادئ باستخدام نموذج الدوران العام للمحيطات COCO4.9، مما أظهر مستويات التريتيوم الناتجة عن الأنشطة البشرية أقل من مستويات الكشف باستثناء نقطة الانبعاث.",
        reference: "Cauqouin et al., 2025", refURL: "10.1016/j.marpolbul.2025.118294",
      },
    ],
    ja: [
      {
        emoji: "⚠️", title: "汚染水の発生",
        text: "溶融した核燃料を冷却する必要があったため、地下水が福島第一の損傷した原子炉建屋に流入し、大量の汚染水が発生し、敷地内の多数の地上タンクに保管されてきました。",
        reference: "Agency for Natural Resources and Energy (METI)", refURL: "https://www.enecho.meti.go.jp/en/category/special/article/detail_143.html",
      },
      {
        emoji: "🧪", title: "水の浄化処理",
        text: "貯蔵された汚染水は多核種除去設備（ALPS）で処理され、62種類の放射性核種が海洋放出基準値以下まで除去されますが、水分子の一部であるトリチウムだけは除去されずに残ります。",
        reference: "Ministry of Environment", refURL: "https://www.env.go.jp/en/chemi/rhm/basic-info/1st/06-03-05.html",
      },
      {
        emoji: "💧", title: "トリチウムとは？",
        text: "トリチウム（H-3またはT）は半減期12.32年の不安定な核種であり、</br>A) 自然にも人工的にも生成される、B) ベータ線を放出する、C) トリチウム水（HTO）を形成する、D) 原子力発電所から放出される、という特徴を持っています。",
        reference: "TEPCO", refURL: "https://www.tepco.co.jp/en/decommission/progress/watertreatment/faq/index-e.html",
      },
      {
        emoji: "🌍", title: "水質モニタリング",
        text: "ALPS処理水は海水で希釈され、トリチウム濃度は1,500 Bq/L未満に抑えられます。これは規制基準値の1/40、WHO飲料水ガイドライン（10,000 Bq/L）の1/7に相当し、IAEAによる独立した監視が行われています。",
        reference: "IAEA", refURL: "https://www.iaea.org/topics/response/fukushima-daiichi-nuclear-accident/fukushima-daiichi-alps-treated-water-discharge",
      },
      {
        emoji: "🖥️", title: "海洋におけるトリチウムのモデリング",
        text: "海洋大循環モデルCOCO4.9を用いて、福島第一原子力発電所から太平洋への人為起源トリチウムの放出をモデル化した結果、放出点を除き、人為起源トリチウムの濃度は検出限界未満であることが示された。",
        reference: "Cauqouin et al., 2025", refURL: "10.1016/j.marpolbul.2025.118294",
      },
    ],
  },
  general: {
    en: [
      {
        emoji: "🤔", title: "Wait… Which Fukushima?",
        text: "There is Fukushima Prefecture with Fukushima City as its capital located in the central part of the prefecture and and two Fukushima Nuclear Power Plants (Daiichi and Daini) located at the Pacific coast.",
        reference: "Fukushima travel", refURL: "https://fukushima.travel/",
      },
      {
        emoji: "🗾", title: "Fukushima Prefecture",
        text: "As the 3rd largest in Japan, Fukushima Prefecture has an area of 13783.9 square kilometers with three regions: Hamadori coastal area (21% of total), Nakadori central area (39% of total), and Aizu (40% of total).",
        reference: "Fukushima Prefecture Revitalization Portal", refURL: "https://www.pref.fukushima.lg.jp/site/portal-english/en05-01.html",
      },
      {
        emoji: "🍑", title: "Famous Products",
        text: "Fukushima Prefecture is famous for its agricultural products such as peaches,  rice, Japanese sake, and beef and each of three regions has unique activities.",
        reference: "JanapGov", refURL: "https://www.japan.go.jp/kizuna/2022/02/the_flavor_of_fukushima.html",
      },
      {
        emoji: "♨️", title: "Famous Attractions",
        text: "Fukushima city, which is located in the central part, has three famous hot springs; Fukushima coastal area has many fisherman communities and swimming places.",
        reference: "Fukushima City Guide", refURL: "https://www.f-kankou.jp/en/onsen/",
      },
      {
        emoji: "🌊", title: "Great East Japan Earthquake",
        text: "On March 11 2011 at 14:46 JST, the largest earthquake of 9.0 magnitude occurred north of Fukushima Prefecture triggering a massive tsunami along the Pacific coast of northern Tohoku region with human casualties of  19,729 dead and 2,559 missing persons.",
        reference: "Reconstruction Agency", refURL: "https://www.reconstruction.go.jp/english/topics/GEJE/",
      },
    ],
    ar: [
      {
        emoji: "🤔", title: "لحظة... أي فوكوشيما؟",
        text: "توجد محافظة فوكوشيما وعاصمتها مدينة فوكوشيما الواقعة في الجزء الأوسط من المحافظة، بالإضافة إلى محطتي طاقة نوويتين تحملان اسم فوكوشيما (دايتشي ودايني) تقعان على ساحل المحيط الهادئ.",
        reference: "Fukushima travel", refURL: "https://fukushima.travel/",
      },
      {
        emoji: "🗾", title: "محافظة فوكوشيما",
        text: "بصفتها ثالث أكبر محافظة في اليابان، تبلغ مساحة محافظة فوكوشيما 13,783.9 كم² وتضم ثلاث مناطق: هامادوري الساحلية (21% من المساحة)، ناكادوري الوسطى (39%)، وآيزو (40%).",
        reference: "Fukushima Prefecture Revitalization Portal", refURL: "https://www.pref.fukushima.lg.jp/site/portal-english/en05-01.html",
      },
      {
        emoji: "🍑", title: "منتجات مشهورة",
        text: "تشتهر محافظة فوكوشيما بمنتجاتها الزراعية مثل الخوخ والأرز والساكي الياباني ولحم البقر، ولكل من المناطق الثلاث أنشطتها المميزة الخاصة بها.",
        reference: "JanapGov", refURL: "https://www.japan.go.jp/kizuna/2022/02/the_flavor_of_fukushima.html",
      },
      {
        emoji: "♨️", title: "معالم مشهورة",
        text: "تضم مدينة فوكوشيما، الواقعة في الجزء الأوسط، ثلاثة ينابيع حارة مشهورة؛ بينما تضم المنطقة الساحلية العديد من مجتمعات الصيادين وأماكن السباحة.",
        reference: "Fukushima City Guide", refURL: "https://www.f-kankou.jp/en/onsen/",
      },
      {
        emoji: "🌊", title: "زلزال شرق اليابان الكبير",
        text: "في 11 مارس 2011 الساعة 14:46 بتوقيت اليابان، وقع أقوى زلزال بقوة 9.0 درجات شمال محافظة فوكوشيما، مما تسبب في تسونامي هائل على طول الساحل الهادئ لمنطقة توهوكو الشمالية، وأسفر عن سقوط 19,729 قتيلاً و2,559 مفقوداً.",
        reference: "Reconstruction Agency", refURL: "https://www.reconstruction.go.jp/english/topics/GEJE/",
      },
    ],
    ja: [
      {
        emoji: "🤔", title: "待って…どの福島？",
        text: "福島県には、県中央部に位置する県庁所在地の福島市と、太平洋沿岸にある福島第一・第二の2つの原子力発電所があります。",
        reference: "Fukushima travel", refURL: "https://fukushima.travel/",
      },
      {
        emoji: "🗾", title: "福島県について",
        text: "福島県は日本で3番目に広い県で、面積は13,783.9平方キロメートル。浜通り（沿岸部、全体の21%）、中通り（中央部、39%）、会津（40%）の3つの地域で構成されています。",
        reference: "Fukushima Prefecture Revitalization Portal", refURL: "https://www.pref.fukushima.lg.jp/site/portal-english/en05-01.html",
      },
      {
        emoji: "🍑", title: "特産品",
        text: "福島県は桃、米、日本酒、牛肉などの農産物で知られており、3つの地域それぞれに独自の見どころがあります。",
        reference: "JanapGov", refURL: "https://www.japan.go.jp/kizuna/2022/02/the_flavor_of_fukushima.html",
      },
      {
        emoji: "♨️", title: "人気の観光スポット",
        text: "中央部にある福島市には3つの有名な温泉があり、沿岸地域には漁業の盛んな集落や海水浴場が数多くあります。",
        reference: "Fukushima City Guide", refURL: "https://www.f-kankou.jp/en/onsen/",
      },
      {
        emoji: "🌊", title: "東日本大震災",
        text: "2011年3月11日14時46分（日本時間）、福島県の北部でマグニチュード9.0という観測史上最大級の地震が発生し、東北地方北部の太平洋沿岸に巨大な津波を引き起こしました。この災害による死者は19,729人、行方不明者は2,559人にのぼります。",
        reference: "Reconstruction Agency", refURL: "https://www.reconstruction.go.jp/english/topics/GEJE/",
      },
    ],
  },
};

const SURVEY_QUESTIONS = {
  en: [
    { id: "q1",
      question: "1. Was it convenient for you to learn from the chatbot?",
      options: ["Yes", "No"] },
    { id: "q2",
      question: "2. Have you gained enough understanding to explain about Fukushima?",
      options: ["Yes", "No"] },
    { id: "q3",
      question: "3. Did talking to a chatbot change your opinion about the Fukushima disaster in 2011 (earthquake, tsunami and nuclear accident)?",
      options: ["Yes", "No"] },
    { id: "q4",
      question: "4. Did talking to a chatbot change your opinion about the radiological safety in Fukushima?",
      options: ["Yes", "No"] },
    { id: "q5",
      question: "5. Would you be interested in using chatbot to learn more facts about other related topics?",
      options: ["Yes", "No"] },
    { id: "q6",
      type: "text",
      question: "If you have additional comments, please share them with us in this field.",
      placeholder: "Write your comments here..." },
  ],
  ar: [
    { id: "q1",
      question: "1. هل كان من السهل عليك التعلم من الروبوت المحادث؟",
      options: ["نعم", "لا"] },
    { id: "q2",
      question: "2. هل اكتسبت فهماً كافياً لتتمكن من شرح ما يتعلق بفوكوشيما؟",
      options: ["نعم", "لا"] },
    { id: "q3",
      question: "3. هل غيّرت محادثتك مع الروبوت رأيك بشأن كارثة فوكوشيما عام 2011 (الزلزال والتسونامي والحادث النووي)؟",
      options: ["نعم", "لا"] },
    { id: "q4",
      question: "4. هل غيّرت محادثتك مع الروبوت رأيك بشأن السلامة الإشعاعية في فوكوشيما؟",
      options: ["نعم", "لا"] },
    { id: "q5",
      question: "5. هل تود استخدام الروبوت المحادث لمعرفة المزيد من الحقائق حول مواضيع أخرى ذات صلة؟",
      options: ["نعم", "لا"] },
    { id: "q6",
      type: "text",
      question: "إذا كانت لديك تعليقات إضافية، يرجى مشاركتها معنا في هذا الحقل.",
      placeholder: "اكتب تعليقاتك هنا..." },
  ],
  ja: [
    { id: "q1",
      question: "1. チャットボットで学ぶことは便利でしたか？",
      options: ["はい", "いいえ"] },
    { id: "q2",
      question: "2. 福島について説明できるほど十分に理解できましたか？",
      options: ["はい", "いいえ"] },
    { id: "q3",
      question: "3. チャットボットとの会話によって、2011年の福島での災害（地震、津波、原発事故）についてのあなたの考えは変わりましたか？",
      options: ["はい", "いいえ"] },
    { id: "q4",
      question: "4. チャットボットとの会話によって、福島の放射線安全性についてのあなたの考えは変わりましたか？",
      options: ["はい", "いいえ"] },
    { id: "q5",
      question: "5. 他の関連トピックについてもっと知るために、チャットボットを利用してみたいと思いますか？",
      options: ["はい", "いいえ"] },
    { id: "q6",
      type: "text",
      question: "追加のご意見がありましたら、こちらの欄にご記入ください。",
      placeholder: "ここにコメントを入力してください..." },
  ],
};

const markdownComponents = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" style={styles.mdLink} />
  ),
  p: ({ node, ...props }) => <p {...props} style={styles.mdParagraph} />,
  strong: ({ node, ...props }) => <strong {...props} style={styles.mdStrong} />,
};

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [learnCategory, setLearnCategory] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeAgreed, setWelcomeAgreed] = useState(false);
  const [submittingConversation, setSubmittingConversation] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const countdownRef = useRef(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyAnswers, setSurveyAnswers] = useState({});
  const [submittingSurvey, setSubmittingSurvey] = useState(false);

  const t = UI_TEXT[language];
  const dir = LANGUAGES[language].dir;
  useEffect(() => {
  const id = getSessionId();
  setSessionId(id);

  const savedMessages = loadConversation();
  const savedLanguage = loadLanguage();

  if (savedLanguage) {
    setLanguage(savedLanguage);
  }

  if (savedMessages.length > 0) {
    setMessages(savedMessages);
  }
}, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, countdown]);

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(countdownRef.current);
    }
  }, [countdown]);

  useEffect(() => {
  saveConversation(messages);
}, [messages]);


useEffect(() => {
  saveLanguage(language);
}, [language]);



  async function callAPI(msgs, lang) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: msgs, language: lang }),
    });
    const data = await res.json();
    if (res.status === 429 && data.retryAfter) {
      const waitSec = Math.min(data.retryAfter + 2, 30);
      setCountdown(waitSec);
      await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
      setCountdown(0);
      const res2 = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, language: lang }),
      });
      return await res2.json();
    }
    return data;
  }

  async function startQuiz() {
    setShowChat(true);

    if (messages.length > 0) {
      return;
    }

    setLoading(true);

    try {
      const data = await callAPI(
        [
          {
            role: "user",
            content: "Start the quiz! Give me the first question.",
          },
        ],
        language
      );

      if (data.error) {
        setMessages([
          {
            role: "assistant",
            content: "Error: " + data.error,
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content: data.response,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const data = await callAPI(newMessages, language);
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: "Error: " + data.error }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Connection error: " + err.message }]);
    }
    setLoading(false);
    setCountdown(0);
  }

  function goBack() {
    setShowChat(false);
  }

  function handleShareConversation() {
    setShowSurvey(true);
  }

  async function submitConversation(consent) {

    if (messages.length === 0) return;

    try {

      setSubmittingConversation(true);

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          language,
          conversation: messages,
          consent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }

      setShowConsent(false);

      console.log(data);

      alert("Thank you! Your conversation has been submitted.");

    } catch (err) {

      alert(err.message);

    } finally {

      setSubmittingConversation(false);

    }

  }

  async function submitSurvey() {
    try {
      setSubmittingSurvey(true);

      const res = await fetch("/api/submit-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          language,
          answers: surveyAnswers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown error");
      }

      setShowSurvey(false);
      setShowConsent(true);

    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingSurvey(false);
    }
  }

  async function handleNewConversation() {
    const id = createNewSession();

    setSessionId(id);

    setMessages([]);
    saveConversation([]);

    setShowChat(true);

    setLoading(true);

    try {
      const data = await callAPI(
        [
          {
            role: "user",
            content: "Start the quiz! Give me the first question.",
          },
        ],
        language
      );

      if (data.error) {
        setMessages([
          {
            role: "assistant",
            content: "Error: " + data.error,
          },
        ]);
      } else {
        setMessages([
          {
            role: "assistant",
            content: data.response,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  const facts = learnCategory
    ? FACT_SHEETS[learnCategory]?.[language] || FACT_SHEETS[learnCategory]?.en || []
    : [];

  const handlers = {
    quiz: startQuiz,
    general: () => setLearnCategory("general"),
    nuclear: () => setLearnCategory("nuclear"),
    ocean: () => setLearnCategory("ocean"),
  };

  return (
    <>
      <Head>
        <title>Daiichi — Fukushima Myth-Buster</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Quiz-based AI chatbot that busts Fukushima myths." />
      </Head>

      <div style={{ ...styles.container, direction: dir }}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}>🌿</div>
            <div>
              <h1 style={styles.headerTitle}>{t.title}</h1>
              <p style={styles.headerSub}>{t.subtitle}</p>
              {/* delete later */}
              <p style={{ fontSize: 10, opacity: 0.6 }}>
                Session: {sessionId}
              </p>
            </div>
          </div>
          <div style={styles.langBar}>
            {Object.entries(LANGUAGES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => {
                    setLanguage(key);
                    saveConversation([]);
                    setSurveyAnswers({});
                }}
                style={{ ...styles.langBtn, ...(language === key ? styles.langBtnActive : {}) }}
              >
                {val.flag} {val.label}
              </button>
            ))}
          </div>
        </header>

        {!showChat ? (
          <main style={styles.topicScreen}>
            <div style={styles.heroSection}>
              <div style={styles.heroEmoji}>🌿</div>
              <h2 style={styles.heroTitle}>
                {t.title}
              </h2>
              <p style={styles.heroDesc}>
                {t.OpenChatMessage}
              </p>
            </div>
            <div style={styles.topicGrid}>
              {MENU_CARDS.map((card) => {
                const onClick = handlers[card.id];
                const enabled = Boolean(onClick)&& !showWelcome;

                return (
                  <button
                    key={card.id}
                    onClick={onClick}
                    disabled={!enabled}
                    style={enabled ? styles.topicCard : { ...styles.topicCard, opacity: 0.6, cursor: "default" }}
                    onMouseEnter={enabled ? (e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,58,42,0.15)";
                    } : undefined}
                    onMouseLeave={enabled ? (e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,58,42,0.08)";
                    } : undefined}
                  >
                    <span style={styles.topicEmoji}>{card.emoji}</span>
                    <span style={styles.topicLabel}>{card[language]}</span>
                  </button>
                );
              })}
            </div>

            <footer style={styles.footer}>
              <p>
                {t.powered} &middot; {t.by}
              </p>
            </footer>

          </main>
        ) : (
          <div style={styles.chatScreen}>
            <div style={styles.topicBar}>
              <button
              onClick={goBack}
              style={styles.backBtn}
              >
                {t.back}
              </button>
              <button
              onClick={handleNewConversation}
              style={styles.backBtn}
              >
                ↻ New Conversation
              </button>
              <span style={styles.topicBarLabel}>
                  🌿 Daiichi
              </span>
          </div>
            <div style={styles.chatMessages}>
              {messages.map((msg, i) => (
                <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "assistant" && <div style={styles.botAvatar}>🌿</div>}
                  <div style={{ ...styles.bubble, ...(msg.role === "user" ? styles.userBubble : styles.botBubble) }}>
                    {msg.role === "assistant" ? (
                      <div className="md-content">
                        <ReactMarkdown components={markdownComponents}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
                  <div style={styles.botAvatar}>🌿</div>
                  <div style={{ ...styles.bubble, ...styles.botBubble, ...styles.loadingBubble }}>
                    {countdown > 0 ? (
                      <span style={styles.countdownText}>
                        {language === "ar" ? `⏳ ~${countdown}s جاري الانتظار...` :
                         language === "ja" ? `⏳ ~${countdown}秒 お待ちください...` :
                         `⏳ ~${countdown}s please wait...`}
                      </span>
                    ) : (
                      <><span style={styles.dot} /><span style={styles.dot} /><span style={styles.dot} /></>
                    )}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} style={styles.inputBar}>
              <input
                ref={inputRef} type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.typeMessage}
                style={{ ...styles.input, direction: dir }}
                disabled={loading}
              />
              <button type="submit" style={styles.sendBtn} disabled={loading || !input.trim()}>
                {t.send}
              </button>
            </form>
            <div style={styles.shareContainer}>
              <ShareConversation
                language={language}
                disabled={
                  messages.length === 0 ||
                  submittingConversation
                }
                onClick={handleShareConversation}
              />
            </div>
          </div>
        )}

        {showWelcome && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{t.welcomeTitle}</h2>
              </div>
              <div style={styles.modalBody}>
                <p style={styles.welcomeCaption}>{t.welcomeCaption}</p>
                <div style={styles.welcomeImagePlaceholder}>
                  <img 
                    src="/img/QRCode-OnlineSurvey-MG-8Aug2026.png"
                    alt="📷"
                    style={styles.welcomeImage}
                  />                  
                </div>
                <a
                href="https://forms.gle/6xQWtggMdUntS5Uk8"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.welcomeURL}>
                  {t.urltex}
                </a>
                <label style={styles.welcomeCheckboxRow}>
                  <input
                    type="checkbox"
                    checked={welcomeAgreed}
                    onChange={(e) => setWelcomeAgreed(e.target.checked)}
                  />
                  {t.welcomeCheckbox}
                </label>
                <p style={styles.welcomeSubtitle}>{t.welcomeSubtitle}</p>
                <button
                  onClick={() => setShowWelcome(false)}
                  disabled={!welcomeAgreed}
                  style={welcomeAgreed ? styles.welcomeButton : { ...styles.welcomeButton, opacity: 0.5, cursor: "not-allowed" }}
                >
                  {t.welcomeButton}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Learn Modal */}
        {learnCategory && (
          <div style={styles.modalOverlay} onClick={() => setLearnCategory(null)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {MENU_CARDS.find((c) => c.id === learnCategory)?.[language] || t.learnTitle}
                </h2>
                <button onClick={() => setLearnCategory(null)} style={styles.modalClose}>✕</button>
              </div>
              <div style={styles.modalBody}>
                {facts.map((fact, i) => (
                  <div key={i} style={styles.factCard}>
                    <div style={styles.factTop}>
                      <span style={styles.factEmoji}>{fact.emoji}</span>
                      <h3 style={styles.factTitle}>{fact.title}</h3>
                    </div>
                    <p style={styles.factText}>{fact.text}</p>
                    <div style={styles.factRef}>
                      <span style={styles.factTitle}>Source:</span>
                      <a
                        href={fact.refURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.factReference}
                      >{fact.reference}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showSurvey && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{t.surveyTitle}</h2>
                <button onClick={() => setShowSurvey(false)} style={styles.modalClose}>✕</button>
              </div>

              <div style={styles.modalBody}>
                <p style={styles.welcomeCaption}>{t.surveyCaption}</p>

                {(SURVEY_QUESTIONS[language] || SURVEY_QUESTIONS.en).map((question) => (
                  <div key={question.id} style={styles.surveyQuestionCard}>
                    <p style={styles.surveyQuestionTitle}>
                      {question.question}
                    </p>
                    {question.type === "text" ? (
                      <textarea
                        value={surveyAnswers[question.id] || ""}
                        onChange={(e) =>
                          setSurveyAnswers({
                            ...surveyAnswers,
                            [question.id]: e.target.value,
                          })
                        }
                        placeholder={question.placeholder}
                        style={styles.surveyTextarea}
                        rows={3}
                      />
                    ) : (
                      <div style={styles.surveyOptionsList}>
                        {question.options.map((option) => {
                          const selected = surveyAnswers[question.id] === option;
                          return (
                            <label
                              key={option}
                              style={{
                                ...styles.surveyOptionRow,
                                ...(selected ? styles.surveyOptionRowSelected : {}),
                              }}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={selected}
                                onChange={(e) =>
                                  setSurveyAnswers({
                                    ...surveyAnswers,
                                    [question.id]: e.target.value,
                                  })
                                }
                                style={styles.surveyRadio}
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  onClick={submitSurvey}
                  disabled={
                    (SURVEY_QUESTIONS[language] || SURVEY_QUESTIONS.en).some(
                      (question) => question.type !== "text" && !surveyAnswers[question.id]
                    ) || submittingSurvey
                  }
                  style={
                    (SURVEY_QUESTIONS[language] || SURVEY_QUESTIONS.en).every(
                      (question) => question.type === "text" || surveyAnswers[question.id]
                    )
                      ? styles.welcomeButton
                      : { ...styles.welcomeButton, opacity: 0.5, cursor: "not-allowed" }
                  }
                >
                  {submittingSurvey ? t.surveySubmitting : t.surveyContinue}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConsentModal
          open={showConsent}
          language={language}
          onClose={() => setShowConsent(false)}
          onSubmit={submitConversation}
        />
      </div>

      <style jsx global>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
        .md-content p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </>
  );
}

const styles = {
  container: { height: "100vh", display: "flex", flexDirection: "column", maxWidth: 900, margin: "0 auto", background: "#f0f7f2" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "linear-gradient(135deg, #1a3a2a, #2d6a4f)", color: "#fff", flexWrap: "wrap", gap: 8 },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  logo: { fontSize: 32, lineHeight: 1 },
  headerTitle: { fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" },
  headerSub: { fontSize: 12, opacity: 0.85, marginTop: 2 },
  langBar: { display: "flex", gap: 4 },
  langBtn: { padding: "6px 12px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, background: "transparent", color: "#fff", cursor: "pointer", fontSize: 13, transition: "all 0.2s" },
  langBtnActive: { background: "rgba(255,255,255,0.2)", borderColor: "#fff", fontWeight: 600 },
  topicScreen: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 32, overflowY: "auto" },
  heroSection: { textAlign: "center" },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: 700, color: "#1a3a2a", marginBottom: 8 },
  heroDesc: { fontSize: 15, color: "#3a5a48", maxWidth: 500, lineHeight: 1.5 },
  topicGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, width: "100%", maxWidth: 520 },
  topicCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "28px 16px", background: "#fff", border: "2px solid #d8f3dc", borderRadius: 16, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 12px rgba(26,58,42,0.08)" },
  topicEmoji: { fontSize: 36 },
  topicLabel: { fontSize: 15, fontWeight: 600, color: "#1a3a2a", textAlign: "center" },
  footer: { fontSize: 12, color: "#6b8f7a", textAlign: "center" },
  chatScreen: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topicBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "#d8f3dc", borderBottom: "1px solid #b7e4c7" },
  backBtn: { background: "none", border: "none", color: "#2d6a4f", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  topicBarLabel: { fontSize: 14, fontWeight: 600, color: "#1a3a2a" },
  chatMessages: { flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  botAvatar: { width: 32, height: 32, borderRadius: "50%", background: "#2d6a4f", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  bubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: 18, fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" },
  userBubble: { background: "#2d6a4f", color: "#fff", borderBottomRightRadius: 4 },
  botBubble: { background: "#fff", color: "#1b2e24", border: "1px solid #d8f3dc", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(26,58,42,0.06)" },
  mdParagraph: { margin: "0 0 8px 0" },
  mdStrong: { fontWeight: 700 },
  mdLink: { color: "#2d6a4f", fontWeight: 600, textDecoration: "underline", wordBreak: "break-word" },
  loadingBubble: { display: "flex", gap: 5, padding: "14px 20px", alignItems: "center" },
  countdownText: { fontSize: 13, color: "#2d6a4f", fontWeight: 500 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#74c69d", display: "inline-block", animation: "blink 1.4s infinite both" },
  inputBar: { display: "flex", gap: 8, padding: "12px 16px", background: "#fff", borderTop: "1px solid #d8f3dc" },
  input: { flex: 1, padding: "12px 16px", border: "2px solid #d8f3dc", borderRadius: 24, fontSize: 14, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" },
  sendBtn: { padding: "10px 24px", background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", fontFamily: "inherit" },
  // Learn FAB
  learnFab: { position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "#2d6a4f", border: "none", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 16px rgba(26,58,42,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, transition: "transform 0.2s" },
  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#f0f7f2", borderRadius: 20, width: "100%", maxWidth: 600, maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #1a3a2a, #2d6a4f)", color: "#fff" },
  modalTitle: { fontSize: 20, fontWeight: 700 },
  modalClose: { background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", padding: 4 },
  modalBody: { overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 },
  welcomeImagePlaceholder: { width: 160, height: 160, margin: "0 auto", background: "#d8f3dc", border: "2px #74c69d", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#2d6a4f" },
  welcomeImage: { width: "100%", height: "100%", objectFit: "cover" },
  welcomeCaption: { fontSize: 16, fontWeight: 500, color: "#2d6a4f" },
  welcomeURL: { fontSize: 13, color: "#6b8f7a", textAlign: "center", margin: 0, textDecoration: "underline" },
  welcomeSubtitle: { fontSize: 12, color: "#6b6b6b", textAlign: "center", margin: 0 },
  welcomeCheckboxRow: { display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 13, color: "#1a3a2a", cursor: "pointer" },
  welcomeButton: { padding: "12px 24px", background: "#2d6a4f", color: "#fff", border: "none", borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s" },
  factCard: { background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #d8f3dc", boxShadow: "0 2px 8px rgba(26,58,42,0.06)" },
  factTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  factEmoji: { fontSize: 28 },
  factTitle: { fontSize: 16, fontWeight: 700, color: "#1a3a2a" },
  factText: { fontSize: 14, lineHeight: 1.6, color: "#3a5a48", marginBottom: 12 },
  factRef: { display: "flex", alignItems: "baseline", gap: 8, padding: "10px 14px", background: "#d8f3dc", borderRadius: 10 },
  factReference: { fontSize: 16, color: "#2d6a4f", fontWeight: 600, textDecoration: "underline", wordBreak: "break-word" },
  shareContainer: { padding: "0 16px 12px",  background: "#fff", },
  surveyQuestionCard: { background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #d8f3dc", boxShadow: "0 2px 8px rgba(26,58,42,0.06)", },
  surveyQuestionTitle: { fontSize: 15, fontWeight: 700, color: "#1a3a2a", marginBottom: 10, },
  surveyOptionsList: { display: "flex", flexDirection: "column", gap: 8, },
  surveyOptionRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid #d8f3dc", background: "#f7fbf8", fontSize: 14, color: "#1a3a2a", cursor: "pointer", transition: "all 0.15s", },
  surveyOptionRowSelected: { background: "#d8f3dc", borderColor: "#74c69d", fontWeight: 600, },
  surveyRadio: { accentColor: "#2d6a4f", width: 16, height: 16, flexShrink: 0,},
  surveyTextarea: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #d8f3dc", background: "#f7fbf8", fontSize: 14, color: "#1a3a2a", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" },
};