import { QuestionTypes } from "renderer/providers/tiktok/components/survey/context";

export const questions: QuestionTypes[] = [
  {
    label: "Wie lautet Dein Geschlecht?",
    name: "geschlecht",
    type: "radio-group",
    required: true,
    choices: [
      {
        label: "Divers",
        value: "divers",
      },
      {
        label: "Weiblich",
        value: "weiblich",
      },
      {
        label: "Männlich",
        value: "männlich",
      },
      {
        label: "Keine Angabe",
        value: "keine angabe",
      },
    ],
  },
  {
    label:
      "Was sind die ersten zwei Stellen der Postleitzahl Deines Hauptwohnsitzes?",
    name: "plz-wohnort",
    type: "number",
    inputParams: { min: 0, max: 99, step: 1 },
    required: true,
  },
  {
    label: "Stimmt Deine Altersangabe auf TikTok?",
    name: "altersangabe-stimmt",
    type: "radio-group",
    choices: [
      {
        label: "Ja",
        value: "ja",
      },
      {
        label: "Nein",
        value: "nein",
      },
    ],
  },
  {
    label: "Tatsächliches Alter (in Jahren)",
    name: "tatsächliches-alter",
    type: "number",
    inputParams: { min: 0, max: 130, step: 1 },
    visibleIf: {
      name: "altersangabe-stimmt",
      hasValue: "nein",
    },
  },
  {
    label:
      "Welche Funktionen der TikTok-App nutzt Du am meisten? Bitte gib uns Deine relative Einschätzung, wo Du in der App die meisten TikToks findest bzw. ansiehst.",
    name: "funktionen-meist-genutzt",
    type: "radio-group",
    required: true,
    choices: [
      {
        label: "Für-Dich-Seite",
        value: "für-dich-seite",
      },
      {
        label: "Folge-Ich-Seite",
        value: "folge-ich-seite",
      },
      {
        label: "Live-Feed",
        value: "live-feed",
      },
      {
        label: "Suchfunktion",
        value: "suchfunktion",
      },
      {
        label: "Über Creatorprofile",
        value: "über-creatorprofile",
      },
      {
        label: "Sonstiges",
        value: "sonstiges",
      },
    ],
  },
  {
    label: "Wann hast Du Deinen TikTok-Account erstellt?",
    name: "account-erstellt-am",
    type: "multiple-select",
    required: true,
    choices: [
      [
        {
          label: "Monat",
        },
        {
          label: "Januar",
          value: "1",
        },
        {
          label: "Februar",
          value: "2",
        },
        {
          label: "März",
          value: "3",
        },
        {
          label: "April",
          value: "4",
        },
        {
          label: "Mai",
          value: "5",
        },
        {
          label: "Juni",
          value: "6",
        },
        {
          label: "Juli",
          value: "7",
        },
        {
          label: "August",
          value: "8",
        },
        {
          label: "September",
          value: "9",
        },
        {
          label: "Oktober",
          value: "10",
        },
        {
          label: "November",
          value: "11",
        },
        {
          label: "Dezember",
          value: "12",
        },
      ],
      [
        {
          label: "Jahr",
        },
        {
          label: "2016",
          value: "2016",
        },
        {
          label: "2017",
          value: "2017",
        },
        {
          label: "2018",
          value: "2018",
        },
        {
          label: "2019",
          value: "2019",
        },
        {
          label: "2020",
          value: "2020",
        },
        {
          label: "2021",
          value: "2021",
        },
        {
          label: "2022",
          value: "2022",
        },
      ],
    ],
  },
  {
    label:
      "Hast Du in Deiner TikTok App mehrere eigene TikTok-Accounts verknüpft?",
    name: "mehrere-accounts-verknüpft",
    type: "radio-group",
    required: true,
    choices: [
      {
        label: "Ja",
        value: "ja",
      },
      {
        label: "Nein",
        value: "nein",
      },
    ],
  },
  {
    label:
      "Welche Themen bzw. Interessen ordnet TikTok Dir Deiner Ansicht nach auf der Für-Dich-Seite zu?",
    name: "themen-interessen-zuordnunug",
    type: "checkbox",
    required: true,
    choices: [
      {
        label: "Unterhaltung (z.B. Comedy, Zauberei)",
        value: "unterhaltung",
      },
      {
        label: "Menschen & Vlogs)",
        value: "vlogs",
      },
      {
        label: "Musik & Tanz",
        value: "musik",
      },
      {
        label: "Kunst, Handwerk, Hobby",
        value: "kunst",
      },
      {
        label: "Wissenschaft, Technik, Bildung",
        value: "wissenschaft",
      },
      {
        label: "Gaming",
        value: "gaming",
      },
      {
        label: "Gemeinschaft & Identität (z.B. LGBT)",
        value: "gemeinschaft",
      },
      {
        label: "Politik & Nachrichten",
        value: "politik",
      },
      {
        label: "Etwas anderes",
        value: "anderes",
      },
    ],
  },
  {
    label:
      "Denkst Du Deine Für-Dich-Seite enthält besonders schutzwürdige personenbezogene Daten über Dich?",
    name: "zuordnug-betrifft-persönliche-daten",
    type: "radio-group",
    choices: [
      {
        label: "Ja",
        value: "ja",
      },
      {
        label: "Nein",
        value: "nein",
      },
    ],
  },
  {
    label:
      "Die Datenschutzgrundverordnung (DSGVO) definiert verschiedene Kategorien besonders schutzwürdiger Daten: Herkunft, politische und religiöse Einstellung, Gewerkschaftszugehörigkeit, Angaben zu Gesundheit und Sexualität. Welche dieser Kategorien denkst Du betreffen die Daten aus Deiner Für-Dich-Seite?",
    name: "zuordnug-betrifft-persönliche-daten-bereiche",
    type: "checkbox",
    visibleIf: {
      name: "zuordnug-betrifft-persönliche-daten",
      hasValue: "ja",
    },
    choices: [
      {
        label: "Politische Einstellung",
        value: "politische-einstellung",
      },
      {
        label: "Sexualität",
        value: "sexualität",
      },
      {
        label: "Religion & Weltanschauung",
        value: "religion-weltanschauung",
      },
      {
        label: "Gesundheit/Krankheit",
        value: "gesundheit-krankheit",
      },
      {
        label: "Herkunft",
        value: "herkunft",
      },
    ],
  },
  {
    label: "Kennst Du TikToks Wellbeing Funktionen?",
    name: "wellbeing-funktion",
    type: "radio-group",
    choices: [
      {
        label: "Ja",
        value: "ja",
      },
      {
        label: "Nein",
        value: "nein",
      },
    ],
  },
  {
    label: "Hast Du TikToks Digital Wellbeing Funktionen aktiviert?",
    name: "wellbeing-funktion-aktiviert",
    type: "radio-group",
    visibleIf: {
      name: "wellbeing-funktion",
      hasValue: "ja",
    },
    choices: [
      {
        label: "Ja",
        value: "ja",
      },
      {
        label: "Nein",
        value: "nein",
      },
      {
        label: "Weiß ich nicht",
        value: "weiß-ich-nicht",
      },
    ],
  },
  {
    label: "Welche Funktionen von TikTok nutzt Du?",
    name: "welche-funktionen-werden-genutzt",
    type: "checkbox",
    choices: [
      {
        label: "Ich schaue mir TikToks an",
        value: "1",
      },
      {
        label:
          "Ich nutze gezielt verschiedene Feeds wie die Folge-Ich-Seite oder Livestreams",
        value: "2",
      },
      {
        label:
          "Ich nutze TikTok um mich über Interessen zu informieren und auszutauschen",
        value: "3",
      },
      {
        label: "Ich favorisiere bzw. Bookmarke einzelne Hashtags oder Sounds",
        value: "4",
      },
      {
        label: "Ich nutze TikTok aktiv als Creator",
        value: "5",
      },
    ],
  },
  {
    label: "Wie interaktiv nutzt Du TikTok?",
    name: "wie-interaktiv-nutzt-du-tiktok",
    type: "checkbox",
    choices: [
      {
        label: "Überhaupt nicht",
        value: "1",
      },
      {
        label: "Ich like und favorisiere Inhalte",
        value: "2",
      },
      {
        label: "Ich kommentiere Inhalte",
        value: "3",
      },
      {
        label: "Ich teile Inhalte mit Freunden und Bekannten",
        value: "4",
      },
      {
        label: "Ich teile Inhalte als Creator",
        value: "5",
      },
    ],
  },
  {
    label: "Wie viele Stunden verbringst Du am Tag auf TikTok?",
    name: "einschätzung-nutzunszeit",
    type: "number",
    inputParams: { min: 0, max: 24, step: 1 },
  },
  {
    label: "Wie oft öffnest Du die App am Tag?",
    type: "number",
    name: "einschätzung-wie-oft-geöffnet",
    inputParams: { min: 0, max: 1000, step: 1 },
  },
  {
    label: "Zu welcher Tages- oder Nachtzeit bist Du am Meisten auf TikTok?",
    name: "einschätzung-nutzungszeit-tageszeit",
    type: "radio-group",
    choices: [
      {
        label: "Vormittags",
        value: "vormittags",
      },
      {
        label: "Nachmittags",
        value: "nachmittags",
      },
      {
        label: "Abends",
        value: "abends",
      },
      {
        label: "Nachts",
        value: "nachts",
      },
    ],
  },
  {
    label: "Hast Du TikTok erlaubt, Dir personalisierte Werbung zu zeigen?",
    name: "personalisierte-werbung-aktiviert",
    type: "radio-group",
    choices: [
      {
        label: "Ja",
        value: "ja",
      },
      {
        label: "Nein",
        value: "nein",
      },
    ],
  },
  {
    label: "Welche Informationen denkst Du hat TikTok über Dich?",
    name: "welche-infos-hat-tiktok",
    type: "checkbox",
    choices: [
      {
        label: "E-Mail-Adresse",
        value: "e-mail-adresse",
      },
      {
        label: "Telefonnummer",
        value: "telefonnummer",
      },
      {
        label: "Internetanbieter",
        value: "internetanbieter",
      },
    ],
  },
  {
    label:
      "Welche Interessen hast Du TikTok ausdrücklich mitgeteilt? Trage alle Begriffe durch ein Komma getrennt in das Feld ein.",
    name: "welche-interessen-tiktok-mitgeteilt",
    type: "textarea",
  },
  {
    label: "Welche Begriffe hast Du auf der App für Dich blockiert?",
    name: "begriffe-blockiert",
    type: "textarea",
  },
  {
    label: "Warum nutzt Du TikTok?",
    name: "warum-tiktok-nutzung",
    type: "checkbox",
    choices: [
      {
        label: "Unterhaltung",
        value: "unterhaltung",
      },
      {
        label: "Bildung",
        value: "bildung",
      },
      {
        label: "Austausch & Vernetzung",
        value: "austausch-und-vernetzung",
      },
      {
        label: "Politik",
        value: "politik",
      },
      {
        label: "Anderes",
        value: "anderes",
      },
    ],
  },
  {
    label: "Wie bewertest Du Deine Erfahrung auf TikTok?",
    name: "erfahrung-tiktok-bewertung",
    type: "radio-group",
    choices: [
      {
        label: "1 = Sehr schlecht",
        value: "1",
      },
      {
        label: "2",
        value: "2",
      },
      {
        label: "3",
        value: "3",
      },
      {
        label: "4",
        value: "4",
      },
      {
        label: "5",
        value: "5",
      },
      {
        label: "6",
        value: "6",
      },
      {
        label: "7",
        value: "7",
      },
      {
        label: "8",
        value: "8",
      },
      {
        label: "9",
        value: "9",
      },
      {
        label: "10 = Sehr gut",
        value: "10",
      },
    ],
  },
  {
    label: "Wie sehr vertraust Du TikToks Datenschutz?",
    name: "vertrauen-in-datenschutz",
    type: "radio-group",
    choices: [
      {
        label: "1 = Sehr schlecht",
        value: "1",
      },
      {
        label: "2",
        value: "2",
      },
      {
        label: "3",
        value: "3",
      },
      {
        label: "4",
        value: "4",
      },
      {
        label: "5",
        value: "5",
      },
      {
        label: "6",
        value: "6",
      },
      {
        label: "7",
        value: "7",
      },
      {
        label: "8",
        value: "8",
      },
      {
        label: "9",
        value: "9",
      },
      {
        label: "10 = Sehr gut",
        value: "10",
      },
    ],
  },
  {
    label:
      "Wie bewertest Du TikToks Auswahl an Inhalten für Dich auf der Für-Dich-Seite?",
    name: "bewertung-recommender",
    type: "radio-group",
    choices: [
      {
        label: "1 = Sehr schlecht",
        value: "1",
      },
      {
        label: "2",
        value: "2",
      },
      {
        label: "3",
        value: "3",
      },
      {
        label: "4",
        value: "4",
      },
      {
        label: "5",
        value: "5",
      },
      {
        label: "6",
        value: "6",
      },
      {
        label: "7",
        value: "7",
      },
      {
        label: "8",
        value: "8",
      },
      {
        label: "9",
        value: "9",
      },
      {
        label: "10 = Sehr gut",
        value: "10",
      },
    ],
  },
  {
    label:
      "Was beschreibt Deine Assoziationen mit dem Empfehlungsalgorithmus auf TikTok am besten? Der TikTok-Empfehlungsalgorithmus ist:",
    name: "assoziationen-recommender",
    type: "muiltiple-radio-groups",
    choices: [
      [
        {
          label: "1 = Gewöhnlich",
          value: "antwort-1-1",
        },
        {
          label: "2",
          value: "antwort-1-2",
        },
        {
          label: "3",
          value: "antwort-1-3",
        },
        {
          label: "4",
          value: "antwort-1-4",
        },
        {
          label: "5",
          value: "antwort-1-5",
        },
        {
          label: "6",
          value: "antwort-1-6",
        },
        {
          label: "7",
          value: "antwort-1-7",
        },
        {
          label: "8",
          value: "antwort-1-8",
        },
        {
          label: "9",
          value: "antwort-1-9",
        },
        {
          label: "10 = Mysteriös",
          value: "antwort-1-10",
        },
      ],
      [
        {
          label: "1 = Schön",
          value: "antwort-2-1",
        },
        {
          label: "2",
          value: "antwort-2-2",
        },
        {
          label: "3",
          value: "antwort-2-3",
        },
        {
          label: "4",
          value: "antwort-2-4",
        },
        {
          label: "5",
          value: "antwort-2-5",
        },
        {
          label: "6",
          value: "antwort-2-6",
        },
        {
          label: "7",
          value: "antwort-2-7",
        },
        {
          label: "8",
          value: "antwort-2-8",
        },
        {
          label: "9",
          value: "antwort-2-9",
        },
        {
          label: "10 = Gruselig",
          value: "antwort-2-10",
        },
      ],
      [
        {
          label: "1 = Harmlos",
          value: "antwort-3-1",
        },
        {
          label: "2",
          value: "antwort-3-2",
        },
        {
          label: "3",
          value: "antwort-3-3",
        },
        {
          label: "4",
          value: "antwort-3-4",
        },
        {
          label: "5",
          value: "antwort-3-5",
        },
        {
          label: "6",
          value: "antwort-3-6",
        },
        {
          label: "7",
          value: "antwort-3-7",
        },
        {
          label: "8",
          value: "antwort-3-8",
        },
        {
          label: "9",
          value: "antwort-3-9",
        },
        {
          label: "10 = Gefährlich",
          value: "antwort-3-10",
        },
      ],
      [
        {
          label: "1 = Detailiert",
          value: "antwort-4-1",
        },
        {
          label: "2",
          value: "antwort-4-2",
        },
        {
          label: "3",
          value: "antwort-4-3",
        },
        {
          label: "4",
          value: "antwort-4-4",
        },
        {
          label: "5",
          value: "antwort-4-5",
        },
        {
          label: "6",
          value: "antwort-4-6",
        },
        {
          label: "7",
          value: "antwort-4-7",
        },
        {
          label: "8",
          value: "antwort-4-8",
        },
        {
          label: "9",
          value: "antwort-4-9",
        },
        {
          label: "10 = Grob",
          value: "antwort-4-10",
        },
      ],
      [
        {
          label: "1 = Intelligent",
          value: "antwort-5-1",
        },
        {
          label: "2",
          value: "antwort-5-2",
        },
        {
          label: "3",
          value: "antwort-5-3",
        },
        {
          label: "4",
          value: "antwort-5-4",
        },
        {
          label: "5",
          value: "antwort-5-5",
        },
        {
          label: "6",
          value: "antwort-5-6",
        },
        {
          label: "7",
          value: "antwort-5-7",
        },
        {
          label: "8",
          value: "antwort-5-8",
        },
        {
          label: "9",
          value: "antwort-5-9",
        },
        {
          label: "10 = Dumm",
          value: "antwort-5-10",
        },
      ],
    ],
  },
  {
    label:
      "Hast Du auf Deiner Für-Dich-Seite schon einmal etwas gesehen, das Du lieber nicht gesehen hättest, oder eine andere schlechte Erfahrung mit der Plattform gemacht? Hier kannst Du uns davon erzählen:",
    type: "textarea",
    name: "freitext-erfahrungen-auf-tiktok",
  },
  {
    label:
      "Wie empfindest Du TikToks Empfehlungsalgorithmus im Vergleich mit anderen Plattformen (z.B. YouTube oder Instagram)?",
    name: "bewertung-recommender-im-vergleich",
    type: "muiltiple-radio-groups",
    choices: [
      [
        {
          label: "1 = Weniger abwechslungsreich",
          value: "antwort-1-1",
        },
        {
          label: "2",
          value: "antwort-1-2",
        },
        {
          label: "3",
          value: "antwort-1-3",
        },
        {
          label: "4",
          value: "antwort-1-4",
        },
        {
          label: "5",
          value: "antwort-1-5",
        },
        {
          label: "6",
          value: "antwort-1-6",
        },
        {
          label: "7",
          value: "antwort-1-7",
        },
        {
          label: "8",
          value: "antwort-1-8",
        },
        {
          label: "9",
          value: "antwort-1-9",
        },
        {
          label: "10 = abwechslungsreicher",
          value: "antwort-1-10",
        },
      ],
      [
        {
          label: "1 = Weniger dynamisch",
          value: "antwort-2-1",
        },
        {
          label: "2",
          value: "antwort-2-2",
        },
        {
          label: "3",
          value: "antwort-2-3",
        },
        {
          label: "4",
          value: "antwort-2-4",
        },
        {
          label: "5",
          value: "antwort-2-5",
        },
        {
          label: "6",
          value: "antwort-2-6",
        },
        {
          label: "7",
          value: "antwort-2-7",
        },
        {
          label: "8",
          value: "antwort-2-8",
        },
        {
          label: "9",
          value: "antwort-2-9",
        },
        {
          label: "10 = dynamischer",
          value: "antwort-2-10",
        },
      ],
      [
        {
          label: "1 = Weniger persönlich",
          value: "antwort-3-1",
        },
        {
          label: "2",
          value: "antwort-3-2",
        },
        {
          label: "3",
          value: "antwort-3-3",
        },
        {
          label: "4",
          value: "antwort-3-4",
        },
        {
          label: "5",
          value: "antwort-3-5",
        },
        {
          label: "6",
          value: "antwort-3-6",
        },
        {
          label: "7",
          value: "antwort-3-7",
        },
        {
          label: "8",
          value: "antwort-3-8",
        },
        {
          label: "9",
          value: "antwort-3-9",
        },
        {
          label: "10 = persönlicher",
          value: "antwort-3-10",
        },
      ],
    ],
  },
  {
    label:
      "Wenn Du uns noch etwas zu unserem Projekt oder diesem Fragebogen mitteilen möchtest, kannst Du dies hier tun:",
    type: "textarea",
    name: "freitext-feedback-abschluss",
  },
];
